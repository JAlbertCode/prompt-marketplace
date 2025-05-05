import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { burnCredits, hasEnoughCredits } from '@/lib/credits';
import { getModelById, calculatePromptCreditCost } from '@/lib/models/modelRegistry';

/**
 * POST /api/webhooks/n8n/[flowId]
 * 
 * Flow-specific webhook endpoint for n8n
 * Allows direct execution of a specific flow with variable inputs
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { flowId: string } }
) {
  try {
    // Get the flow ID from the URL
    const { flowId } = params;
    if (!flowId) {
      return NextResponse.json({ error: 'Flow ID is required' }, { status: 400 });
    }
    
    // Get the API key from the Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }
    
    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Validate the API key and get the associated user
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });
    
    if (!apiKeyRecord || !apiKeyRecord.active) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }
    
    // Get user ID from the API key
    const userId = apiKeyRecord.userId;
    
    // Find the flow
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      include: {
        steps: {
          include: {
            prompt: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });
    
    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }
    
    // Check if user has access to the flow
    const userHasAccess = flow.creatorId === userId || flow.public || 
      await prisma.flowUnlock.findFirst({
        where: {
          userId,
          flowId
        }
      });
    
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Access denied to this flow' }, { status: 403 });
    }
    
    // Parse any input variables from the request body
    const inputVariables = await req.json();
    
    // Calculate total cost for all steps
    let totalCost = 0;
    const stepCosts = [];
    
    for (const step of flow.steps) {
      // Use provided model override or the step's configured model
      const modelId = inputVariables.modelId || step.model || 'gpt-4o';
      const promptId = step.promptId;
      
      // Get prompt details
      const prompt = step.prompt;
      if (!prompt) continue;
      
      // Calculate prompt length
      let content = prompt.content || '';
      let systemPrompt = prompt.systemPrompt || '';
      
      // Apply variable substitutions if any are provided
      if (inputVariables && typeof inputVariables === 'object') {
        for (const [key, value] of Object.entries(inputVariables)) {
          if (typeof value === 'string') {
            const placeholder = `{{${key}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), value);
            systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), value);
          }
        }
      }
      
      const totalLength = content.length + systemPrompt.length;
      const promptLength = totalLength < 1500 ? 'short' : totalLength < 6000 ? 'medium' : 'long';
      
      // Calculate step cost
      const stepCost = calculatePromptCreditCost(
        modelId, 
        promptLength as any, 
        prompt.creatorFee || 0
      );
      
      totalCost += stepCost;
      stepCosts.push({
        stepId: step.id,
        modelId,
        promptId,
        cost: stepCost,
        promptLength,
        processedContent: content,
        processedSystemPrompt: systemPrompt
      });
    }
    
    // Check if user has enough credits for the entire flow
    const hasCredits = await hasEnoughCredits(userId, totalCost);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits for flow execution',
        requiredCredits: totalCost,
        stepCosts: stepCosts.map(({ stepId, modelId, cost, promptLength }) => ({ 
          stepId, modelId, cost, promptLength 
        }))
      }, { status: 402 });
    }
    
    // Execute each step and burn credits
    const stepResults = [];
    let previousOutput = null;
    
    for (const stepCost of stepCosts) {
      const step = flow.steps.find(s => s.id === stepCost.stepId);
      if (!step) continue;
      
      // Process any step-to-step connections for chaining
      // Replace {{previousOutput}} with the output from the previous step
      let content = stepCost.processedContent;
      let systemPrompt = stepCost.processedSystemPrompt;
      
      if (previousOutput !== null) {
        content = content.replace(/{{previousOutput}}/g, previousOutput);
        systemPrompt = systemPrompt.replace(/{{previousOutput}}/g, previousOutput);
      }
      
      // Burn credits for this step
      const burnSuccess = await burnCredits({
        userId,
        modelId: stepCost.modelId,
        promptLength: stepCost.promptLength as any,
        promptText: content + systemPrompt,
        creatorId: step.prompt?.creatorId || null,
        creatorFeePercentage: step.prompt?.creatorFee || 0,
        flowId,
        itemType: 'flow',
        itemId: step.id,
        source: 'n8n_api' // Tag as coming from n8n for automation bonus
      });
      
      if (!burnSuccess) {
        return NextResponse.json({ 
          error: 'Failed to process credits for flow step', 
          stepId: step.id
        }, { status: 500 });
      }
      
      // Run the model for this step
      // In a real implementation, this would call the model API
      const model = getModelById(stepCost.modelId);
      
      // Simulate a response
      const response = `This is a simulated response for step ${step.id} using ${model?.displayName || stepCost.modelId}.`;
      previousOutput = response;
      
      stepResults.push({
        stepId: step.id,
        model: model?.displayName || stepCost.modelId,
        response,
        credits: stepCost.cost
      });
    }
    
    // Log the flow execution
    await prisma.flowRun.create({
      data: {
        userId,
        flowId,
        cost: totalCost,
        steps: {
          create: stepCosts.map(stepCost => ({
            stepId: stepCost.stepId,
            model: stepCost.modelId,
            cost: stepCost.cost
          }))
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      flow: flow.title,
      totalCredits: totalCost,
      steps: stepResults,
      finalOutput: previousOutput // The output of the last step
    });
  } catch (error) {
    console.error('Error executing flow via webhook:', error);
    return NextResponse.json({ 
      error: 'Failed to execute flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
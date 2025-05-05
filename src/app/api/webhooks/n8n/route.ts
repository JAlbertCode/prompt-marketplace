import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { burnCredits, hasEnoughCredits } from '@/lib/credits';
import { getModelById, calculatePromptCreditCost } from '@/lib/models/modelRegistry';

/**
 * POST /api/webhooks/n8n
 * 
 * Webhook endpoint for n8n to run prompts/flows through PromptFlow API
 * Requires API key authentication
 */
export async function POST(req: NextRequest) {
  try {
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
    
    // Parse the request body
    const body = await req.json();
    const { promptId, modelId, promptText, systemPrompt, flowId } = body;
    
    // Validate required fields
    if (!modelId || (!promptId && !promptText)) {
      return NextResponse.json({ 
        error: 'Missing required fields: modelId and either promptId or promptText are required' 
      }, { status: 400 });
    }
    
    // Handle flow execution if flowId is provided
    if (flowId) {
      return await handleFlowExecution(userId, flowId, body);
    }
    
    // Determine prompt length
    let promptLength = 'medium';
    if (promptText) {
      const charCount = promptText.length + (systemPrompt?.length || 0);
      promptLength = charCount < 1500 ? 'short' : charCount < 6000 ? 'medium' : 'long';
    }
    
    // Get prompt details if promptId is provided
    let creatorId = null;
    let creatorFeePercentage = 0;
    
    if (promptId) {
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { 
          creatorId: true,
          creatorFee: true,
          content: true,
          systemPrompt: true
        }
      });
      
      if (prompt) {
        creatorId = prompt.creatorId;
        creatorFeePercentage = prompt.creatorFee || 0;
        
        // Use prompt content if no promptText was provided
        if (!promptText) {
          // Calculate length based on the prompt's content
          const promptContent = prompt.content || '';
          const systemContent = prompt.systemPrompt || systemPrompt || '';
          const totalLength = promptContent.length + systemContent.length;
          
          promptLength = totalLength < 1500 ? 'short' : totalLength < 6000 ? 'medium' : 'long';
        }
      }
    }
    
    // Calculate the required credits
    const requiredCredits = calculatePromptCreditCost(modelId, promptLength as any, creatorFeePercentage);
    
    // Check if the user has enough credits
    const hasCredits = await hasEnoughCredits(userId, requiredCredits);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        requiredCredits,
        promptLength
      }, { status: 402 });
    }
    
    // Burn the credits
    const success = await burnCredits({
      userId,
      modelId,
      promptLength: promptLength as any, 
      promptText,
      creatorId,
      creatorFeePercentage,
      itemType: 'prompt',
      itemId: promptId || null,
      source: 'n8n_api' // Tag as coming from n8n for automation bonus
    });
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to process credits', 
      }, { status: 500 });
    }
    
    // Run the actual AI model - this would call the appropriate model API
    // For this implementation, we'll just mock a response
    // In a real implementation, this would use the model API
    const model = getModelById(modelId);
    
    return NextResponse.json({
      success: true,
      model: model?.displayName || modelId,
      response: `This is a simulated response for the n8n webhook. In a real implementation, this would be the output from the ${model?.displayName || modelId} model.`,
      credits: {
        used: requiredCredits,
        promptLength
      }
    });
  } catch (error) {
    console.error('Error processing n8n webhook:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle flow execution for n8n webhook
 */
async function handleFlowExecution(
  userId: string, 
  flowId: string, 
  params: any
) {
  try {
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
    
    // Calculate total cost for all steps
    let totalCost = 0;
    const stepCosts = [];
    
    for (const step of flow.steps) {
      const modelId = step.model || params.modelId || 'gpt-4o'; // Default to gpt-4o
      const promptId = step.promptId;
      
      // Get prompt details
      const prompt = step.prompt;
      if (!prompt) continue;
      
      // Calculate prompt length
      const content = prompt.content || '';
      const systemPrompt = prompt.systemPrompt || '';
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
        promptLength
      });
    }
    
    // Check if user has enough credits for the entire flow
    const hasCredits = await hasEnoughCredits(userId, totalCost);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits for flow execution',
        requiredCredits: totalCost,
        stepCosts
      }, { status: 402 });
    }
    
    // Execute each step and burn credits
    const stepResults = [];
    
    for (const stepCost of stepCosts) {
      const step = flow.steps.find(s => s.id === stepCost.stepId);
      if (!step) continue;
      
      // Burn credits for this step
      const burnSuccess = await burnCredits({
        userId,
        modelId: stepCost.modelId,
        promptLength: stepCost.promptLength as any,
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
      
      stepResults.push({
        stepId: step.id,
        model: model?.displayName || stepCost.modelId,
        response: `This is a simulated response for step ${step.id} using ${model?.displayName || stepCost.modelId}.`,
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
      steps: stepResults
    });
  } catch (error) {
    console.error('Error executing flow:', error);
    return NextResponse.json({ 
      error: 'Failed to execute flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
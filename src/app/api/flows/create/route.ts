import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to create a new flow in the Supabase database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      steps,
      isPublished,
      unlockPrice,
      userId,
      creatorId
    } = body;
    
    // Validate required fields
    if (!title || !Array.isArray(steps) || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    console.log("Creating flow with data:", { 
      title, 
      steps: steps.length, 
      userId
    });
    
    // Insert the flow into Supabase
    const { data: flowData, error: flowError } = await supabase
      .from('flows')
      .insert({
        title,
        description: description || null,
        is_public: isPublished || false,
        price: unlockPrice || 0,
        user_id: userId,
        creator_id: creatorId || userId
      })
      .select();
    
    if (flowError) {
      console.error("Error creating flow:", flowError);
      return NextResponse.json({ 
        success: false, 
        error: flowError.message 
      }, { status: 500 });
    }
    
    const flowId = flowData[0].id;
    console.log("Successfully created flow:", flowId);
    
    // Now create the flow steps
    if (steps.length > 0) {
      const flowSteps = steps.map((step, index) => ({
        flow_id: flowId,
        prompt_id: step.promptId,
        step_order: index,
        input_mapping: step.inputMapping ? JSON.stringify(step.inputMapping) : null
      }));
      
      const { error: stepsError } = await supabase
        .from('flow_steps')
        .insert(flowSteps);
      
      if (stepsError) {
        console.error("Error creating flow steps:", stepsError);
        // We don't want to fail the whole operation if steps fail,
        // but we should log the error and return information to the client
        return NextResponse.json({ 
          success: true, 
          warning: "Flow created but steps could not be added",
          flowId,
          flow: flowData[0]
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      flowId,
      flow: flowData[0]
    });
  } catch (error) {
    console.error("Error in flow creation:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Server error" 
    }, { status: 500 });
  }
}
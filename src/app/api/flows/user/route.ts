import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to get flows for a specific user
 */
export async function GET(request: Request) {
  try {
    // Extract userId from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing userId parameter" 
      }, { status: 400 });
    }
    
    console.log("Getting flows for user:", userId);
    
    // Query flows from Supabase
    const { data: flows, error: flowsError } = await supabase
      .from('flows')
      .select(`
        id,
        title,
        description,
        is_public,
        price,
        created_at,
        updated_at,
        user_id,
        creator_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (flowsError) {
      console.error("Error fetching flows:", flowsError);
      return NextResponse.json({ 
        success: false, 
        error: flowsError.message 
      }, { status: 500 });
    }
    
    // Get flow IDs to fetch steps
    const flowIds = flows.map(flow => flow.id);
    
    // If no flows found, return empty array
    if (flowIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        flows: [] 
      });
    }
    
    // Get steps for all flows
    const { data: steps, error: stepsError } = await supabase
      .from('flow_steps')
      .select(`
        id,
        flow_id,
        prompt_id,
        step_order,
        input_mapping,
        prompts (
          id,
          title,
          model_id
        )
      `)
      .in('flow_id', flowIds)
      .order('step_order', { ascending: true });
    
    if (stepsError) {
      console.error("Error fetching flow steps:", stepsError);
      // We'll still return the flows, just without steps
    }
    
    // Process the flows with their steps
    const processedFlows = flows.map(flow => {
      // Get steps for this flow
      const flowSteps = steps ? steps.filter(step => step.flow_id === flow.id) : [];
      
      // Format the steps
      const formattedSteps = flowSteps.map(step => ({
        id: step.id,
        promptId: step.prompt_id,
        order: step.step_order,
        name: step.prompts?.title || `Step ${step.step_order + 1}`,
        model: step.prompts?.model_id,
        inputMapping: tryParseJson(step.input_mapping, {})
      }));
      
      // Format the flow
      return {
        id: flow.id,
        title: flow.title,
        description: flow.description || "",
        isPublic: flow.is_public,
        price: flow.price || 0,
        userId: flow.user_id,
        creatorId: flow.creator_id,
        createdAt: flow.created_at,
        updatedAt: flow.updated_at,
        steps: formattedSteps
      };
    });
    
    console.log(`Found ${processedFlows.length} flows for user ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      flows: processedFlows 
    });
  } catch (error) {
    console.error("Error in get user flows API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Server error" 
    }, { status: 500 });
  }
}

/**
 * Helper function to safely parse JSON strings
 */
function tryParseJson(jsonString: string | null, defaultValue: any) {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}
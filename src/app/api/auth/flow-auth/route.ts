import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API route for authentication flows
 * This separates authentication logic from client components
 */
export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();
    
    switch (action) {
      case 'getUserFlows':
        return await getUserFlows(payload);
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in flow auth API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Get flows for a user from Supabase
 */
async function getUserFlows(payload: { userId: string }) {
  const { userId } = payload;
  
  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }
  
  console.log("API: Getting flows for user:", userId);
  
  try {
    // For development, if no flows exist, return empty array instead of error
    // Query flows from Supabase
    const { data, error } = await supabase
      .from('flows')
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        is_public,
        price,
        user_id,
        users (id, name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase error fetching flows:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    const flowIds = data.map(flow => flow.id);
    
    // Get flow steps for all flows
    let flowSteps = [];
    if (flowIds.length > 0) {
      const { data: stepsData, error: stepsError } = await supabase
        .from('flow_steps')
        .select(`
          id,
          flow_id,
          step_order,
          prompt_id,
          prompts (id, name, description, model_id)
        `)
        .in('flow_id', flowIds);
      
      if (!stepsError && stepsData) {
        flowSteps = stepsData;
      }
    }
    
    // Format the data for the frontend
    const formattedFlows = data.map(flow => {
      const steps = flowSteps
        .filter(step => step.flow_id === flow.id)
        .map(step => ({
          id: step.id,
          name: step.prompts?.name || `Step ${step.step_order}`,
          order: step.step_order,
          promptId: step.prompt_id,
          model: step.prompts?.model_id || 'unknown'
        }))
        .sort((a, b) => a.order - b.order);
        
      return {
        id: flow.id,
        title: flow.title || 'Untitled Flow',
        description: flow.description || '',
        author: flow.users?.name || 'Unknown',
        authorId: flow.user_id,
        steps,
        isFavorite: false, // We'd need to check user favorites separately
        totalCreditCost: 0, // Calculate based on steps' models
        unlockPrice: flow.price || 0,
        createdAt: flow.created_at,
        isPrivate: !flow.is_public,
      };
    });
    
    return NextResponse.json(formattedFlows);
  } catch (error) {
    console.error("Error getting user flows:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
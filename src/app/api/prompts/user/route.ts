import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to get prompts for a specific user
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
    
    console.log("Getting prompts for user:", userId);
    
    // Query prompts from Supabase
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching prompts:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    // Process the prompts
    const processedPrompts = data.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      systemPrompt: prompt.system_prompt,
      model: prompt.model_id,
      creditCost: prompt.credit_cost,
      creatorFee: prompt.creator_fee,
      unlockFee: prompt.unlock_fee,
      isPrivate: prompt.is_private,
      capabilities: tryParseJson(prompt.capabilities, ['text']),
      outputType: prompt.output_type || 'text',
      tags: tryParseJson(prompt.tags, []),
      inputFields: tryParseJson(prompt.input_fields, []),
      createdAt: prompt.created_at,
      updatedAt: prompt.updated_at,
      creatorId: prompt.creator_id
    }));
    
    console.log(`Found ${processedPrompts.length} prompts for user ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      prompts: processedPrompts 
    });
  } catch (error) {
    console.error("Error in get user prompts API:", error);
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
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API endpoint to create a new prompt in the Supabase database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      systemPrompt, 
      model,
      inputFields, 
      creatorFee,
      unlockFee,
      creditCost,
      isPrivate,
      capabilities,
      outputType,
      userId
    } = body;
    
    // Validate required fields
    if (!title || !systemPrompt || !model || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    console.log("Creating prompt with data:", { 
      title, 
      model, 
      userId,
      creditCost
    });
    
    // Insert the prompt into Supabase
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title,
        description: description || null,
        system_prompt: systemPrompt,
        model_id: model,
        input_fields: inputFields ? JSON.stringify(inputFields) : null,
        creator_fee: creatorFee || 0,
        unlock_fee: unlockFee || 0,
        credit_cost: creditCost || 0,
        is_private: isPrivate || false,
        capabilities: capabilities ? JSON.stringify(capabilities) : JSON.stringify(['text']),
        output_type: outputType || 'text',
        creator_id: userId,
        // For tags and other fields, add them here if they're included in the body
        tags: body.tags ? JSON.stringify(body.tags) : null
      })
      .select();
    
    if (error) {
      console.error("Error creating prompt:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log("Successfully created prompt:", data[0].id);
    
    return NextResponse.json({ 
      success: true, 
      promptId: data[0].id,
      prompt: data[0]
    });
  } catch (error) {
    console.error("Error in prompt creation:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Server error" 
    }, { status: 500 });
  }
}
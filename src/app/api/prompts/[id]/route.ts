import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInitialPrompts } from '@/data/defaultPrompts';

/**
 * GET endpoint to fetch a prompt by ID
 * This serves as a server-side fallback when the client-side store fails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const promptId = params.id;
  
  if (!promptId) {
    return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
  }
  
  try {
    // First check if this is a default prompt
    const defaultPrompts = getInitialPrompts();
    const defaultPrompt = defaultPrompts.find(p => p.id === promptId);
    
    if (defaultPrompt) {
      console.log(`[API] Found default prompt for ID: ${promptId}`);
      return NextResponse.json(defaultPrompt);
    }
    
    // If not a default prompt, check the database
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error) {
      console.error(`[API] Error fetching prompt ${promptId}:`, error);
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    if (!data) {
      console.log(`[API] No prompt found for ID: ${promptId}`);
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    console.log(`[API] Successfully retrieved prompt: ${data.title}`);
    
    // Format the data to match the client-side store format
    const formattedPrompt = {
      id: data.id,
      title: data.title || 'Untitled Prompt',
      description: data.description || '',
      systemPrompt: data.system_prompt || '',
      model: data.model_id || 'gpt-4o',
      inputFields: data.input_schema?.fields || [],
      capabilities: data.capabilities || ['text'],
      creatorId: data.user_id,
      creatorName: data.creator_name || 'Unknown User',
      createdAt: data.created_at,
      tags: data.tags || [],
      visibility: data.is_public ? 'public' : 'private',
      creditCost: data.credit_cost || 0,
      outputType: data.output_type || 'text',
      exampleOutput: data.example_output || null,
      exampleImageUrl: data.example_image_url || null
    };
    
    return NextResponse.json(formattedPrompt);
  } catch (error) {
    console.error('[API] Unexpected error fetching prompt:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
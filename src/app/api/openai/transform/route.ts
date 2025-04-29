import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!body.image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const model = body.model || 'gpt-4o';
    const imageBase64 = body.image;
    
    // Extract the style from the original prompt
    let targetStyle = '';
    if (body.prompt.includes('into a')) {
      const match = body.prompt.match(/into a\s+([^\.]+?)\s+(character|style)/i);
      if (match && match[1]) {
        targetStyle = match[1].trim();
      }
    } else if (body.prompt.includes('into')) {
      const match = body.prompt.match(/into\s+([^\.]+?)\s+(style)/i);
      if (match && match[1]) {
        targetStyle = match[1].trim();
      }
    } else {
      // Fallback - extract any style mentioned
      const styleMatch = body.prompt.match(/(in|as)\s+([^\.]+?)\s+style/i);
      if (styleMatch && styleMatch[2]) {
        targetStyle = styleMatch[2].trim();
      } else {
        // Last resort
        targetStyle = 'artistic';
      }
    }
    
    console.log(`Extracted style: ${targetStyle}`);
    
    // Step 1: Ask GPT-4o to describe the image in detail
    console.log(`Asking GPT-4o to describe the image...`);
    
    const descriptionPrompt = `
    Please describe the image you see in great detail. Focus on:
    1. If there are people: their appearance, clothing, pose, facial features
    2. If it's a scene: the setting, objects, composition
    3. Colors, lighting, and any distinctive elements
    4. Background details
    
    Be specific and comprehensive, as your description will be used to create a transformed version.
    `;
    
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: descriptionPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      })
    });
    
    if (!descriptionResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get image description' },
        { status: descriptionResponse.status }
      );
    }
    
    const descriptionData = await descriptionResponse.json();
    const imageDescription = descriptionData.choices?.[0]?.message?.content || '';
    
    if (!imageDescription) {
      return NextResponse.json(
        { error: 'Could not generate image description' },
        { status: 500 }
      );
    }
    
    console.log('Generated image description:', imageDescription);
    
    // Step 2: Create DALL-E prompt that includes both style and image details
    
    // Extract key elements from the description
    // Look for specific patterns based on content type
    let keyElements = '';
    
    // If description mentions a person
    if (imageDescription.toLowerCase().includes('person') || 
        imageDescription.toLowerCase().includes('man') || 
        imageDescription.toLowerCase().includes('woman') || 
        imageDescription.toLowerCase().includes('wearing')) {
      
      // Extract clothing and appearance details
      const appearanceMatch = imageDescription.match(/(wearing|dressed in|in a)([^\.]+)/i);
      if (appearanceMatch && appearanceMatch[2]) {
        keyElements += appearanceMatch[2].trim() + ', ';
      }
      
      // Extract pose
      const poseMatch = imageDescription.match(/(standing|sitting|posing|positioned)([^\.]+)/i);
      if (poseMatch && poseMatch[2]) {
        keyElements += poseMatch[2].trim() + ', ';
      }
      
      // Extract background
      const bgMatch = imageDescription.match(/(background|behind|setting)([^\.]+)/i);
      if (bgMatch && bgMatch[2]) {
        keyElements += 'with ' + bgMatch[2].trim();
      }
    } else {
      // For non-person images, extract some general elements
      const sceneMatch = imageDescription.match(/(shows|displays|features|contains)([^\.]+)/i);
      if (sceneMatch && sceneMatch[2]) {
        keyElements = sceneMatch[2].trim();
      } else {
        // Use first sentence if no clear elements
        keyElements = imageDescription.split('.')[0];
      }
    }
    
    // Fallback to first 100 chars if extraction failed
    if (!keyElements || keyElements.length < 10) {
      keyElements = imageDescription.substring(0, 100);
    }
    
    // Create the DALL-E prompt with both style and content
    const dallePrompt = `
    Create a ${targetStyle}-style image of ${keyElements}.
    
    The image must maintain the composition, pose, and key elements of the original while applying 
    the distinctive visual characteristics of ${targetStyle} style. This is a transformation of an existing image,
    not a creation from scratch.
    `;
    
    console.log('DALL-E prompt:', dallePrompt);
    
    // Step 3: Generate the transformed image with DALL-E
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: dallePrompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      })
    });
    
    if (!dalleResponse.ok) {
      // Try a simpler prompt if the first one failed
      console.log('First DALL-E attempt failed, trying with simpler prompt...');
      
      // Simplified fallback prompt with less detail but still keeping core elements
      const fallbackPrompt = `Create a ${targetStyle} style version of: ${imageDescription.substring(0, 100)}`;
      
      const retryResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: fallbackPrompt,
          model: 'dall-e-3',
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        })
      });
      
      if (!retryResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to generate transformed image' },
          { status: retryResponse.status }
        );
      }
      
      const retryData = await retryResponse.json();
      const fallbackImageUrl = retryData.data?.[0]?.url;
      
      if (!fallbackImageUrl) {
        return NextResponse.json(
          { error: 'No image URL returned from DALL-E API' },
          { status: 500 }
        );
      }
      
      console.log('Successfully generated image with fallback prompt');
      return NextResponse.json({ imageUrl: fallbackImageUrl });
    }
    
    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data?.[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL returned from DALL-E API' },
        { status: 500 }
      );
    }
    
    console.log('Successfully generated transformed image');
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Error in transform API route:', error);
    
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
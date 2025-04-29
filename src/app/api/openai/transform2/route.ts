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
    const promptText = body.prompt.substring(0, 1000); // Limit prompt length

    console.log(`Calling OpenAI API for image transformation with model: ${model}`);
    
    // Step 1: Send to GPT-4o to analyze the image
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: promptText
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ];
    
    // Construct request payload for GPT-4o
    const gptRequestPayload = {
      model: model,
      messages: messages,
      max_tokens: 1024,
    };
    
    console.log('GPT request payload:', JSON.stringify({
      model: model,
      messages: [{ role: "user", content: [{ type: "text", text: promptText }, { type: "image_url" }] }],
      max_tokens: 1024,
    }, null, 2));
    
    // Call the GPT-4o API for image analysis
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(gptRequestPayload)
    });
    
    if (!gptResponse.ok) {
      let errorMessage = `OpenAI API Error: ${gptResponse.status}`;
      try {
        const errorData = await gptResponse.json();
        console.error('OpenAI API error details:', JSON.stringify(errorData, null, 2));
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing OpenAI error response:', e);
      }
      
      console.error('OpenAI API error:', errorMessage);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: gptResponse.status }
      );
    }
    
    const data = await gptResponse.json();
    
    // Extract the text response from GPT-4o
    const responseText = data.choices?.[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json(
        { error: 'No text response returned from OpenAI API' },
        { status: 500 }
      );
    }
    
    console.log('GPT-4o full response:', responseText);
    
    // Step 2: Extract the image description from GPT-4o's response
    
    // Extract the style from the original prompt
    const originalStyle = body.prompt.split('into ')[1]?.split(' style')[0] || 
                         body.prompt.split('into a ')[1]?.split(' character')[0] || 
                         'artistic';
    
    console.log('Identified style:', originalStyle);
    
    // Extract description from GPT's response
    let imageDescription = '';
    
    // Try different patterns to find any description of the image
    const descriptionPatterns = [
      // Look for explicit descriptions
      /(?:I see|I can see|The image shows|In this image|The photo shows)([^.]+\.[^.]+)/i,
      // Look for mentions of people
      /(?:person|man|woman|child|figure|portrait|individual)([^.]+)/i,
      // Look for mentions of scenes or objects
      /(?:scene|picture|photo|image|shows|displays|contains)([^.]+)/i
    ];
    
    for (const pattern of descriptionPatterns) {
      const match = responseText.match(pattern);
      if (match && match[1] && match[1].trim().length > 5) {
        imageDescription = match[1].trim();
        console.log('Extracted image description:', imageDescription);
        break;
      }
    }
    
    // Step 3: Create a DALL-E prompt that preserves both style and image content
    let dallePrompt = '';
    
    if (imageDescription) {
      // If we have a description, use it to guide DALL-E
      dallePrompt = `Create a ${originalStyle}-style version of ${imageDescription}. The image should have all the characteristic elements of ${originalStyle} style while maintaining the original subject matter, poses, and composition.`;
    } else {
      // Fallback to style-only if we couldn't extract a description
      dallePrompt = `Create an artistic image in the style of ${originalStyle}. The image should feature the distinctive visual elements of ${originalStyle} style.`;
    }
    
    console.log('DALL-E prompt:', dallePrompt);
    
    // Step 4: Call DALL-E to generate the transformed image
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
      let errorMessage = `DALL-E API Error: ${dalleResponse.status}`;
      try {
        const errorData = await dalleResponse.json();
        console.error('DALL-E API error details:', JSON.stringify(errorData, null, 2));
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
        
        // Retry with a simpler prompt
        console.log('First attempt failed. Retrying with simplified prompt...');
        
        // Try to find any subject information in GPT's response
        let subjectInfo = '';
        const subjectPatterns = [
          /(?:person|man|woman|individual|figure)([^.]+)/i,
          /(?:wearing|dressed in|has|with)([^.]+)/i,
          /(?:shows|displaying|depicts|contains)([^.]+)/i
        ];
        
        for (const pattern of subjectPatterns) {
          const match = responseText.match(pattern);
          if (match && match[1] && match[1].trim().length > 3) {
            subjectInfo = match[1].trim();
            console.log('Found subject info:', subjectInfo);
            break;
          }
        }
        
        // Create a more direct prompt
        const simplifiedPrompt = subjectInfo 
          ? `Create a ${originalStyle} style image of a ${subjectInfo}. The result should look authentic to ${originalStyle} aesthetics.` 
          : `Create an authentic ${originalStyle} style image with characteristic visual elements of that style.`;
        
        console.log('Simplified retry prompt:', simplifiedPrompt);
        
        const retryResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            prompt: simplifiedPrompt,
            model: 'dall-e-3',
            n: 1,
            size: '1024x1024',
            response_format: 'url'
          })
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const retryImageUrl = retryData.data?.[0]?.url;
          
          if (retryImageUrl) {
            console.log('Successfully generated image with simplified prompt');
            return NextResponse.json({ imageUrl: retryImageUrl });
          }
        }
        
      } catch (e) {
        console.error('Error parsing DALL-E error response:', e);
      }
      
      console.error('DALL-E API error:', errorMessage);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: dalleResponse.status }
      );
    }
    
    const dalleData = await dalleResponse.json();
    
    // Extract the image URL from DALL-E response
    const imageUrl = dalleData.data?.[0]?.url;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL returned from OpenAI API' },
        { status: 500 }
      );
    }
    
    console.log('Successfully generated image transformation with GPT-4o and DALL-E');
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error in OpenAI transform API route:', error);
    
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
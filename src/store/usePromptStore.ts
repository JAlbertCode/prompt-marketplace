import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Prompt, InputField } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PromptState {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => string;
  getPrompt: (id: string) => Prompt | undefined;
  removePrompt: (id: string) => void;
  resetStore: () => void;
  getPublicPrompts: () => Prompt[];
  getUserPrompts: (userId: string) => Prompt[];
}

const initialPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Blog Post Generator',
    description: 'Generate a full blog post on any topic with proper structure',
    systemPrompt: 'You are a professional blog writer. Create a well-structured blog post with an introduction, main sections with subheadings, and a conclusion. The blog post should be informative, engaging, and between 800-1000 words.',
    inputFields: [
      {
        id: 'topic',
        label: 'Topic',
        placeholder: 'Enter the blog topic',
        required: true
      },
      {
        id: 'tone',
        label: 'Tone',
        placeholder: 'Professional, casual, humorous, etc.',
        required: false
      },
      {
        id: 'targetAudience',
        label: 'Target Audience',
        placeholder: 'Who is this blog post for?',
        required: false
      }
    ],
    model: 'sonar-medium-chat',
    creditCost: 50,
    createdAt: Date.now(),
    isPrivate: false,
    capabilities: ['text'],
    exampleOutput: "# The Future of Renewable Energy\n\n## Introduction\nAs the global community grapples with the challenges of climate change, renewable energy has emerged as a critical solution. This blog explores the latest trends, innovations, and future prospects of renewable energy technologies.\n\n## Current Landscape\nRenewable energy sources now account for over 26% of global electricity generation, with solar and wind leading the growth...\n\n[Example output continues]"
  },
  {
    id: '2',
    title: 'Code Explainer',
    description: 'Get a detailed explanation of any code snippet',
    systemPrompt: 'You are an expert programming tutor. Explain the provided code snippet in detail, breaking down what each part does, identifying patterns or anti-patterns, and suggesting possible improvements where applicable. Use a clear, educational tone.',
    inputFields: [
      {
        id: 'code',
        label: 'Code Snippet',
        placeholder: 'Paste your code here',
        required: true,
        type: 'textarea'
      },
      {
        id: 'language',
        label: 'Programming Language',
        placeholder: 'e.g., JavaScript, Python, etc.',
        required: true
      },
      {
        id: 'experienceLevel',
        label: 'Your Experience Level',
        placeholder: 'Beginner, Intermediate, Advanced',
        required: false
      }
    ],
    model: 'sonar-medium-chat',
    creditCost: 30,
    createdAt: Date.now(),
    capabilities: ['text'],
    exampleOutput: "# Analysis of React useEffect Hook Code\n\nThe code snippet you've shared demonstrates a common pattern for data fetching in React using the useEffect hook. Let me break it down:\n\n```jsx\nuseEffect(() => {\n  const fetchData = async () => {\n    setLoading(true);\n    try {\n      const response = await api.get('/users');\n      setUsers(response.data);\n    } catch (error) {\n      setError(error.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  fetchData();\n}, []);\n```\n\n## Key Components:\n\n1. The useEffect hook is called with two arguments:\n   - A callback function (the effect)\n   - A dependency array (empty in this case)\n\n2. Inside the effect, there's an async function declaration..."
  },
  {
    id: '3',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions for e-commerce',
    systemPrompt: 'You are a professional e-commerce copywriter. Write an engaging, persuasive product description that highlights features, benefits, and unique selling points. The description should be SEO-friendly and compelling enough to convert browsers into buyers.',
    inputFields: [
      {
        id: 'product',
        label: 'Product Name',
        placeholder: 'Enter the product name',
        required: true
      },
      {
        id: 'features',
        label: 'Key Features',
        placeholder: 'List the main features of the product',
        required: true
      },
      {
        id: 'targetMarket',
        label: 'Target Market',
        placeholder: 'Who is this product for?',
        required: false
      },
      {
        id: 'pricePoint',
        label: 'Price Point',
        placeholder: 'Budget, Mid-range, Premium',
        required: false
      }
    ],
    model: 'sonar-small-online',
    creditCost: 25,
    createdAt: Date.now(),
    capabilities: ['text'],
    exampleOutput: "# Ultra Premium Noise-Cancelling Headphones XC-5000\n\nImmerse yourself in pure audio perfection with the revolutionary XC-5000 wireless headphones. Engineered for the discerning audiophile, these premium headphones combine cutting-edge noise cancellation technology with unparalleled sound quality.\n\n## Key Features That Set XC-5000 Apart:\n\n- **Advanced Adaptive Noise Cancellation** that intelligently adjusts to your environment, creating a personal oasis of sound in even the noisiest settings\n- **Studio-Quality Audio** with custom-tuned 40mm drivers delivering rich bass, crystal-clear highs, and perfectly balanced mid-tones\n- **All-Day Comfort** with memory foam ear cushions and adjustable lightweight design for extended listening sessions\n\nPerfect for frequent travelers, professionals working in distracting environments, or anyone who demands the ultimate sound experience without compromise.\n\nInvest in your sound journey today and experience music the way it was meant to be heard."
  },
  {
    id: '7',
    title: 'Image Prompt Writer',
    description: 'Create detailed prompts for text-to-image generation tools',
    systemPrompt: 'You are an expert at writing prompts for AI image generation tools. Create a detailed and visual description that can be used as input for DALL-E 3 or similar text-to-image generation tools. Be extremely specific about composition, lighting, colors, style, mood, and subject matter. DO NOT use bullet points or formatting - write a cohesive paragraph that describes exactly what the image should look like. The more specific detail, the better the resulting image will be when users take your output to an image generation tool.',
    inputFields: [
      {
        id: 'product',
        label: 'Subject',
        placeholder: 'Describe what you want to appear in the image',
        required: true
      },
      {
        id: 'style',
        label: 'Visual Style',
        placeholder: 'Professional, friendly, minimalist, etc.',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        placeholder: 'Who will be viewing this image?',
        required: false
      },
      {
        id: 'additionalDetails',
        label: 'Additional Details',
        placeholder: 'Any specific elements or technical details to include',
        required: false,
        type: 'textarea'
      }
    ],
    model: 'sonar-small-online',
    creditCost: 150,
    createdAt: Date.now(),
    capabilities: ['text'],
    exampleImageUrl: 'https://picsum.photos/seed/marketing1/1024/1024',
    exampleOutput: "A photorealistic marketing image featuring a premium smart water bottle with temperature control functionality. The sleek, stainless steel bottle is positioned prominently in the center of the frame on a minimalist white surface with subtle blue lighting. The bottle has a modern digital temperature display that emits a soft blue glow. Small water droplets are visible on the exterior of the bottle, suggesting coolness and freshness. The background features a smooth gradient from light blue to teal, creating a clean, high-tech atmosphere without distracting from the product. The lighting is bright and even with soft shadows that give the bottle a premium, professional appearance. There is negative space on the right side of the image where marketing text could be overlaid. The overall mood is refreshing, modern, and premium, targeted at health-conscious professionals."
  },
  {
    id: '8',
    title: 'Product Description Generator',
    description: 'Create detailed descriptions for product visualization',
    systemPrompt: 'You are a professional product photographer and visualization expert. Create a detailed description of how a product would be photographed professionally. Focus on lighting, angles, materials, and presentation that would make the product look appealing and realistic. Include specific details about studio setup, background, reflections, and shadows to achieve a professional product photography look. This is not for image generation, but to help users understand how to present their products professionally.',
    inputFields: [
      {
        id: 'productDescription',
        label: 'Product Description',
        placeholder: 'Describe the product in detail',
        required: true,
        type: 'textarea'
      },
      {
        id: 'environment',
        label: 'Environment',
        placeholder: 'Studio, lifestyle, outdoor, etc.',
        required: true
      },
      {
        id: 'angle',
        label: 'Camera Angle',
        placeholder: 'Front view, 3/4 view, top-down, etc.',
        required: false
      },
      {
        id: 'lighting',
        label: 'Lighting Style',
        placeholder: 'Soft, dramatic, natural, etc.',
        required: false
      }
    ],
    model: 'sonar-medium-chat',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['text'],
    exampleImageUrl: 'https://picsum.photos/seed/product1/1024/1024',
    exampleOutput: "A photorealistic image of a premium wireless gaming headset, shown from a slight 3/4 angle to display both the sleek ear cup design and the adjustable microphone. The headset features a matte black finish with subtle red LED accents along the ear cups and microphone tip. The product is displayed on a reflective black surface in a studio environment with professional lighting - a main key light from the front right creating a subtle highlight across the curves of the headset, and a rim light from behind creating a defining edge. The background features a gradient from dark gray to black, keeping the focus entirely on the product. The materials appear high-end with memory foam ear cushions visible, and the overall image has a slight depth of field with the front of the headset in perfect focus while the rear elements have a slight, appealing blur."
  },
  {
    id: '9',
    title: 'Brand Style Guide Creator',
    description: 'Generate written style guides for brand identity',
    systemPrompt: 'You are a brand identity specialist. Create a detailed written style guide that captures the essence of the brand described by the user. Focus on developing a cohesive visual language including color schemes (with exact hex codes), typography suggestions, imagery style, and overall aesthetic that aligns with the brand values and target audience. Include sections on logo usage, voice and tone for communications, and dos and don\'ts for brand applications.',
    inputFields: [
      {
        id: 'brandName',
        label: 'Brand Name',
        placeholder: 'Name of the brand',
        required: true
      },
      {
        id: 'industry',
        label: 'Industry',
        placeholder: 'What industry is the brand in?',
        required: true
      },
      {
        id: 'values',
        label: 'Brand Values',
        placeholder: 'Key values the brand represents',
        required: true
      },
      {
        id: 'audience',
        label: 'Target Audience',
        placeholder: 'Who is the brand trying to reach?',
        required: true
      },
      {
        id: 'aestheticPreference',
        label: 'Aesthetic Preference',
        placeholder: 'Modern, vintage, minimal, bold, etc.',
        required: false
      }
    ],
    model: 'sonar-medium-chat',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['text'],
    exampleImageUrl: 'https://picsum.photos/seed/moodboard1/1024/1024',
    exampleOutput: "A visual mood board for 'EcoLuxe', a sustainable luxury home goods brand. The mood board is arranged in a clean grid layout featuring a sophisticated color palette of deep emerald green, matte gold, crisp white, and warm taupe. The board includes close-up textures of natural materials: FSC-certified walnut wood grain, organic cotton weave, recycled brass with a brushed finish, and handmade ceramic with subtle imperfections. Typography examples show a primary serif font for headings that conveys timeless luxury, paired with a clean sans-serif for body text suggesting modern sustainability. Product photography samples feature minimalist compositions with soft natural lighting, showing sustainable luxury items in curated home environments with abundant plants and natural light. The overall aesthetic balances high-end design with environmental consciousness, appealing to affluent, eco-minded consumers who don't want to sacrifice quality or style for sustainability."
  },
  {
    id: '20',
    title: 'DALL-E Image Creator',
    description: 'Generate images with OpenAI\'s DALL-E 3 model',
    systemPrompt: 'You are using DALL-E 3, an advanced AI image generation model that can create detailed illustrations based on text descriptions. DALL-E 3 excels at creating photo-realistic images, artistic illustrations, and conceptual visualizations based on detailed prompts. This prompt will be sent directly to the OpenAI API for image generation.',
    inputFields: [
      {
        id: 'prompt',
        label: 'Detailed Image Description',
        placeholder: 'Describe the image you want to generate in detail',
        required: true,
        type: 'textarea'
      },
      {
        id: 'size',
        label: 'Image Size',
        placeholder: 'Select image dimensions',
        required: false,
        type: 'select',
        options: [
          '1024x1024 (Square)',
          '1024x1792 (Portrait)',
          '1792x1024 (Landscape)'
        ]
      },
      {
        id: 'style',
        label: 'Style',
        placeholder: 'Choose a style (optional)',
        required: false,
        type: 'select',
        options: [
          'Vivid',
          'Natural'
        ]
      }
    ],
    model: 'dall-e-3',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['image'],
    outputType: 'image',
    exampleImageUrl: 'https://picsum.photos/seed/dalle1/1024/1024'
  },
  {
    id: '21',
    title: 'Character Portrait Generator',
    description: 'Create detailed character portraits for games, stories, or concepts',
    systemPrompt: 'Generate a high-quality character portrait using DALL-E 3. The character description will be converted into an image that captures personality, attire, and physical appearance in a portrait-style composition that focuses on the face and upper body. Ideal for fictional characters, RPG characters, or concept art.',
    inputFields: [
      {
        id: 'characterDescription',
        label: 'Character Description',
        placeholder: 'Describe the character\'s appearance, attire, and personality',
        required: true,
        type: 'textarea'
      },
      {
        id: 'characterType',
        label: 'Character Type',
        placeholder: 'Select character type',
        required: false,
        type: 'select',
        options: [
          'Fantasy Hero',
          'Sci-Fi Character',
          'Historical Figure',
          'Modern Protagonist',
          'Villain/Antagonist',
          'Animal Character',
          'Robot/AI',
          'Mythological Being'
        ]
      },
      {
        id: 'artStyle',
        label: 'Art Style',
        placeholder: 'Choose an art style',
        required: false,
        type: 'select',
        options: [
          'Realistic Portrait',
          'Anime/Manga',
          'Comic Book Hero',
          'Oil Painting',
          'Watercolor',
          'Digital Art',
          'Pixel Art'
        ]
      },
      {
        id: 'mood',
        label: 'Mood/Atmosphere',
        placeholder: 'Describe the mood of the portrait',
        required: false
      }
    ],
    model: 'dall-e-3',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['image'],
    outputType: 'image',
    exampleImageUrl: 'https://picsum.photos/seed/character1/1024/1024'
  },
  {
    id: '22',
    title: 'Product Mockup Generator',
    description: 'Create professional product mockups for marketing and presentations',
    systemPrompt: 'Generate a photorealistic product mockup using DALL-E 3. This tool creates clean, professional product visualizations in a studio setting with appropriate lighting and composition. Ideal for marketing materials, presentations, or concept visualization.',
    inputFields: [
      {
        id: 'productDescription',
        label: 'Product Description',
        placeholder: 'Describe the product in detail (shape, color, materials, size, etc.)',
        required: true,
        type: 'textarea'
      },
      {
        id: 'environment',
        label: 'Environment',
        placeholder: 'Where is the product displayed?',
        required: false,
        type: 'select',
        options: [
          'Clean Studio (White Background)',
          'Lifestyle Setting',
          'Office Environment',
          'Home Setting',
          'Outdoor Scene',
          'Retail Display',
          'Technical/Industrial'
        ]
      },
      {
        id: 'angle',
        label: 'Camera Angle',
        placeholder: 'Select viewing angle',
        required: false,
        type: 'select',
        options: [
          'Front View',
          '3/4 View',
          'Side View',
          'Top-Down',
          'Isometric',
          'Close-Up Detail'
        ]
      },
      {
        id: 'lighting',
        label: 'Lighting Style',
        placeholder: 'Describe the lighting',
        required: false,
        type: 'select',
        options: [
          'Soft Studio Lighting',
          'Natural Daylight',
          'Dramatic Lighting',
          'Backlit',
          'Product Spotlight',
          'Technical Lighting'
        ]
      }
    ],
    model: 'dall-e-3',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['image'],
    outputType: 'image',
    exampleImageUrl: 'https://picsum.photos/seed/product2/1024/1024'
  },
  {
    id: '23',
    title: 'Landscape Scene Generator',
    description: 'Create beautiful landscape images for backgrounds, art, or inspiration',
    systemPrompt: 'Generate a detailed landscape scene using DALL-E 3. This tool creates vivid, immersive environments and natural scenes with realistic lighting and atmosphere. Perfect for background art, setting visualization, or nature inspiration.',
    inputFields: [
      {
        id: 'sceneDescription',
        label: 'Scene Description',
        placeholder: 'Describe the landscape in detail',
        required: true,
        type: 'textarea'
      },
      {
        id: 'timeOfDay',
        label: 'Time of Day',
        placeholder: 'When is this scene taking place?',
        required: false,
        type: 'select',
        options: [
          'Sunrise/Dawn',
          'Midday',
          'Sunset/Dusk',
          'Night/Moonlight',
          'Golden Hour',
          'Blue Hour',
          'Stormy Weather'
        ]
      },
      {
        id: 'environment',
        label: 'Environment Type',
        placeholder: 'What type of landscape is this?',
        required: false,
        type: 'select',
        options: [
          'Mountains',
          'Forest',
          'Beach/Ocean',
          'Desert',
          'Tropical',
          'Arctic/Snow',
          'Countryside',
          'Urban Landscape',
          'Fantasy Realm'
        ]
      },
      {
        id: 'style',
        label: 'Artistic Style',
        placeholder: 'What artistic style should be used?',
        required: false,
        type: 'select',
        options: [
          'Photorealistic',
          'Impressionist',
          'Stylized/Fantasy',
          'Cinematic',
          'Animated',
          'Oil Painting',
          'Watercolor'
        ]
      }
    ],
    model: 'dall-e-3',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['image'],
    outputType: 'image',
    exampleImageUrl: 'https://picsum.photos/seed/landscape1/1792/1024'
  }
];

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: initialPrompts,
      
      addPrompt: (promptData) => {
        const id = uuidv4();
        const newPrompt: Prompt = {
          ...promptData,
          id,
          createdAt: Date.now()
        };
        
        set((state) => ({
          prompts: [...state.prompts, newPrompt]
        }));
        
        return id;
      },
      
      getPrompt: (id) => {
        const prompts = get().prompts;
        if (!prompts || !Array.isArray(prompts)) {
          console.error('Prompts array is not available or not in the correct format');
          return undefined;
        }
        return prompts.find(prompt => prompt.id === id);
      },
      
      removePrompt: (id) => {
        const prompts = get().prompts;
        if (!prompts || !Array.isArray(prompts)) {
          console.error('Cannot remove prompt: prompts array is not available');
          return;
        }
        
        set((state) => ({
          prompts: state.prompts.filter(prompt => prompt.id !== id)
        }));
      },
      
      resetStore: () => {
        set({ prompts: initialPrompts });
      },
      
      getPublicPrompts: () => {
        const prompts = get().prompts;
        if (!prompts || !Array.isArray(prompts)) {
          return [];
        }
        return prompts.filter(prompt => !prompt.isPrivate);
      },
      
      getUserPrompts: (userId) => {
        const prompts = get().prompts;
        if (!prompts || !Array.isArray(prompts)) {
          return [];
        }
        return prompts.filter(prompt => {
          // Return prompts that are either:
          // 1. Public prompts
          // 2. Private prompts owned by this user
          return !prompt.isPrivate || (prompt.isPrivate && prompt.ownerId === userId);
        });
      }
    }),
    {
      name: 'prompt-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : null),
      partialize: (state) => ({ prompts: state.prompts }),
      // Merge strategy to handle combining existing localStorage data with new templates
      merge: (persistedState: any, currentState) => {
        // If persistedState doesn't have a valid prompts array, use currentState
        if (!persistedState || !persistedState.prompts || !Array.isArray(persistedState.prompts)) {
          return { ...currentState };
        }
        
        // Identify default templates by fixed IDs
        const defaultTemplateIds = new Set(['1', '2', '3', '7', '8', '9', '20', '21', '22', '23']);
        
        // Get existing non-default template IDs to preserve user-created prompts
        const userPrompts = persistedState.prompts.filter((p: Prompt) => !defaultTemplateIds.has(p.id));
        
        // Get default templates from current state (guaranteed to be there)
        const defaultPrompts = currentState.prompts.filter(p => defaultTemplateIds.has(p.id));
        
        // Merge user-created prompts with default templates
        return {
          ...currentState,
          prompts: [...defaultPrompts, ...userPrompts],
        };
      }
    }
  )
);

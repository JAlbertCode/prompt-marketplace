import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Prompt } from '@/types';
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
    content: 'You are a professional blog writer. Create a well-structured blog post with an introduction, main sections with subheadings, and a conclusion. The blog post should be informative, engaging, and between 800-1000 words.',
    model: 'gpt-4o',
    tags: ['blog', 'writing', 'content'],
    visibility: 'public',
    creatorId: 'system',
    creatorName: 'PromptFlow',
    createdAt: new Date(),
    runCount: 0,
    avgRating: 4.8,
    price: 0
  },
  {
    id: '2',
    title: 'Code Explainer',
    description: 'Get a detailed explanation of any code snippet',
    content: 'You are an expert programming tutor. Explain the provided code snippet in detail, breaking down what each part does, identifying patterns or anti-patterns, and suggesting possible improvements where applicable. Use a clear, educational tone.',
    model: 'sonar-medium-chat',
    tags: ['code', 'programming', 'education'],
    visibility: 'public',
    creatorId: 'system',
    creatorName: 'PromptFlow',
    createdAt: new Date(),
    runCount: 0,
    avgRating: 4.7,
    price: 0
  },
  {
    id: '3',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions for e-commerce',
    content: 'You are a professional e-commerce copywriter. Write an engaging, persuasive product description that highlights features, benefits, and unique selling points. The description should be SEO-friendly and compelling enough to convert browsers into buyers.',
    model: 'sonar-small-online',
    tags: ['marketing', 'ecommerce', 'copywriting'],
    visibility: 'public',
    creatorId: 'system',
    creatorName: 'PromptFlow',
    createdAt: new Date(),
    runCount: 0,
    avgRating: 4.6,
    price: 0
  },
  {
    id: '7',
    title: 'Image Prompt Writer',
    description: 'Create detailed prompts for text-to-image generation tools',
    content: 'You are an expert at writing prompts for AI image generation tools. Create a detailed and visual description that can be used as input for DALL-E 3 or similar text-to-image generation tools. Be extremely specific about composition, lighting, colors, style, mood, and subject matter. DO NOT use bullet points or formatting - write a cohesive paragraph that describes exactly what the image should look like. The more specific detail, the better the resulting image will be when users take your output to an image generation tool.',
    model: 'sonar-small-online',
    tags: ['image', 'dall-e', 'prompt-engineering'],
    visibility: 'public',
    creatorId: 'system',
    creatorName: 'PromptFlow',
    createdAt: new Date(),
    runCount: 0,
    avgRating: 4.9,
    price: 0
  },
  {
    id: '8',
    title: 'Product Description Generator',
    description: 'Create detailed descriptions for product visualization',
    content: 'You are a professional product photographer and visualization expert. Create a detailed description of how a product would be photographed professionally. Focus on lighting, angles, materials, and presentation that would make the product look appealing and realistic.',
    model: 'sonar-medium-chat',
    tags: ['product', 'marketing', 'visualization'],
    visibility: 'public',
    creatorId: 'system',
    creatorName: 'PromptFlow',
    createdAt: new Date(),
    runCount: 0,
    avgRating: 4.5,
    price: 0
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
          createdAt: new Date()
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
        return prompts.filter(prompt => prompt.visibility === 'public');
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
          return prompt.visibility === 'public' || 
                 (prompt.visibility !== 'public' && prompt.creatorId === userId);
        });
      }
    }),
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

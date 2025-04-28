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

// Sample prompts to start with
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
    title: 'Marketing Image Creator',
    description: 'Generate professional marketing images with DALL-E 3',
    systemPrompt: 'You are an expert marketing designer. Create a detailed and visually compelling image description based on the user\'s requirements. Focus on creating marketing-ready visuals that would be appropriate for advertisements, social media posts, or promotional materials. Include specific details about composition, lighting, colors, and style to ensure the generated image is professional and eye-catching.',
    inputFields: [
      {
        id: 'product',
        label: 'Product or Service',
        placeholder: 'Describe the product or service to feature',
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
        placeholder: 'Who is this marketing aimed at?',
        required: false
      },
      {
        id: 'additionalDetails',
        label: 'Additional Details',
        placeholder: 'Any specific elements to include',
        required: false,
        type: 'textarea'
      }
    ],
    model: 'sonar-small-online',
    imageModel: 'dall-e-3',
    creditCost: 150,
    createdAt: Date.now(),
    capabilities: ['text', 'image'],
    exampleImageUrl: 'https://picsum.photos/seed/marketing1/1024/1024',
    exampleOutput: "A professional marketing image for a premium smart water bottle with temperature control. The image features the sleek, stainless steel water bottle as the centerpiece, with a soft blue glow emanating from its digital temperature display. The bottle is positioned on a minimalist white surface with subtle water droplets around it, conveying freshness. In the background, there's a gradient from light blue to teal, suggesting coolness and technology. The lighting is bright and clean with soft shadows, giving the product a premium feel. The composition leaves space for text overlay on the right side, perfect for adding a product tagline or call to action."
  },
  {
    id: '8',
    title: 'Product Visualization',
    description: 'Create realistic product images from descriptions',
    systemPrompt: 'You are a professional product photographer and visualization expert. Create a detailed image description that would result in a photorealistic product visualization based on the user\'s description. Focus on lighting, angles, materials, and presentation that would make the product look appealing and realistic. Include specific details about studio setup, background, reflections, and shadows to achieve a professional product photography look.',
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
    imageModel: 'dall-e-3',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['text', 'image'],
    exampleImageUrl: 'https://picsum.photos/seed/product1/1024/1024',
    exampleOutput: "A photorealistic image of a premium wireless gaming headset, shown from a slight 3/4 angle to display both the sleek ear cup design and the adjustable microphone. The headset features a matte black finish with subtle red LED accents along the ear cups and microphone tip. The product is displayed on a reflective black surface in a studio environment with professional lighting - a main key light from the front right creating a subtle highlight across the curves of the headset, and a rim light from behind creating a defining edge. The background features a gradient from dark gray to black, keeping the focus entirely on the product. The materials appear high-end with memory foam ear cushions visible, and the overall image has a slight depth of field with the front of the headset in perfect focus while the rear elements have a slight, appealing blur."
  },
  {
    id: '9',
    title: 'Brand Mood Board Creator',
    description: 'Generate visual mood boards for brand identity',
    systemPrompt: 'You are a brand identity specialist. Create a detailed description for a visual mood board that captures the essence of the brand described by the user. Focus on creating a cohesive visual language including color schemes, typography suggestions, imagery style, and overall aesthetic that aligns with the brand values and target audience. The description should be detailed enough to generate a comprehensive mood board image that effectively communicates the brand\'s identity and appeal.',
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
    imageModel: 'dall-e-3',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['text', 'image'],
    exampleImageUrl: 'https://picsum.photos/seed/moodboard1/1024/1024',
    exampleOutput: "A visual mood board for 'EcoLuxe', a sustainable luxury home goods brand. The mood board is arranged in a clean grid layout featuring a sophisticated color palette of deep emerald green, matte gold, crisp white, and warm taupe. The board includes close-up textures of natural materials: FSC-certified walnut wood grain, organic cotton weave, recycled brass with a brushed finish, and handmade ceramic with subtle imperfections. Typography examples show a primary serif font for headings that conveys timeless luxury, paired with a clean sans-serif for body text suggesting modern sustainability. Product photography samples feature minimalist compositions with soft natural lighting, showing sustainable luxury items in curated home environments with abundant plants and natural light. The overall aesthetic balances high-end design with environmental consciousness, appealing to affluent, eco-minded consumers who don't want to sacrifice quality or style for sustainability."
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
        const defaultTemplateIds = new Set(['1', '2', '3', '7', '8', '9']);
        
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

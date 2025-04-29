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
    title: 'Marketing Image Description Creator',
    description: 'Generate a detailed image description for DALL-E to create professional marketing visuals',
    systemPrompt: 'You are an expert marketing designer. Create a VERY DETAILED and visual description that will be used to generate a marketing image with DALL-E 3. Your output will be fed directly to an image generation AI, so be extremely specific about composition, lighting, colors, style, mood, and subject matter. Do NOT use bullet points or formatting - write a cohesive paragraph that describes exactly what the image should look like. The more specific detail, the better the resulting image will be.',
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
    exampleOutput: "A photorealistic marketing image featuring a premium smart water bottle with temperature control functionality. The sleek, stainless steel bottle is positioned prominently in the center of the frame on a minimalist white surface with subtle blue lighting. The bottle has a modern digital temperature display that emits a soft blue glow. Small water droplets are visible on the exterior of the bottle, suggesting coolness and freshness. The background features a smooth gradient from light blue to teal, creating a clean, high-tech atmosphere without distracting from the product. The lighting is bright and even with soft shadows that give the bottle a premium, professional appearance. There is negative space on the right side of the image where marketing text could be overlaid. The overall mood is refreshing, modern, and premium, targeted at health-conscious professionals."
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
  },
  {
    id: '10',
    title: 'Lego Character Transformation',
    description: 'Transform your photo into a Lego minifigure character',
    systemPrompt: 'You are a digital artist specializing in Lego-style transformations. Your task is to transform the uploaded photo into a Lego minifigure character. Maintain the person\'s essential features and style but recreate them as if they were a Lego minifigure. Use the classic Lego minifigure style with the characteristic yellow face (unless otherwise specified), simplified features, and the blocky Lego aesthetic. Make sure to keep the character recognizable while fully converting them to the Lego style.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a clear photo of yourself or the person to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'style',
        label: 'Lego Style',
        placeholder: 'Classic minifigure, modern Lego movie style, etc.',
        required: false
      },
      {
        id: 'background',
        label: 'Background Setting',
        placeholder: 'Lego city, space, medieval castle, etc.',
        required: false
      }
    ],
    model: 'gpt-4o',
    creditCost: 150,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'character',
    presetStyles: [
      'Classic Lego Minifigure',
      'Lego Movie Style',
      'Lego Batman Universe',
      'Lego Star Wars Character',
      'Lego Marvel Superhero'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/lego1/512/512'
  },
  {
    id: '11',
    title: 'Studio Ghibli Art Style',
    description: 'Transform photos into the beautiful hand-drawn style of Studio Ghibli animations',
    systemPrompt: 'You are a master digital artist specializing in Studio Ghibli-style transformations. Transform the uploaded image into the distinctive hand-drawn animation style of Studio Ghibli films. Focus on creating soft, painterly backgrounds with detailed nature elements, warm lighting, and characters with simple but expressive faces typical of Ghibli animations. Add the characteristic watercolor aesthetic, gentle color palette, and careful attention to small details that make Ghibli films so beloved. If the image contains nature, emphasize its beauty and magical quality as Miyazaki would.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a photo to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'ghibliFilm',
        label: 'Ghibli Film Reference',
        placeholder: 'E.g., Spirited Away, My Neighbor Totoro, Princess Mononoke',
        required: false
      },
      {
        id: 'additionalElements',
        label: 'Additional Elements',
        placeholder: 'Any Studio Ghibli style elements you want to add',
        required: false
      }
    ],
    model: 'gpt-4o',
    creditCost: 200,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'Spirited Away',
      'My Neighbor Totoro',
      'Princess Mononoke',
      'Howl\'s Moving Castle',
      'Castle in the Sky'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/ghibli1/512/512'
  },
  {
    id: '12',
    title: 'Pixel Art Converter',
    description: 'Transform any image into nostalgic pixel art with customizable styles',
    systemPrompt: 'You are a pixel art specialist. Transform the uploaded image into authentic pixel art with limited color palettes, visible pixels, and the nostalgic aesthetic of 8-bit and 16-bit video games. Maintain the core composition and subject matter while fully converting the image to pixel art style. Focus on creating clean pixel edges, appropriate dithering techniques, and limited but vibrant color palettes. Make sure the final result looks like genuine pixel art rather than just a low-resolution image.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Image',
        placeholder: 'Upload an image to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'pixelDensity',
        label: 'Pixel Density',
        placeholder: 'Low (8-bit), Medium (16-bit), High (32-bit)',
        required: false
      },
      {
        id: 'colorPalette',
        label: 'Color Palette',
        placeholder: 'NES, SNES, Game Boy, Custom',
        required: false
      }
    ],
    model: 'gpt-4o',
    creditCost: 120,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'NES 8-bit',
      'SNES 16-bit',
      'Game Boy',
      'Sega Genesis',
      'Commodore 64'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/pixel1/512/512'
  },
  {
    id: '13',
    title: 'Oil Painting Portrait',
    description: 'Transform your photos into beautiful oil painting portraits in various artistic styles',
    systemPrompt: 'You are a master digital artist specializing in oil painting transformations. Convert the uploaded photograph into a beautiful, realistic oil painting portrait that faithfully captures the subject while adding the rich textures, depth, and painterly qualities of traditional oil painting. Pay attention to brush stroke techniques, color mixing, light and shadow effects, and the subtle imperfections that give oil paintings their authentic character. The final image should look like it was painted by hand on canvas rather than digitally manipulated.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a portrait photo to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'artisticStyle',
        label: 'Artistic Style',
        placeholder: 'Rembrandt, Impressionist, Modern, etc.',
        required: false
      },
      {
        id: 'colorTone',
        label: 'Color Tone',
        placeholder: 'Warm, cool, vibrant, muted, etc.',
        required: false
      }
    ],
    model: 'gpt-4o',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'Classical Rembrandt',
      'Impressionist Monet',
      'Renaissance Style',
      'Modern Expressionist',
      'Dutch Golden Age',
      'Romantic Era'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/oil1/512/512'
  },
  {
    id: '14',
    title: 'Comic Book Hero Transformation',
    description: 'Transform yourself into a comic book superhero with custom powers and costume',
    systemPrompt: 'You are a comic book artist specializing in superhero character design. Transform the uploaded photo into a dynamic comic book superhero illustration. Create a heroic, action-ready pose with dramatic lighting, bold outlines, and comic book style shading. Add a superhero costume that suits the person\'s appearance while incorporating any requested colors, powers, or themes. Include appropriate comic book visual elements like speed lines, impact stars, or dramatic backgrounds to enhance the superhero feel. The final result should look like a panel from a professional comic book featuring this person as the hero.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a photo of yourself to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'superpower',
        label: 'Superpower',
        placeholder: 'Flight, super strength, energy blasts, etc.',
        required: false
      },
      {
        id: 'costumeColors',
        label: 'Costume Colors',
        placeholder: 'Red and blue, black and gold, etc.',
        required: false
      },
      {
        id: 'comicStyle',
        label: 'Comic Style',
        placeholder: 'Marvel, DC, Manga, Indie, etc.',
        required: false
      }
    ],
    model: 'gpt-4o',
    creditCost: 170,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'character',
    presetStyles: [
      'Marvel Superhero',
      'DC Comics Style',
      'Manga Hero',
      'Indie Comic',
      'Vintage Comic',
      'X-Men Member'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/comic1/512/512'
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
        const defaultTemplateIds = new Set(['1', '2', '3', '7', '8', '9', '10', '11', '12', '13', '14']);
        
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

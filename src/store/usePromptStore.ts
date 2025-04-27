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
        required: true
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
    exampleOutput: "# Ultra Premium Noise-Cancelling Headphones XC-5000\n\nImmerse yourself in pure audio perfection with the revolutionary XC-5000 wireless headphones. Engineered for the discerning audiophile, these premium headphones combine cutting-edge noise cancellation technology with unparalleled sound quality.\n\n## Key Features That Set XC-5000 Apart:\n\n- **Advanced Adaptive Noise Cancellation** that intelligently adjusts to your environment, creating a personal oasis of sound in even the noisiest settings\n- **Studio-Quality Audio** with custom-tuned 40mm drivers delivering rich bass, crystal-clear highs, and perfectly balanced mid-tones\n- **All-Day Comfort** with memory foam ear cushions and adjustable lightweight design for extended listening sessions\n\nPerfect for frequent travelers, professionals working in distracting environments, or anyone who demands the ultimate sound experience without compromise.\n\nInvest in your sound journey today and experience music the way it was meant to be heard."
  },
  {
    id: '4',
    title: 'Email Response Generator',
    description: 'Craft professional email responses for any situation',
    systemPrompt: 'You are an expert communication specialist. Create a well-crafted email response that is professional, clear, and appropriate for the context. Consider the tone needed for the recipient and situation.',
    inputFields: [
      {
        id: 'originalEmail',
        label: 'Original Email',
        placeholder: 'Paste the email you received',
        required: true
      },
      {
        id: 'relationship',
        label: 'Relationship',
        placeholder: 'Colleague, Client, Manager, etc.',
        required: true
      },
      {
        id: 'tone',
        label: 'Desired Tone',
        placeholder: 'Formal, Friendly, Apologetic, etc.',
        required: true
      },
      {
        id: 'keyPoints',
        label: 'Key Points to Include',
        placeholder: 'List the main points to address',
        required: false
      }
    ],
    model: 'sonar-medium-chat',
    creditCost: 20,
    createdAt: Date.now(),
    exampleOutput: "Subject: Re: Follow-up on Project Timeline Adjustments\n\nDear John,\n\nThank you for your email regarding the timeline adjustments for the Baker project. I appreciate you bringing these concerns to my attention.\n\nAfter reviewing the schedule, I agree that the current deadline presents some challenges given the expanded scope. I've spoken with the development team, and we can accommodate a two-week extension without impacting our other commitments. This would move our delivery date to May 15th, which should provide sufficient time to incorporate the additional features you've requested while maintaining our quality standards.\n\nI've attached a revised timeline document reflecting these changes for your review. Could we schedule a brief call this Thursday or Friday to discuss any questions you might have?\n\nThank you for your understanding and continued partnership.\n\nBest regards,\nSarah"
  },
  {
    id: '5',
    title: 'Research Summary',
    description: 'Summarize complex research into digestible content',
    systemPrompt: 'You are a research analyst specializing in making complex topics accessible. Create a clear, concise summary of the research provided, highlighting key findings, methodology, and implications. Your summary should be understandable to an educated non-specialist.',
    inputFields: [
      {
        id: 'researchTopic',
        label: 'Research Topic',
        placeholder: 'Enter the research topic or paste abstract',
        required: true
      },
      {
        id: 'keyFindings',
        label: 'Key Findings',
        placeholder: 'Enter any specific findings if available',
        required: false
      },
      {
        id: 'audienceLevel',
        label: 'Audience Knowledge Level',
        placeholder: 'Beginner, Intermediate, Advanced',
        required: true
      },
      {
        id: 'focusArea',
        label: 'Focus Area',
        placeholder: 'E.g., practical applications, methodology, etc.',
        required: false
      }
    ],
    model: 'sonar-large-online',
    creditCost: 40,
    createdAt: Date.now(),
    exampleOutput: "# Simplified Summary: Quantum Computing Applications in Drug Discovery\n\n## Key Findings\n\nRecent research demonstrates that quantum computing offers significant advantages for drug discovery processes, potentially reducing the time to identify viable drug candidates from years to months. The quantum simulation methods described in this study were able to accurately model complex protein-drug interactions with up to 70% greater accuracy than classical computing methods.\n\n## Methodology Highlights\n\nResearchers utilized a hybrid quantum-classical approach where:\n\n1. Quantum processors handled the computationally intensive molecular simulations\n2. Classical systems managed data pre-processing and result analysis\n3. A novel quantum algorithm (QFold-23) provided exponential speedup for protein folding predictions\n\n## Practical Implications\n\nThis breakthrough has immediate applications for pharmaceutical companies by:\n\n- Reducing the cost of drug discovery by an estimated 30-40%\n- Enabling more accurate screening of potential compounds before laboratory testing\n- Making previously computationally prohibitive simulations feasible\n\nWhile still in early stages, this technology shows remarkable promise for revolutionizing pharmaceutical research if quantum hardware development continues at its current pace."
  },
  {
    id: '6',
    title: 'Social Media Post Generator',
    description: 'Create engaging posts for various social platforms',
    systemPrompt: 'You are a social media marketing expert. Create engaging, platform-appropriate social media content that will drive engagement and reflect the brand voice. Optimize the content length and style for the specified platform.',
    inputFields: [
      {
        id: 'platform',
        label: 'Platform',
        placeholder: 'Instagram, Twitter, LinkedIn, etc.',
        required: true
      },
      {
        id: 'topic',
        label: 'Topic/Announcement',
        placeholder: 'What do you want to post about?',
        required: true
      },
      {
        id: 'brandVoice',
        label: 'Brand Voice',
        placeholder: 'Professional, Casual, Humorous, etc.',
        required: true
      },
      {
        id: 'callToAction',
        label: 'Call to Action',
        placeholder: 'What do you want readers to do?',
        required: false
      }
    ],
    model: 'sonar-small-online',
    creditCost: 15,
    createdAt: Date.now(),
    exampleOutput: "## LinkedIn Post\n\n🚀 **Exciting News: We've Just Launched Our New Sustainable Product Line!**\n\nProud to announce that after 18 months of research and development, EcoInnovate is introducing our fully biodegradable packaging solution that reduces plastic waste by 95% without compromising product protection.\n\nOur team has worked tirelessly to create packaging that isn't just better for the planet, but also:\n\n✅ Maintains the same shelf life as traditional packaging\n✅ Costs only 5% more than conventional alternatives\n✅ Biodegrades completely within 180 days\n\nAs someone passionate about sustainable business practices, I'm particularly excited about this launch because it represents our commitment to environmental responsibility while still delivering the quality our customers expect.\n\nInterested in learning how this could work for your products? Download our white paper (link in comments) or book a consultation through the link in our bio.\n\n#SustainableBusiness #PackagingInnovation #ZeroWaste #CircularEconomy"
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
        
        // Get existing template IDs to check for duplicates
        const existingIds = new Set(
          persistedState.prompts.map((p: Prompt) => p.id)
        );
        
        // Add new templates from the current state that don't exist yet
        const newPrompts = currentState.prompts.filter(p => !existingIds.has(p.id));
        
        return {
          ...currentState,
          ...persistedState,
          prompts: [...persistedState.prompts, ...newPrompts],
        };
      }
    }
  )
);

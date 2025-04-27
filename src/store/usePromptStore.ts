import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt, InputField } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PromptState {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => string;
  getPrompt: (id: string) => Prompt | undefined;
  removePrompt: (id: string) => void;
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
    createdAt: Date.now()
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
    createdAt: Date.now()
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
    createdAt: Date.now()
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
    createdAt: Date.now()
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
    createdAt: Date.now()
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
    createdAt: Date.now()
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
        return get().prompts.find(prompt => prompt.id === id);
      },
      
      removePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter(prompt => prompt.id !== id)
        }));
      }
    }),
    {
      name: 'prompt-storage',
    }
  )
);

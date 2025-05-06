import { Prompt } from '@/types/prompt';

// Database seeding - this would be replaced with actual DB calls
let prompts: Prompt[] = [
  {
    id: '1',
    title: 'Social Media Post Generator',
    description: 'Generate engaging social media posts for various platforms',
    content: 'Create a social media post for {{platform}} about {{topic}}. Use a {{tone}} tone and include {{hashtags}} hashtags.',
    model: 'gpt-4o',
    author: 'Jane Cooper',
    visibility: 'public',
    tags: ['social media', 'marketing', 'content creation'],
    price: 0,
    isFavorite: false,
    createdAt: 'April 28, 2025',
    runs: 128
  },
  {
    id: '2',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions for e-commerce',
    content: 'Write a product description for {{product}} targeting {{audience}}. Include key features: {{features}} and benefits: {{benefits}}.',
    model: 'sonar-pro-medium',
    author: 'Jane Cooper',
    visibility: 'public',
    tags: ['e-commerce', 'copywriting', 'marketing'],
    price: 5000,
    isFavorite: true,
    createdAt: 'April 25, 2025',
    runs: 76
  },
  {
    id: '3',
    title: 'Code Documentation Generator',
    description: 'Generate comprehensive documentation for code snippets',
    content: 'Create documentation for the following code:\n\n```{{language}}\n{{code}}\n```\n\nInclude explanation of:\n1. Purpose\n2. Parameters\n3. Return values\n4. Example usage',
    model: 'gpt-4o',
    author: 'Alex Johnson',
    visibility: 'public',
    tags: ['programming', 'documentation', 'developer tools'],
    price: 3000,
    isFavorite: false,
    createdAt: 'April 20, 2025',
    runs: 214
  },
  {
    id: '4',
    title: 'Meeting Summarizer',
    description: 'Create concise meeting summaries from transcripts',
    content: 'Summarize the following meeting transcript:\n\n{{transcript}}\n\nInclude:\n1. Key points discussed\n2. Decisions made\n3. Action items with assignees\n4. Follow-up meeting details',
    model: 'sonar-reasoning-pro',
    author: 'Sarah Williams',
    visibility: 'public',
    tags: ['productivity', 'business', 'meetings'],
    price: 2500,
    isFavorite: false,
    createdAt: 'April 15, 2025',
    runs: 98
  },
  {
    id: '5',
    title: 'Customer Support Email Generator',
    description: 'Generate professional customer support email responses',
    content: 'Write a customer support email response for the following inquiry:\n\n{{inquiry}}\n\nUse a {{tone}} tone and address the following points:\n{{points_to_address}}',
    model: 'gpt-4o-mini',
    author: 'Jane Cooper',
    visibility: 'private',
    tags: ['customer support', 'email', 'business'],
    price: 1500,
    isFavorite: true,
    createdAt: 'April 10, 2025',
    runs: 156
  },
  {
    id: '6',
    title: 'SEO Content Optimizer',
    description: 'Optimize content for search engines with natural language',
    content: 'Optimize the following content for SEO targeting keywords: {{keywords}}.\n\n{{content}}\n\nMaintain natural language, improve readability, and enhance keyword usage while preserving the original meaning.',
    model: 'sonar-pro-high',
    author: 'Mark Davis',
    visibility: 'public',
    tags: ['seo', 'content marketing', 'copywriting'],
    price: 4000,
    isFavorite: false,
    createdAt: 'April 5, 2025',
    runs: 185
  }
];

export async function getPrompts(filters: any = {}, sort: string = 'newest'): Promise<Prompt[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredPrompts = [...prompts];
  
  // Apply filters
  if (filters.type === 'mine') {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.author === 'Jane Cooper');
  } else if (filters.type === 'favorites') {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.isFavorite);
  } else if (filters.type === 'published') {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.visibility === 'public');
  } else if (filters.type === 'drafts') {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.visibility === 'private');
  }
  
  // Apply search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) || 
      prompt.description.toLowerCase().includes(searchTerm) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply sort
  if (sort === 'oldest') {
    filteredPrompts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'most-used') {
    filteredPrompts.sort((a, b) => (b.runs || 0) - (a.runs || 0));
  } else if (sort === 'highest-rated') {
    // Simulate rating sorting - would be replaced with actual rating data
    filteredPrompts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else {
    // Default: newest first
    filteredPrompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return filteredPrompts;
}

export async function getPromptById(id: string): Promise<Prompt> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const prompt = prompts.find(p => p.id === id);
  
  if (!prompt) {
    throw new Error('Prompt not found');
  }
  
  return prompt;
}

export async function createPrompt(promptData: Omit<Prompt, 'id' | 'author' | 'createdAt' | 'isFavorite'>): Promise<Prompt> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newPrompt: Prompt = {
    id: (prompts.length + 1).toString(),
    author: 'Jane Cooper', // Current user
    createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    isFavorite: false,
    runs: 0,
    ...promptData
  };
  
  prompts.unshift(newPrompt);
  
  return newPrompt;
}

export async function updatePrompt(id: string, promptData: Partial<Prompt>): Promise<Prompt> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const promptIndex = prompts.findIndex(p => p.id === id);
  
  if (promptIndex === -1) {
    throw new Error('Prompt not found');
  }
  
  const updatedPrompt = {
    ...prompts[promptIndex],
    ...promptData,
    // Always preserve these values
    id: prompts[promptIndex].id,
    author: prompts[promptIndex].author,
    createdAt: prompts[promptIndex].createdAt,
  };
  
  prompts[promptIndex] = updatedPrompt;
  
  return updatedPrompt;
}

export async function toggleFavoritePrompt(id: string): Promise<{ isFavorite: boolean }> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const promptIndex = prompts.findIndex(p => p.id === id);
  
  if (promptIndex === -1) {
    throw new Error('Prompt not found');
  }
  
  prompts[promptIndex].isFavorite = !prompts[promptIndex].isFavorite;
  
  return { isFavorite: prompts[promptIndex].isFavorite };
}

import { Flow } from '@/types/flow';

// Database seeding - this would be replaced with actual DB calls
let flows: Flow[] = [
  {
    id: '1',
    title: 'Content Creation Pipeline',
    description: 'Generate, optimize, and schedule content in one flow',
    author: 'Jane Cooper',
    tags: ['content', 'marketing', 'automation'],
    visibility: 'public',
    steps: [
      {
        id: 's1',
        name: 'Topic Generator',
        modelId: 'gpt-4o',
        modelName: 'GPT-4o',
        inputType: 'text',
        outputType: 'json',
        content: 'Generate 5 trending topics about {{industry}} for a blog post.'
      },
      {
        id: 's2',
        name: 'Article Outline',
        modelId: 'sonar-pro-medium',
        modelName: 'Sonar Pro Medium',
        promptId: '1',
        promptTitle: 'Blog Outline Generator',
        inputType: 'json',
        outputType: 'markdown'
      },
      {
        id: 's3',
        name: 'Article Writer',
        modelId: 'sonar-reasoning-pro',
        modelName: 'Sonar Reasoning Pro',
        inputType: 'markdown',
        outputType: 'markdown',
        content: 'Write a comprehensive article based on this outline.'
      }
    ],
    isFavorite: true,
    createdAt: 'April 28, 2025',
    runs: 42,
    avgCost: 25000
  },
  {
    id: '2',
    title: 'Customer Support Workflow',
    description: 'Analyze, classify, and respond to customer inquiries',
    author: 'Alex Johnson',
    tags: ['customer support', 'email', 'business'],
    visibility: 'public',
    steps: [
      {
        id: 's1',
        name: 'Sentiment Analysis',
        modelId: 'gpt-4o-mini',
        modelName: 'GPT-4o Mini',
        inputType: 'text',
        outputType: 'json',
        content: 'Analyze the sentiment and urgency of this customer inquiry.'
      },
      {
        id: 's2',
        name: 'Category Classifier',
        modelId: 'gpt-4o-mini',
        modelName: 'GPT-4o Mini',
        inputType: 'json',
        outputType: 'text',
        content: 'Classify this inquiry into one of these categories: billing, technical, account, shipping, other.'
      },
      {
        id: 's3',
        name: 'Response Generator',
        modelId: 'sonar-pro-medium',
        modelName: 'Sonar Pro Medium',
        promptId: '5',
        promptTitle: 'Customer Support Email Generator',
        inputType: 'text',
        outputType: 'text'
      }
    ],
    isFavorite: false,
    createdAt: 'April 25, 2025',
    runs: 128,
    avgCost: 8500
  },
  {
    id: '3',
    title: 'Code Review Pipeline',
    description: 'Automated code review with security and optimization',
    author: 'Jane Cooper',
    tags: ['development', 'security', 'code quality'],
    visibility: 'private',
    steps: [
      {
        id: 's1',
        name: 'Code Analysis',
        modelId: 'gpt-4o',
        modelName: 'GPT-4o',
        inputType: 'code',
        outputType: 'json',
        content: 'Analyze this code for bugs, security issues, and optimization opportunities.'
      },
      {
        id: 's2',
        name: 'Security Check',
        modelId: 'sonar-reasoning-pro',
        modelName: 'Sonar Reasoning Pro',
        inputType: 'json',
        outputType: 'markdown',
        content: 'Identify any security vulnerabilities in the code and suggest fixes.'
      },
      {
        id: 's3',
        name: 'Code Optimization',
        modelId: 'sonar-pro-high',
        modelName: 'Sonar Pro High',
        inputType: 'markdown',
        outputType: 'code',
        content: 'Optimize this code based on the identified opportunities.'
      },
      {
        id: 's4',
        name: 'Documentation Generator',
        modelId: 'gpt-4o',
        modelName: 'GPT-4o',
        promptId: '3',
        promptTitle: 'Code Documentation Generator',
        inputType: 'code',
        outputType: 'markdown'
      }
    ],
    isFavorite: true,
    createdAt: 'April 20, 2025',
    runs: 37,
    avgCost: 42000
  }
];

export async function getFlows(filters: any = {}, sort: string = 'newest'): Promise<Flow[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredFlows = [...flows];
  
  // Apply filters
  if (filters.type === 'mine') {
    filteredFlows = filteredFlows.filter(flow => flow.author === 'Jane Cooper');
  } else if (filters.type === 'favorites') {
    filteredFlows = filteredFlows.filter(flow => flow.isFavorite);
  } else if (filters.type === 'published') {
    filteredFlows = filteredFlows.filter(flow => flow.visibility === 'public');
  } else if (filters.type === 'drafts') {
    filteredFlows = filteredFlows.filter(flow => flow.visibility === 'private');
  }
  
  // Apply search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredFlows = filteredFlows.filter(flow => 
      flow.title.toLowerCase().includes(searchTerm) || 
      flow.description.toLowerCase().includes(searchTerm) ||
      (flow.tags && flow.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  // Apply sort
  if (sort === 'oldest') {
    filteredFlows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'most-used') {
    filteredFlows.sort((a, b) => (b.runs || 0) - (a.runs || 0));
  } else if (sort === 'highest-rated') {
    // Simulate rating sorting - would be replaced with actual rating data
    filteredFlows.sort((a, b) => (b.avgCost || 0) - (a.avgCost || 0));
  } else {
    // Default: newest first
    filteredFlows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return filteredFlows;
}

export async function getFlowById(id: string): Promise<Flow> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const flow = flows.find(f => f.id === id);
  
  if (!flow) {
    throw new Error('Flow not found');
  }
  
  return flow;
}

export async function toggleFavoriteFlow(id: string): Promise<{ isFavorite: boolean }> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const flowIndex = flows.findIndex(f => f.id === id);
  
  if (flowIndex === -1) {
    throw new Error('Flow not found');
  }
  
  flows[flowIndex].isFavorite = !flows[flowIndex].isFavorite;
  
  return { isFavorite: flows[flowIndex].isFavorite };
}

export async function createFlow(flowData: Omit<Flow, 'id' | 'author' | 'createdAt' | 'isFavorite'>): Promise<Flow> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newFlow: Flow = {
    id: (flows.length + 1).toString(),
    author: 'Jane Cooper', // Current user
    createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    isFavorite: false,
    runs: 0,
    avgCost: 0,
    ...flowData
  };
  
  flows.unshift(newFlow);
  
  return newFlow;
}

export async function updateFlow(id: string, flowData: Partial<Flow>): Promise<Flow> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const flowIndex = flows.findIndex(f => f.id === id);
  
  if (flowIndex === -1) {
    throw new Error('Flow not found');
  }
  
  const updatedFlow = {
    ...flows[flowIndex],
    ...flowData,
    // Always preserve these values
    id: flows[flowIndex].id,
    author: flows[flowIndex].author,
    createdAt: flows[flowIndex].createdAt,
  };
  
  flows[flowIndex] = updatedFlow;
  
  return updatedFlow;
}

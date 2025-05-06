export interface Flow {
  id: string;
  title: string;
  description: string;
  author: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  steps: FlowStep[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
  runs?: number;
  avgCost?: number;
}

export interface FlowStep {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  promptId?: string;
  promptTitle?: string;
  inputType: string;
  outputType: string;
  content?: string;
}

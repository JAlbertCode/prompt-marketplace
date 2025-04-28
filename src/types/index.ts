export interface Prompt {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
  inputFields: InputField[];
  model: SonarModel;
  creditCost: number;
  createdAt: number;
  exampleOutput?: string;
  exampleImageUrl?: string;
  isPrivate?: boolean;
  ownerId?: string;
  capabilities?: ('text' | 'image' | 'code')[];
  imageModel?: ImageModel;
}

export interface InputField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'select' | 'image';
  options?: string[]; // For select type
}

export type SonarModel = 
  | 'sonar-small-online'
  | 'sonar-medium-online'
  | 'sonar-medium-chat'
  | 'sonar-large-online'
  | 'sonar-small-chat'
  | 'llama-3.1-sonar-small-128k-online'
  | 'sonar';

export type ImageModel =
  | 'dall-e-3'
  | 'dall-e-2'
  | 'sdxl'
  | 'sd3';

export interface PromptResult {
  text?: string;
  imageUrl?: string;
  promptId: string;
  timestamp: number;
}

export interface SonarApiRequest {
  model: SonarModel;
  messages: SonarMessage[];
  max_tokens?: number;
}

export interface SonarMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SonarApiResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIImageRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
}

export interface OpenAIImageResponse {
  created: number;
  data: {
    url: string;
    revised_prompt?: string;
  }[];
}

export interface WebhookRequest {
  promptId: string;
  inputs: Record<string, string>;
  userId?: string;
  systemPrompt?: string;
  model?: SonarModel;
  creditCost?: number;
  capabilities?: ('text' | 'image' | 'code')[];
}

export interface WebhookResponse {
  result: string;
  imageUrl?: string;
  promptId: string;
  creditCost: number;
  remainingCredits: number;
  timestamp: number;
}

export interface WebhookInfoResponse {
  id: string;
  name: string;
  description: string;
  inputFields: InputField[];
  webhookInfo: {
    url: string;
    method: string;
    examplePayload: {
      promptId: string;
      inputs: Record<string, string>;
    };
  };
}

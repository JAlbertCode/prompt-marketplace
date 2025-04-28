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
  isPrivate?: boolean;
  ownerId?: string;
}

export interface InputField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export type SonarModel = 
  | 'sonar-small-online'
  | 'sonar-medium-online'
  | 'sonar-medium-chat'
  | 'sonar-large-online'
  | 'sonar-small-chat'
  | 'llama-3.1-sonar-small-128k-online'
  | 'sonar';

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

export interface WebhookRequest {
  promptId: string;
  inputs: Record<string, string>;
  userId?: string;
  systemPrompt?: string;
  model?: SonarModel;
  creditCost?: number;
}

export interface WebhookResponse {
  result: string;
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

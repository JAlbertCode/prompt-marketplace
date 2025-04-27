export interface Prompt {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
  inputFields: InputField[];
  model: SonarModel;
  creditCost: number;
  createdAt: number;
}

export interface InputField {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export type SonarModel = 
  | 'sonar-small-online'
  | 'sonar-medium-chat'
  | 'sonar-large-online';

export interface PromptResult {
  text?: string;
  imageUrl?: string;
  promptId: string;
  timestamp: number;
}

export interface SonarApiRequest {
  model: SonarModel;
  messages: SonarMessage[];
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

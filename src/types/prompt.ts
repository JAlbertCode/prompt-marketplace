export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  model: string;
  author: string;
  visibility: 'public' | 'private' | 'unlisted';
  tags: string[];
  price: number;
  unlockFee: number; // Fee to unlock and view the system prompt
  isFavorite: boolean;
  createdAt: string;
  runs?: number;
  isPublished?: boolean;
  exampleOutput?: string | null;
}

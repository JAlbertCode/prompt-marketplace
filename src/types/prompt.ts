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
  isFavorite: boolean;
  createdAt: string;
  runs?: number;
}

import React from 'react';
import ItemCard from './ItemCard';
import { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  className?: string;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, className }) => {
  return (
    <ItemCard 
      item={prompt}
      itemType="prompt"
      className={className}
    />
  );
};

export default PromptCard;
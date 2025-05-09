import React from 'react';
import ItemCard from './ItemCard';
import { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  className?: string;
  actionButtonText?: string;
  actionButtonVariant?: 'primary' | 'secondary' | 'outline';
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  className,
  actionButtonText,
  actionButtonVariant = 'primary'
}) => {
  return (
    <ItemCard 
      item={prompt}
      itemType="prompt"
      className={className}
      actionButtonText={actionButtonText}
      actionButtonVariant={actionButtonVariant}
    />
  );
};

export default PromptCard;
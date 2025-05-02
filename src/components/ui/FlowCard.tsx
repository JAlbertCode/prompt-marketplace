import React from 'react';
import ItemCard from './ItemCard';
import { PromptFlow } from '@/types';

interface FlowCardProps {
  flow: PromptFlow;
  className?: string;
}

const FlowCard: React.FC<FlowCardProps> = ({ flow, className }) => {
  return (
    <ItemCard 
      item={flow}
      itemType="flow"
      className={className}
    />
  );
};

export default FlowCard;
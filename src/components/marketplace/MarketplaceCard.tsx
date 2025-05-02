'use client';

import React from 'react';
import ItemCard from '@/components/ui/ItemCard';
import { ItemType, Prompt, PromptFlow } from '@/types';

interface MarketplaceItemProps {
  id: string;
  title: string;
  description: string;
  creditCost: number;
  type: ItemType;
  isLocked?: boolean;
  unlockPrice?: number;
  isDraft?: boolean;
  capabilities?: ('text' | 'image' | 'code' | 'transformation')[];
  isPrivate?: boolean;
  exampleOutput?: string;
  exampleImageUrl?: string;
  createdAt: number;
  ownerId?: string;
  systemPrompt?: string;
  // For flows
  steps?: any[];
  totalCreditCost?: number;
}

interface MarketplaceCardProps {
  item: MarketplaceItemProps;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item }) => {
  // Determine if the item is a prompt or flow
  const isPrompt = item.type === 'prompt';
  
  // Convert marketplace item to the appropriate type (Prompt or PromptFlow)
  let typedItem;
  
  if (isPrompt) {
    typedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      systemPrompt: item.systemPrompt || '',
      model: 'gpt-4o', // Default if not provided
      creditCost: item.creditCost,
      createdAt: item.createdAt,
      exampleOutput: item.exampleOutput,
      exampleImageUrl: item.exampleImageUrl,
      isPrivate: item.isPrivate,
      ownerId: item.ownerId,
      capabilities: item.capabilities,
      inputFields: [], // Would need real fields
    } as Prompt;
  } else {
    typedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      steps: item.steps || [],
      totalCreditCost: item.totalCreditCost || item.creditCost,
      createdAt: item.createdAt,
      exampleOutput: item.exampleOutput,
      exampleImageUrl: item.exampleImageUrl,
      isPrivate: item.isPrivate,
      ownerId: item.ownerId,
      isDraft: item.isDraft,
      unlockPrice: item.unlockPrice,
    } as PromptFlow;
  }
  
  return (
    <ItemCard
      item={typedItem}
      itemType={item.type}
      className=""
    />
  );
};

export default MarketplaceCard;
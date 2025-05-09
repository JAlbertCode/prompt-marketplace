import React from 'react';
import { ModelInfo, PromptLength } from '@/lib/models/modelRegistry';
import { formatNumber } from '@/lib/utils';

interface ModelCardProps {
  model: ModelInfo;
  onClick?: () => void;
  isSelected?: boolean;
  showDetailedPricing?: boolean;
  promptLength?: PromptLength;
  className?: string;
}

/**
 * ModelCard component for displaying model information
 * Used on the models page and in model selection dropdown
 */
const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onClick,
  isSelected = false,
  showDetailedPricing = false,
  promptLength = 'medium',
  className = '',
}) => {
  // Get the model provider icon
  const getProviderIcon = () => {
    switch (model.provider) {
      case 'openai':
        return '🟢'; // Green circle for OpenAI
      case 'sonar':
        return '🔵'; // Blue circle for Sonar
      case 'anthropic':
        return '🟣'; // Purple circle for Anthropic
      case 'stability':
        return '🟠'; // Orange circle for Stability AI
      default:
        return '⚪'; // Default
    }
  };

  // Format credits with appropriate suffix for large numbers
  const formatCredits = (credits: number) => {
    if (credits >= 1_000_000) {
      return `${(credits / 1_000_000).toFixed(1)}M`;
    } else if (credits >= 1_000) {
      return `${(credits / 1_000).toFixed(1)}K`;
    } else {
      return formatNumber(credits);
    }
  };
  
  // Get model type icon
  const getModelTypeIcon = () => {
    switch (model.type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'audio':
        return '🔊';
      case 'hybrid':
        return '🔄';
      default:
        return '📄';
    }
  };
  
  // Calculate dollar cost
  const getDollarCost = (credits: number) => {
    const dollars = credits * 0.000001;
    if (dollars < 0.01) {
      return `$${dollars.toFixed(6)}`;
    }
    return `$${dollars.toFixed(4)}`;
  };
  
  return (
    <div
      className={`border rounded-lg p-4 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      } transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl" aria-hidden="true">{getProviderIcon()}</span>
          <span className="font-medium">{model.displayName}</span>
          {model.isPopular && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">
              Popular
            </span>
          )}
        </div>
        <span className="text-xl" title={`${model.type} model`}>{getModelTypeIcon()}</span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">
        {model.description}
      </p>
      
      {showDetailedPricing ? (
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Short prompt:</span>
            <span className="font-medium">
              {formatCredits(model.cost.short)} credits 
              <span className="text-gray-500 text-xs ml-1">({getDollarCost(model.cost.short)})</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Medium prompt:</span>
            <span className="font-medium">
              {formatCredits(model.cost.medium)} credits
              <span className="text-gray-500 text-xs ml-1">({getDollarCost(model.cost.medium)})</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Long prompt:</span>
            <span className="font-medium">
              {formatCredits(model.cost.long)} credits
              <span className="text-gray-500 text-xs ml-1">({getDollarCost(model.cost.long)})</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost:</span>
          <span className="font-medium">
            {formatCredits(model.cost[promptLength])} credits
            <span className="text-gray-500 text-xs ml-1">
              ({getDollarCost(model.cost[promptLength])})
            </span>
          </span>
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-1">
        {model.capabilities.map(capability => (
          <span 
            key={capability}
            className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs"
          >
            {capability}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ModelCard;
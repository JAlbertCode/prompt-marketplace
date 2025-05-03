'use client';

import React from 'react';
import { ModelInfo } from '@/lib/models/modelRegistry';

interface ModelCardProps {
  model: ModelInfo;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onClick,
  selected = false,
  showDetails = false,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const getProviderColor = (provider: string): string => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'perplexity':
        return 'bg-purple-100 text-purple-800';
      case 'anthropic':
        return 'bg-blue-100 text-blue-800';
      case 'stability':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCapabilityColor = (capability: string): string => {
    switch (capability) {
      case 'text':
        return 'bg-blue-50 text-blue-700';
      case 'image':
        return 'bg-pink-50 text-pink-700';
      case 'code':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTokenInfo = () => {
    if (!model.tokensPerCredit) return null;
    
    return (
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">{model.tokensPerCredit.toLocaleString()}</span> tokens per credit
      </div>
    );
  };

  const renderPricing = () => {
    if (!model.apiPricing) return null;
    
    return (
      <div className="mt-2 space-y-1">
        <h4 className="text-xs font-medium text-gray-700">API Pricing</h4>
        
        <div className="grid grid-cols-2 gap-1 text-xs">
          {model.apiPricing.input && (
            <>
              <div className="text-gray-500">Input:</div>
              <div className="font-medium">${model.apiPricing.input}/1K tokens</div>
            </>
          )}
          
          {model.apiPricing.output && (
            <>
              <div className="text-gray-500">Output:</div>
              <div className="font-medium">${model.apiPricing.output}/1K tokens</div>
            </>
          )}
          
          {model.apiPricing.standard && (
            <>
              <div className="text-gray-500">Standard:</div>
              <div className="font-medium">${model.apiPricing.standard}/image</div>
            </>
          )}
          
          {model.apiPricing.hd && (
            <>
              <div className="text-gray-500">HD:</div>
              <div className="font-medium">${model.apiPricing.hd}/image</div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-4 border rounded-lg ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
      } transition-colors cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{model.displayName}</h3>
        <span className={`text-xs px-2 py-0.5 rounded ${getProviderColor(model.provider)}`}>
          {model.provider}
        </span>
      </div>
      
      <div className="text-sm text-gray-500 mt-1">{model.description}</div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {model.capabilities.map((capability) => (
          <span
            key={capability}
            className={`text-xs px-2 py-0.5 rounded ${getCapabilityColor(capability)}`}
          >
            {capability}
          </span>
        ))}
        
        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(model.status)}`}>
          {model.status}
        </span>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{model.baseCost} credits</div>
        {model.maxTokens && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">{(model.maxTokens / 1000).toLocaleString()}K</span> tokens
          </div>
        )}
      </div>
      
      {(showDetails || selected) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {renderTokenInfo()}
          {renderPricing()}
        </div>
      )}
    </div>
  );
};

export default ModelCard;

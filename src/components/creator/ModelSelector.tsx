'use client';

import React from 'react';
import { getModelsByType, getActiveModels, getModelById } from '@/lib/models/modelRegistry';

interface ModelSelectorProps {
  currentModel: string;
  onChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onChange }) => {
  // Get all active models - don't filter by type so we include image models too
  const allModels = getActiveModels();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {allModels.map((model) => {
        // Get base cost for medium prompts
        const baseCost = model.cost.medium;
        
        return (
          <div
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              currentModel === model.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-sm">{model.displayName}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {baseCost.toLocaleString()} credits
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{model.description}</p>
            <div className="flex mt-2 gap-1">
              {model.capabilities.includes('text') && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Text</span>
              )}
              {model.capabilities.includes('code') && (
                <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">Code</span>
              )}
              {model.capabilities.includes('image') && (
                <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">Image</span>
              )}
              {model.capabilities.includes('search') && (
                <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">Search</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModelSelector;
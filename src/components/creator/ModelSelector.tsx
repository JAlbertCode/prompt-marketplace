'use client';

import React from 'react';
import { SonarModel } from '@/types';

interface ModelSelectorProps {
  currentModel: SonarModel;
  onChange: (model: SonarModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onChange }) => {
  const models: { id: SonarModel; name: string; description: string }[] = [
    {
      id: 'sonar-small-online',
      name: 'Sonar Small Online',
      description: 'Fast responses, good for simple tasks'
    },
    {
      id: 'sonar-medium-online',
      name: 'Sonar Medium Online',
      description: 'Balance of speed and quality'
    },
    {
      id: 'sonar-medium-chat',
      name: 'Sonar Medium Chat',
      description: 'Optimized for conversational interactions'
    },
    {
      id: 'sonar-large-online',
      name: 'Sonar Large Online',
      description: 'High quality responses for complex tasks'
    },
    {
      id: 'sonar-small-chat',
      name: 'Sonar Small Chat',
      description: 'Fast chat responses for simple conversations'
    },
    {
      id: 'llama-3.1-sonar-small-128k-online',
      name: 'Llama 3.1 Sonar Small',
      description: 'Open source model with 128k context window'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {models.map((model) => (
        <div
          key={model.id}
          onClick={() => onChange(model.id)}
          className={`p-3 border rounded-md cursor-pointer transition-colors ${
            currentModel === model.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
          }`}
        >
          <h3 className="font-medium text-sm">{model.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{model.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ModelSelector;

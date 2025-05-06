"use client";

import React, { useState } from 'react';
import { models } from '@/lib/models';

interface ModelCostsTableProps {
  filter?: 'all' | 'openai' | 'sonar';
  showDetails?: boolean;
}

export default function ModelCostsTable({ 
  filter = 'all', 
  showDetails = false 
}: ModelCostsTableProps) {
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'openai' | 'sonar'>(filter);
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'audio' | 'image'>('all');
  
  // Filter models based on selection
  const filteredModels = models.filter(model => {
    // Filter by provider
    if (selectedProvider !== 'all' && model.provider !== selectedProvider) {
      return false;
    }
    
    // Filter by input/output type
    if (selectedType !== 'all' && model.inputType !== selectedType && model.outputType !== selectedType) {
      return false;
    }
    
    return true;
  });
  
  // Sort models by price (lowest first)
  const sortedModels = [...filteredModels].sort((a, b) => 
    a.cost.medium - b.cost.medium
  );
  
  // Format credits with commas
  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };
  
  // Convert credits to dollars
  const creditsToUSD = (credits: number) => {
    return (credits * 0.000001).toFixed(6);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
        <div>
          <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            id="provider-filter"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Providers</option>
            <option value="openai">OpenAI</option>
            <option value="sonar">Sonar</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short Prompt
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medium Prompt
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Long Prompt
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedModels.map((model) => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{model.displayName || model.name}</div>
                  {showDetails && (
                    <div className="text-xs text-gray-500 mt-1">{model.description || model.id}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {model.provider.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {model.inputType === model.outputType 
                      ? `${model.inputType.charAt(0).toUpperCase()}${model.inputType.slice(1)}`
                      : `${model.inputType} → ${model.outputType}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCredits(model.cost.short)}</div>
                  <div className="text-xs text-gray-500">${creditsToUSD(model.cost.short)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCredits(model.cost.medium)}</div>
                  <div className="text-xs text-gray-500">${creditsToUSD(model.cost.medium)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCredits(model.cost.long)}</div>
                  <div className="text-xs text-gray-500">${creditsToUSD(model.cost.long)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state */}
      {sortedModels.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No models match the selected filters</p>
          <button
            onClick={() => {
              setSelectedProvider('all');
              setSelectedType('all');
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Reset filters
          </button>
        </div>
      )}
      
      {/* Legend and info */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 text-sm text-gray-600">
        <p className="mb-1">
          <strong>Prompt Length:</strong> Costs shown are in credits (1 credit = $0.000001 USD)
        </p>
        <ul className="list-disc list-inside ml-2 text-xs space-y-1">
          <li><strong>Short:</strong> Up to 1,000 tokens (approx. 750 words)</li>
          <li><strong>Medium:</strong> 1,001-4,000 tokens (approx. 750-3,000 words)</li>
          <li><strong>Long:</strong> Over 4,000 tokens (approx. 3,000+ words)</li>
        </ul>
      </div>
    </div>
  );
}

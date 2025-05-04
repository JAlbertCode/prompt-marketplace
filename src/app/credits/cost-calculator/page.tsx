'use client';

import React, { useState, useEffect } from 'react';
import { getAllModels, getModelById, ModelInfo } from '@/lib/models/modelRegistry';
import { getCostBreakdown } from '@/lib/models/modelCosts';
import CostDisplay from '@/components/credits/CostDisplay';

export default function CostCalculatorPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [creatorFee, setCreatorFee] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<{
    inferenceCost: number;
    creatorFee: number;
    platformMarkup: number;
    totalCost: number;
    dollarCost: string;
    runsPerDollar: number;
  } | null>(null);

  useEffect(() => {
    // Get all available models
    const availableModels = getAllModels();
    setModels(availableModels);
    
    // Set default model if available
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      // Calculate cost breakdown when model or creator fee changes
      const result = getCostBreakdown(selectedModel, creatorFee);
      setBreakdown(result);
    }
  }, [selectedModel, creatorFee]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleCreatorFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setCreatorFee(Math.max(0, value)); // Ensure no negative values
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Prompt Cost Calculator</h1>
      <p className="text-gray-600 mb-6">
        Calculate the cost of running prompts with different models and creator fees
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Input Parameters</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="model">
                Select Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.displayName} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="creatorFee">
                Creator Fee (in credits)
              </label>
              <input
                id="creatorFee"
                type="number"
                min="0"
                value={creatorFee}
                onChange={handleCreatorFeeChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Add a fee that will be charged to users and paid to you (80% to creator, 20% to platform)
              </p>
            </div>
            
            {selectedModel && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                <h3 className="font-medium mb-2">Selected Model Details</h3>
                {(() => {
                  const model = getModelById(selectedModel);
                  if (!model) return <p>Model not found</p>;
                  
                  return (
                    <div className="text-sm">
                      <p><span className="font-medium">Name:</span> {model.displayName}</p>
                      <p><span className="font-medium">Provider:</span> {model.provider}</p>
                      <p><span className="font-medium">Type:</span> {model.type}</p>
                      <p><span className="font-medium">Base Cost:</span> {model.baseCost.toLocaleString()} credits</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {model.description}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Cost Breakdown</h2>
            
            {breakdown ? (
              <>
                <CostDisplay
                  breakdown={{
                    inferenceCost: breakdown.inferenceCost,
                    platformMarkup: breakdown.platformMarkup,
                    creatorFee: breakdown.creatorFee,
                    totalCost: breakdown.totalCost,
                  }}
                  showBreakdown={true}
                />
                
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-700 mb-2">At This Price:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><span className="font-medium">Cost per run:</span> {breakdown.dollarCost}</li>
                    <li><span className="font-medium">Runs per $1:</span> {breakdown.runsPerDollar.toLocaleString()}</li>
                    <li><span className="font-medium">Creator earnings per run:</span> {Math.floor(breakdown.creatorFee * 0.8).toLocaleString()} credits</li>
                    <li><span className="font-medium">Platform fee:</span> {breakdown.creatorFee > 0 
                      ? `${Math.floor(breakdown.creatorFee * 0.2).toLocaleString()} credits (20% of creator fee)` 
                      : `${breakdown.platformMarkup.toLocaleString()} credits (tiered markup)`}
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a model to see cost breakdown</p>
              </div>
            )}
            
            <div className="mt-6 text-sm text-gray-500">
              <p>All costs are in whole-number credits. 1 credit = $0.000001</p>
              <p>Platform markup is only applied when no creator fee is set.</p>
              <p>When a creator fee is set, the platform takes 20% of that fee instead.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

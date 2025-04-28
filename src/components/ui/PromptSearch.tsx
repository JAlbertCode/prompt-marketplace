import React, { useState, useEffect } from 'react';
import { SonarModel } from '@/types';

interface PromptSearchProps {
  onSearch: (query: string) => void;
  onModelFilter: (model: SonarModel | 'all') => void;
  onCreditFilter: (minCredits: number, maxCredits: number) => void;
}

const PromptSearch: React.FC<PromptSearchProps> = ({
  onSearch,
  onModelFilter,
  onCreditFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<SonarModel | 'all'>('all');
  const [creditRange, setCreditRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SonarModel | 'all';
    setSelectedModel(value);
    onModelFilter(value);
  };
  
  const handleCreditMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(e.target.value) || 0;
    setCreditRange(prev => ({ ...prev, min }));
    onCreditFilter(min, creditRange.max);
  };
  
  const handleCreditMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = parseInt(e.target.value) || 100;
    setCreditRange(prev => ({ ...prev, max }));
    onCreditFilter(creditRange.min, max);
  };
  
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="ml-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {showFilters ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </button>
      </div>
      
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="model-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              id="model-filter"
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Models</option>
              <option value="sonar-small-online">Sonar Small</option>
              <option value="sonar-medium-chat">Sonar Medium</option>
              <option value="sonar-large-online">Sonar Large</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Cost
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={creditRange.min}
                onChange={handleCreditMinChange}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min="0"
                value={creditRange.max}
                onChange={handleCreditMaxChange}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSearch;

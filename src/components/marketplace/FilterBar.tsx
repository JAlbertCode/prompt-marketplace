'use client';

import React, { useState } from 'react';
import { SonarModel } from '@/types';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onModelFilter: (model: SonarModel | 'all') => void;
  onCreditFilter: (min: number, max: number) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onModelFilter,
  onCreditFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [creditMin, setCreditMin] = useState(0);
  const [creditMax, setCreditMax] = useState(1000);
  const [modelFilter, setModelFilter] = useState<SonarModel | 'all'>('all');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SonarModel | 'all';
    setModelFilter(value);
    onModelFilter(value);
  };
  
  const handleCreditMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCreditMin(value);
    onCreditFilter(value, creditMax);
  };
  
  const handleCreditMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCreditMax(value);
    onCreditFilter(creditMin, value);
  };
  
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Search by title or description"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            id="model"
            value={modelFilter}
            onChange={handleModelChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Models</option>
            <option value="sonar-small-online">Sonar Small Online</option>
            <option value="sonar-small-chat">Sonar Small Chat</option>
            <option value="sonar-medium-online">Sonar Medium Online</option>
            <option value="sonar-medium-chat">Sonar Medium Chat</option>
            <option value="sonar-large-online">Sonar Large Online</option>
            <option value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Cost
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={creditMin}
              onChange={handleCreditMinChange}
              min="0"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Min"
            />
            <span className="flex items-center text-gray-500">—</span>
            <input
              type="number"
              value={creditMax}
              onChange={handleCreditMaxChange}
              min="0"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

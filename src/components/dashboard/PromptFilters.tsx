import React, { useState } from 'react';
import Button from "@/components/shared/Button";
import { Filter, SortDesc, Grid, List, Search } from "lucide-react";

interface PromptFiltersProps {
  onFilterChange: (filters: any) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  onSortChange: (sort: string) => void;
  view: 'grid' | 'list';
}

export default function PromptFilters({ 
  onFilterChange, 
  onViewChange, 
  onSortChange, 
  view 
}: PromptFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ search: value });
  };

  const filterOptions = [
    { label: 'All Prompts', value: 'all' },
    { label: 'My Prompts', value: 'mine' },
    { label: 'Favorites', value: 'favorites' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'drafts' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Used', value: 'most-used' },
    { label: 'Highest Rated', value: 'highest-rated' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search prompts..."
          className="w-full pl-10 py-2 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="flex gap-2">
        <div className="relative">
          <Button 
            variant="outline"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-1 px-3 py-2"
          >
            <Filter size={18} />
          </Button>
          
          {showFilterMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              {filterOptions.map((option) => (
                <div 
                  key={option.value}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onFilterChange({ type: option.value });
                    setShowFilterMenu(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <Button 
            variant="outline"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 px-3 py-2"
          >
            <SortDesc size={18} />
          </Button>
          
          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              {sortOptions.map((option) => (
                <div 
                  key={option.value}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => onViewChange('grid')}
          className={`flex items-center px-3 py-2 ${view === 'grid' ? 'bg-blue-100 border-blue-300' : ''}`}
        >
          <Grid size={18} />
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onViewChange('list')}
          className={`flex items-center px-3 py-2 ${view === 'list' ? 'bg-blue-100 border-blue-300' : ''}`}
        >
          <List size={18} />
        </Button>
      </div>
    </div>
  );
}

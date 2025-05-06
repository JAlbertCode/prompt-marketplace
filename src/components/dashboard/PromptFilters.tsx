import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
  const [searchTerm, setSearchTerm] = React.useState('');

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
        <Input
          placeholder="Search prompts..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {filterOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => onFilterChange({ type: option.value })}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SortDesc size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sortOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => onSortChange(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onViewChange('grid')}
          className={view === 'grid' ? 'bg-primary/10' : ''}
        >
          <Grid size={18} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onViewChange('list')}
          className={view === 'list' ? 'bg-primary/10' : ''}
        >
          <List size={18} />
        </Button>
      </div>
    </div>
  );
}

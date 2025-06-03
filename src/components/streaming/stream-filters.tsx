
'use client';

import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

interface StreamFiltersProps {
  currentFilter: string;
  onFilterChange: (category: string) => void;
  streamCategories: string[];
}

export default function StreamFilters({ currentFilter, onFilterChange, streamCategories }: StreamFiltersProps) {

  const handleFilterClick = (category: string) => {
    onFilterChange(category);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Filtrar por região:</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {streamCategories.map((category) => (
          <Button
            key={category}
            variant={currentFilter === category ? 'default' : 'outline'}
            onClick={() => handleFilterClick(category)}
            className="rounded-full text-xs px-3 py-1 h-auto"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}

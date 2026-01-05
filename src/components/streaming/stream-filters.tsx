
'use client';

import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


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
    <div className="relative">
       <div className="absolute left-3 top-1/2 -translate-y-1/2">
         <ListFilter className="h-4 w-4 text-muted-foreground" />
       </div>
       <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 pl-10">
          {streamCategories.map((category) => (
            <Button
              key={category}
              variant={currentFilter === category ? "default" : "outline"}
              onClick={() => handleFilterClick(category)}
              className="rounded-full text-xs px-3 py-1 h-auto"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-0" />
      </ScrollArea>
    </div>
  );
}

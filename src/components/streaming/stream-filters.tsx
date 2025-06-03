'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListFilter } from 'lucide-react';

const categories = ['Todos', 'Trânsito', 'Eventos', 'Suporte', 'Paisagens', 'Notícias'];

interface StreamFiltersProps {
  onFilterChange: (category: string) => void;
}

export default function StreamFilters({ onFilterChange }: StreamFiltersProps) {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const handleFilterClick = (category: string) => {
    setActiveCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <ListFilter className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold font-headline">Filtrar por Categoria</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => handleFilterClick(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}

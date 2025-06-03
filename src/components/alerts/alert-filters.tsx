
'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface AlertFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  alertTypes: string[];
}

export default function AlertFilters({ currentFilter, onFilterChange, alertTypes }: AlertFiltersProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Filtrar por tipo:</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {alertTypes.map((type) => (
          <Button
            key={type}
            variant={currentFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(type)}
            className="rounded-full text-xs px-3 py-1 h-auto"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}

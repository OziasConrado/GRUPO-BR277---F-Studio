
'use client';

import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

interface SauFiltersProps {
  concessionaires: string[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function SauFilters({ concessionaires, currentFilter, onFilterChange }: SauFiltersProps) {
  return (
    <div className="mb-4 p-4 rounded-lg bg-card border">
      <div className="flex items-center mb-2">
        <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="font-medium text-muted-foreground">Filtrar por concessionária:</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {concessionaires.map((concessionaire) => (
          <Button
            key={concessionaire}
            variant={currentFilter === concessionaire ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(concessionaire)}
            className="rounded-full px-3 py-1 h-auto"
          >
            {concessionaire}
          </Button>
        ))}
      </div>
    </div>
  );
}

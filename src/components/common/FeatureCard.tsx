
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface FeatureCardProps {
  tool: {
    id: string;
    title: string;
    Icon: LucideIcon;
    href: string;
    description: string;
    category: 'Saúde e Bem Estar' | 'Logística e Trânsito' | 'Geradores e Úteis';
  };
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, toolId: string) => void;
}

const categoryInfo = {
    'Saúde e Bem Estar': { className: 'bg-green-100 text-green-800' },
    'Logística e Trânsito': { className: 'bg-blue-100 text-blue-800' },
    'Geradores e Úteis': { className: 'bg-slate-100 text-slate-800' },
};

export default function FeatureCard({ tool, isFavorite, onToggleFavorite }: FeatureCardProps) {
  const categoryStyle = categoryInfo[tool.category];
  
  return (
    <div className="relative group h-full">
        <Link href={tool.href} passHref className="block h-full">
            <Card className="rounded-xl overflow-hidden h-full hover:shadow-lg transition-shadow duration-200 bg-card hover:bg-card/90">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <div className={cn("p-3 mb-2 rounded-full group-hover:bg-primary/5 transition-colors", categoryStyle.className)}>
                        <tool.Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </CardContent>
            </Card>
        </Link>
        <button
            onClick={(e) => onToggleFavorite(e, tool.id)}
            className="absolute top-1.5 right-1.5 z-10 p-2 text-white"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Star className={cn("h-5 w-5 transition-all duration-200 ease-in-out", isFavorite ? "text-amber-400 fill-amber-400 scale-110" : "text-slate-400/70 hover:text-amber-400 hover:scale-125")} />
        </button>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  className?: string;
}

const AdPlaceholder = ({ className }: AdPlaceholderProps) => {
  return (
    <div className={cn("px-4", className)}>
      <div className="relative h-20 w-full max-w-sm mx-auto bg-muted/30 border border-dashed rounded-lg flex items-center justify-center">
        <div className="absolute top-1.5 text-center">
             <p className="text-muted-foreground text-[10px] leading-tight">Publicidade</p>
        </div>
      </div>
    </div>
  );
};

export default AdPlaceholder;

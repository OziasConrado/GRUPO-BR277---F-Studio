
'use client';

import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  className?: string;
}

const AdPlaceholder = ({ className }: AdPlaceholderProps) => {
  return (
    <div className={cn("p-4 rounded-xl flex items-center justify-center", className)}>
      <div className="h-24 w-full max-w-sm bg-muted/30 border border-dashed rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Publicidade</p>
      </div>
    </div>
  );
};

export default AdPlaceholder;

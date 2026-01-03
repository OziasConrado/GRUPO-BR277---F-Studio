'use client';

import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-2 rounded-xl bg-muted/30 border border-dashed h-20 flex items-start justify-center", className)}>
    <p className="text-muted-foreground text-xs pt-1">Publicidade</p>
  </div>
);

export default AdPlaceholder;

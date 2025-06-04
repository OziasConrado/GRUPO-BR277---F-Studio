
'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarDisplayProps {
  rating: number;
  maxStars?: number;
  size?: number;
  className?: string;
  starClassName?: string;
}

export default function StarDisplay({
  rating,
  maxStars = 5,
  size = 20,
  className,
  starClassName,
}: StarDisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 <= 0.75; // Consider 0.25 to 0.75 as half
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className={cn("fill-amber-400 text-amber-500", starClassName)}
        />
      ))}
      {hasHalfStar && (
        <StarHalf
          key="half"
          size={size}
          className={cn("fill-amber-400 text-amber-500", starClassName)}
        />
      )}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => ( // Ensure emptyStars is not negative
        <Star
          key={`empty-${i}`}
          size={size}
          className={cn("text-slate-300 dark:text-slate-600", starClassName)}
        />
      ))}
    </div>
  );
}

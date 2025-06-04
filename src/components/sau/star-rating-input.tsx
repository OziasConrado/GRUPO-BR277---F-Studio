
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  count?: number;
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  className?: string;
  starClassName?: string;
  disabled?: boolean;
}

export default function StarRatingInput({
  count = 5,
  value,
  onChange,
  size = 28,
  className,
  starClassName,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const stars = Array(count).fill(0);

  const handleClick = (newValue: number) => {
    if (disabled) return;
    onChange(newValue);
  };

  const handleMouseOver = (newHoverValue: number) => {
    if (disabled) return;
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(undefined);
  };

  return (
    <div className={cn("flex items-center gap-1", className, disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer")}>
      {stars.map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "transition-colors",
              (hoverValue || value) >= starValue
                ? "fill-amber-400 text-amber-500"
                : "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600",
              starClassName
            )}
            onClick={() => handleClick(starValue)}
            onMouseOver={() => handleMouseOver(starValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Avaliar com ${starValue} estrela${starValue > 1 ? 's' : ''}`}
          />
        );
      })}
    </div>
  );
}


import Image from 'next/image';

interface GrupoBR277LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function GrupoBR277Logo({ className, width = 150, height = 40 }: GrupoBR277LogoProps) {
  return (
    <Image
      src={`https://placehold.co/${width}x${height}.png`}
      alt="GRUPO BR277 Logo"
      width={width}
      height={height}
      className={className}
      data-ai-hint="road company logo"
      priority
    />
  );
}

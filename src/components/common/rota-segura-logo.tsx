
import Image from 'next/image';

interface RotaSeguraLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function RotaSeguraLogo({ className, width = 150, height = 40 }: RotaSeguraLogoProps) {
  return (
    <Image
      src={`https://placehold.co/${width}x${height}.png`}
      alt="Rota Segura Logo"
      width={width}
      height={height}
      className={className}
      data-ai-hint="road company logo"
      priority
    />
  );
}

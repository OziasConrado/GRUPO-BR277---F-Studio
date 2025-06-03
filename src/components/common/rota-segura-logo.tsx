import Image from 'next/image';

interface RotaSeguraLogoProps {
  className?: string;
}

export function RotaSeguraLogo({ className }: RotaSeguraLogoProps) {
  return (
    <Image
      src="https://placehold.co/150x40.png"
      alt="Rota Segura Logo"
      width={150}
      height={40}
      className={className}
      data-ai-hint="road company logo"
      priority
    />
  );
}

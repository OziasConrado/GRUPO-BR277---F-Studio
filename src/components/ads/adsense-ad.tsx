'use client';
    
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdSenseAdProps {
  adSlot: string; // O ID do seu bloco de anúncios
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: {
      push: (props: object) => void;
    }[];
  }
}

const AdSenseAd = ({ adSlot, className }: AdSenseAdProps) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        className={cn(`flex items-center justify-center bg-muted/30 border border-dashed text-muted-foreground text-sm h-24 rounded-lg`, className)}
      >
        Anúncio do AdSense (Visível em Produção)
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3646331718909935" // Publisher ID
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseAd;

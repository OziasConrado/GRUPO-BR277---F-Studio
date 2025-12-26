
'use client';
    
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdSenseAdProps {
  adSlot: string;
  className?: string;
  adKey: string; // Chave única para forçar a recriação do componente
}

declare global {
  interface Window {
    adsbygoogle?: {
      push: (props: object) => void;
    }[];
  }
}

const AdSenseAd = ({ adSlot, className, adKey }: AdSenseAdProps) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [adKey]); // Depender da chave única para re-executar quando necessário

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        key={adKey}
        className={cn(`flex items-center justify-center bg-muted/30 border border-dashed text-muted-foreground text-sm h-24 rounded-lg`, className)}
      >
        Anúncio do AdSense (Slot: {adSlot})
      </div>
    );
  }

  return (
    <div className={className} key={adKey}>
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

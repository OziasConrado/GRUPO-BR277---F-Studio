'use client';
    
import { useEffect } from 'react';

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
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 border border-dashed text-muted-foreground text-sm h-24 rounded-lg ${className}`}
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
        data-ad-client={`ca-SEU_PUBLISHER_ID_AQUI`} // Substitua
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseAd;

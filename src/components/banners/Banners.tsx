'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { fetchAllBannersServer } from '@/app/actions/firestore'; // Import Server Action

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  order: number;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      const result = await fetchAllBannersServer();
      if (result.success) {
        // A API REST retorna os banners ativos, não precisa filtrar aqui
        setBanners(result.data);
      } else {
        console.error("Falha ao buscar banners:", result.error);
        // Opcional: Adicionar um toast de erro se necessário
      }
      setLoading(false);
    };
    loadBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[155px] flex items-center justify-center bg-muted rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Não renderiza nada se não houver banners
  }

  return (
    <div className="w-full mb-6">
      <Carousel
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        opts={{
          align: "start",
          loop: banners.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                <img
                  src={banner.imageUrl}
                  alt={banner.name}
                  className="w-full h-auto object-contain"
                  crossOrigin="anonymous"
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
            <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </>
        )}
      </Carousel>
    </div>
  );
}

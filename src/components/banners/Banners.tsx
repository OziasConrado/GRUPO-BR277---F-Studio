'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  order: number;
}

export default function Banners() {
  const { firestore } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }

    const bannersCollection = collection(firestore, 'banners');
    const q = query(bannersCollection, where('isActive', '==', true), orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      setBanners(fetchedBanners);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching banners: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  if (loading) {
    return (
      <div className="w-full h-[155px] flex items-center justify-center bg-muted rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if there are no active banners
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
          loop: true,
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

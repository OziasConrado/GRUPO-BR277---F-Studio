'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import type { TouristPointData } from '@/types/turismo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, MapPin, Tag, Info, AlertTriangle, ExternalLink, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={`my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center ${className}`}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

export default function TouristPointDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [point, setPoint] = useState<TouristPointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && firestore) {
      const fetchPoint = async () => {
        setLoading(true);
        setError(null);
        try {
          const pointRef = doc(firestore, 'tourist_points_indicated', id);
          const docSnap = await getDoc(pointRef);

          if (docSnap.exists()) {
            setPoint({ id: docSnap.id, ...docSnap.data() } as TouristPointData);
          } else {
            setError('Ponto turístico não encontrado.');
            toast({
              variant: 'destructive',
              title: 'Erro',
              description: 'O ponto turístico que você está tentando acessar não existe.',
            });
          }
        } catch (err) {
          console.error('Error fetching tourist point:', err);
          setError('Ocorreu um erro ao carregar as informações.');
          toast({
            variant: 'destructive',
            title: 'Erro de Carregamento',
            description: 'Não foi possível carregar os detalhes do ponto turístico.',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchPoint();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] text-center">
        <Card className="w-full max-w-md p-6">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive">Erro</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/turismo">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Turismo
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!point) {
    return null; // or a fallback component
  }
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.locationName}`)}`;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Link href="/turismo" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para a página de Turismo
      </Link>

      <Card className="rounded-xl shadow-lg overflow-hidden">
        <div className="relative w-full h-64 md:h-80 bg-muted">
          <Image
            src={point.imageUrl}
            alt={`Foto de ${point.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={point.dataAIImageHint}
          />
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{point.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="secondary" className="flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              {point.category}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              {point.locationName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdPlaceholder />
          <div>
            <h3 className="flex items-center text-lg font-semibold mb-2">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Sobre o local
            </h3>
            <p className="text-base text-foreground/90 whitespace-pre-line">
              {point.description}
            </p>
             {point.indicatedByUserName && (
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                    Indicado por: <strong>{point.indicatedByUserName}</strong>
                </p>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <Button asChild size="lg" className="rounded-full">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Como chegar
                </a>
            </Button>
             <Button variant="outline" size="lg" className="rounded-full" onClick={() => toast({ title: "Em Breve", description: "A funcionalidade de avaliação estará disponível em breve."})}>
                <Star className="mr-2 h-4 w-4" /> Avaliar este local
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

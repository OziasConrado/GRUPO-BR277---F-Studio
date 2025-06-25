'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionData {
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

const regions: RegionData[] = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Frotas-do-pinh%C3%A3o.webp?alt=media',
    imageHint: 'Paisagem com araucárias representando as Rotas do Pinhão',
    title: 'Rotas do Pinhão',
    description: 'Que tal viajar pelo mundo dentro do Paraná? Isso é possível visitando a região Rotas do Pinhão. O lugar, que compreende Curitiba e grande parte da Região Metropolitana, tem forte influência da imigração europeia, principalmente polonesa, ucraniana, italiana e alemã. Traços distintivos das culturas mineira, paulista e do tropeirismo também ajudam a formar um caleidoscópio de sotaques, sabores e tradições.\n\nA convivência harmônica entre o ritmo frenético da metrópole e o bucolismo das áreas rurais é um atrativo à parte e oferece inúmeras opções de turismo, do cultural ao de aventura, do religioso ao rural.\n\nE a culinária? É tanta comida boa, de tantas partes do mundo, que fica difícil escolher o que pedir ou manter a dieta. São muitas opções! Algumas delas temperadas com o sabor inconfundível de um dos maiores patrimônios gastronômicos do Paraná – o pinhão.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Rotas-do-Pinhao',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Flitoral-do-paran%C3%A1.webp?alt=media',
    imageHint: 'Praia do litoral do Paraná',
    title: 'Litoral do Paraná',
    description: 'São 125 praias e balneários com areias brancas, águas mornas e limpas. Destinos na temperatura certa para a diversão, perfeitos para quem curte o sossego. As mais de 50 ilhas são um caso à parte, verdadeiros paraísos com natureza preservada.\n\nA vida noturna é bem movimentada, com bistrôs, restaurantes e música ao vivo nos bares e baladas. Sobram opções para se divertir. Hotéis e pousadas ao longo da costa dão todo o suporte para o turista.\n\nSeja qual for a sua praia, o seu destino está aqui! Venha viver tudo o que o Litoral do Paraná pode oferecer!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Litoral-do-Parana',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fcampos-gerais.webp?alt=media',
    imageHint: 'Cânion Guartelá nos Campos Gerais',
    title: 'Campos Gerais',
    description: 'Visitar os municípios da região turística paranaense dos Campos Gerais é se encantar com as maravilhas que a natureza proporciona. Entre áreas verdes de preservação, cânions e cachoeiras, o turista terá muitos momentos de lazer e contemplação junto à família e amigos.\n\nNão se esqueça de conhecer também os templos religiosos e saborear as delícias gastronômicas; assim, você aproveita a região em uma experiência completa.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Campos-Gerais',
  },
];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

const RegionCard = ({ region }: { region: RegionData }) => (
  <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border-white/10 dark:border-slate-700/10">
    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
      <div className="relative w-full sm:w-1/3 aspect-square flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={region.imageUrl}
          alt={region.title}
          layout="fill"
          objectFit="cover"
          data-ai-hint={region.imageHint}
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="font-headline text-xl mb-2">{region.title}</h3>
        <p className="text-sm text-foreground/80 flex-grow whitespace-pre-line">{region.description}</p>
        <Button asChild className="mt-4 w-full sm:w-fit self-end">
          <a href={region.buttonUrl} target="_blank" rel="noopener noreferrer">
            {region.buttonText} <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <AdPlaceholder className="mt-4" />
      </div>
    </CardContent>
  </Card>
);

export default function ViajeParanaPage() {
  return (
    <div className="w-full space-y-8">
      <Link href="/turismo" className="inline-flex items-center text-sm text-primary hover:underline mb-0">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Turismo
      </Link>

      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative w-48 h-24">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fviaje-parana.webp?alt=media"
            alt="Logo Viaje Paraná"
            layout="fill"
            objectFit="contain"
            data-ai-hint="viaje parana logo"
          />
        </div>
        <p className="max-w-2xl text-muted-foreground">
          O Paraná te convida a desvendar um leque de experiências inesquecíveis. De paisagens exuberantes a rica herança cultural, há algo para todos os gostos.
        </p>
      </header>
      
      <AdPlaceholder />

      <main className="space-y-6">
        {regions.map((region) => (
          <RegionCard key={region.title} region={region} />
        ))}
      </main>
    </div>
  );
}

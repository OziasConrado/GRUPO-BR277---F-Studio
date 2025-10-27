
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0,00',
    period: '6 meses',
    cta: 'Começar Grátis',
    href: '/cadastro/gratuito',
    features: [
      { text: 'Nome, Categoria e Descrição', included: true },
      { text: 'Endereço e Mapa (Pin)', included: true },
      { text: 'Botão ligar', included: true },
      { text: 'Exibição de Avaliações', included: true },
      { text: 'Foto Principal (logo)', included: false },
      { text: 'Geolocalização', included: false },
      { text: 'Link para WhatsApp', included: false },
      { text: 'Horário de Atendimento', included: false },
      { text: 'Imagens Promocionais', included: false },
      { text: 'Links para Redes Sociais', included: false },
      { text: 'Link para Website', included: false },
    ],
    isPopular: false,
    cardClass: 'bg-card',
    buttonVariant: 'outline' as const,
    extraInfo: 'Contém anúncio'
  },
  {
    name: 'Intermediário',
    price: 'R$ 83,40',
    period: 'Semestral',
    cta: 'Comprar Agora',
    href: '/cadastro/intermediario',
    features: [
      { text: 'Nome, Categoria e Descrição', included: true },
      { text: 'Endereço e Mapa (Pin)', included: true },
      { text: 'Botão ligar', included: true },
      { text: 'Exibição de Avaliações', included: true },
      { text: 'Foto Principal (logo)', included: true },
      { text: 'Geolocalização', included: true },
      { text: 'Link para WhatsApp', included: true },
      { text: 'Horário de Atendimento', included: true },
      { text: '2 Imagens Promocionais', included: true },
      { text: 'Links para Redes Sociais', included: true },
      { text: 'Link para Website', included: true },
    ],
    isPopular: false,
    cardClass: 'bg-secondary/30 dark:bg-secondary/20',
    buttonVariant: 'secondary' as const,
    extraInfo: 'Sem anúncio'
  },
  {
    name: 'Premium',
    price: 'R$ 118,80',
    period: 'Anual',
    cta: 'Comprar Agora',
    href: '/cadastro/premium',
    features: [
      { text: 'Nome, Categoria e Descrição', included: true },
      { text: 'Endereço e Mapa (Pin)', included: true },
      { text: 'Botão ligar', included: true },
      { text: 'Exibição de Avaliações', included: true },
      { text: 'Foto Principal (logo)', included: true },
      { text: 'Geolocalização', included: true },
      { text: 'Link para WhatsApp', included: true },
      { text: 'Horário de Atendimento', included: true },
      { text: '4 Imagens Promocionais', included: true },
      { text: 'Links para Redes Sociais', included: true },
      { text: 'Link para Website', included: true },
    ],
    isPopular: true,
    cardClass: 'bg-primary/5 border-primary/50 dark:bg-primary/10',
    buttonVariant: 'default' as const,
    extraInfo: 'Sem anúncio'
  },
];

const FeatureItem = ({ text, included }: { text: string; included: boolean }) => (
  <li className="flex items-center gap-2">
    {included ? (
      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-destructive/70 flex-shrink-0" />
    )}
    <span className={cn("text-sm", !included && "text-muted-foreground line-through")}>{text}</span>
  </li>
);

export default function PlanosPage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Nossos Planos</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Escolha o plano que melhor se adapta ao seu negócio e comece a ser visto por milhares de usuários na estrada.
        </p>
      </div>

      <AdPlaceholder />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("rounded-xl shadow-lg flex flex-col transition-transform hover:scale-105", plan.cardClass, plan.isPopular && "border-2 border-primary")}>
            {plan.isPopular && (
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Star className="h-3 w-3" /> Mais Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground"> / {plan.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <FeatureItem key={index} text={feature.text} included={feature.included} />
                ))}
              </ul>
               {plan.extraInfo && (
                <p className="text-xs text-center text-muted-foreground mt-4">{plan.extraInfo}</p>
              )}
            </CardContent>
            <CardFooter className="p-4">
              <Button asChild size="lg" className="w-full rounded-full" variant={plan.buttonVariant}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

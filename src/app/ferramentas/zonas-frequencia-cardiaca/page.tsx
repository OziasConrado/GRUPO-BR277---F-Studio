'use client';

import { useState, type FormEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, HeartPulse, BarChart3, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

interface ZonaFC {
  nome: string;
  percentual: string;
  range: string;
  beneficios: string;
  cor: string; // Tailwind color class
}

interface ResultadoFC {
  fcm: number;
  zonas: ZonaFC[];
}

export default function ZonasFrequenciaCardiacaPage() {
  const [idade, setIdade] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoFC | null>(null);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const idadeNum = parseInt(idade);

    if (isNaN(idadeNum) || idadeNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Idade Inválida',
        description: 'Por favor, insira uma idade válida.',
      });
      return;
    }

    const fcm = 220 - idadeNum;
    const zonas: ZonaFC[] = [
      {
        nome: 'Zona 1: Leve',
        percentual: '50-60%',
        range: `${Math.round(fcm * 0.5)} - ${Math.round(fcm * 0.6)} bpm`,
        beneficios: 'Recuperação ativa, aquecimento, melhora da saúde geral.',
        cor: 'bg-sky-500',
      },
      {
        nome: 'Zona 2: Moderada',
        percentual: '60-70%',
        range: `${Math.round(fcm * 0.6)} - ${Math.round(fcm * 0.7)} bpm`,
        beneficios: 'Melhora a resistência cardiovascular, queima de gordura.',
        cor: 'bg-green-500',
      },
      {
        nome: 'Zona 3: Vigorosa',
        percentual: '70-80%',
        range: `${Math.round(fcm * 0.7)} - ${Math.round(fcm * 0.8)} bpm`,
        beneficios: 'Melhora da capacidade aeróbica, "ritmo de conforto".',
        cor: 'bg-yellow-500',
      },
      {
        nome: 'Zona 4: Intensa',
        percentual: '80-90%',
        range: `${Math.round(fcm * 0.8)} - ${Math.round(fcm * 0.9)} bpm`,
        beneficios: 'Aumenta o limiar anaeróbico, melhora da velocidade e performance.',
        cor: 'bg-orange-500',
      },
      {
        nome: 'Zona 5: Máxima',
        percentual: '90-100%',
        range: `${Math.round(fcm * 0.9)} - ${fcm} bpm`,
        beneficios: 'Esforço máximo, para treinos de curta duração e atletas experientes.',
        cor: 'bg-red-500',
      },
    ];

    setResultado({ fcm, zonas });
  };
  
  const chartData = useMemo(() => {
    if (!resultado) return [];
    return resultado.zonas.map(z => {
        const [min, max] = z.range.replace(/ bpm/g, '').split(' - ').map(Number);
        return { name: z.percentual, range: [min, max], label: z.nome };
    });
  }, [resultado]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Zonas de Frequência Cardíaca</CardTitle>
          </div>
          <CardDescription>Calcule suas zonas de treino ideais para otimizar seus exercícios.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <Label htmlFor="idade-fc">Sua Idade</Label>
              <Input id="idade-fc" type="number" inputMode="numeric" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 35" className="rounded-lg mt-1"/>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <HeartPulse className="mr-2 h-5 w-5" /> Calcular Zonas de FC
            </Button>
          </form>

          {resultado && (
            <div className="mt-8 pt-6 border-t">
              <Alert className="rounded-lg bg-primary/5 border-primary/20 text-center">
                  <HeartPulse className="h-5 w-5 text-primary mx-auto mb-2" />
                  <AlertTitle className="font-semibold text-primary text-lg">Sua Frequência Cardíaca Máxima (FCM) Estimada</AlertTitle>
                  <ShadcnAlertDescription className="text-primary/90 space-y-2 mt-2">
                      <p><strong className="text-2xl">{resultado.fcm} bpm</strong> (batimentos por minuto)</p>
                  </ShadcnAlertDescription>
              </Alert>

              <div className="mt-8">
                 <h3 className="text-lg font-semibold text-center mb-4">Suas Zonas de Treino</h3>
                 <div className="space-y-3">
                    {resultado.zonas.map(zona => (
                        <div key={zona.nome} className="p-3 border rounded-lg flex items-start gap-3">
                            <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", zona.cor)} />
                            <div>
                                <p className="font-semibold text-sm">{zona.nome} <span className="font-normal text-muted-foreground">({zona.percentual})</span></p>
                                <p className="font-bold text-base text-primary">{zona.range}</p>
                                <p className="text-xs text-muted-foreground mt-1">{zona.beneficios}</p>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>

               <AdPlaceholder className="mt-8" />
            </div>
          )}
        </CardContent>
      </Card>
      
       <Alert variant="default" className="mt-6 border-primary/20 bg-primary/5 text-primary/90">
        <Info className="h-5 w-5 !text-primary" />
        <AlertTitle className="font-semibold !text-primary">Aviso Importante</AlertTitle>
        <ShadcnAlertDescription className="!text-primary/80">
          Esta ferramenta usa a fórmula "220 - idade", que é uma estimativa geral. Para dados precisos, especialmente se você tiver condições de saúde, consulte um profissional de educação física ou um médico.
        </ShadcnAlertDescription>
      </Alert>
    </div>
  );
}

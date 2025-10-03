'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Route, Clock, Coffee, Flag, Trash2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

interface TimelineItem {
  type: 'drive' | 'pause' | 'arrival' | 'start';
  icon: React.ElementType;
  title: string;
  duration?: string;
  time: string;
  details?: string;
}

export default function PlanejamentoViagemPage() {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [distanciaTotal, setDistanciaTotal] = useState('');
  const [velocidadeMedia, setVelocidadeMedia] = useState('80');
  const [tempoDirecao, setTempoDirecao] = useState('270'); // 4h30min
  const [tempoPausa, setTempoPausa] = useState('30');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setTimeline([]);

    const dist = parseFloat(distanciaTotal);
    const vel = parseFloat(velocidadeMedia);
    const maxDrive = parseInt(tempoDirecao);
    const pauseTime = parseInt(tempoPausa);

    if (isNaN(dist) || dist <= 0 || isNaN(vel) || vel <= 0 || isNaN(maxDrive) || maxDrive <= 0 || isNaN(pauseTime) || pauseTime <= 0 || !horaInicio) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Preencha todos os campos com números positivos.',
      });
      return;
    }

    const duracaoTotalViagemMin = (dist / vel) * 60;
    let tempoDirigidoAcumulado = 0;
    let tempoDePausaAcumulado = 0;
    let newTimeline: TimelineItem[] = [];

    let [horas, minutos] = horaInicio.split(':').map(Number);
    let tempoAtual = new Date();
    tempoAtual.setHours(horas, minutos, 0, 0);

    const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    newTimeline.push({
        type: 'start',
        icon: MapPin,
        title: `Início da Viagem de ${origem || 'Origem'}`,
        time: formatTime(tempoAtual),
    });

    let tempoRestanteViagem = duracaoTotalViagemMin;

    while (tempoRestanteViagem > 0) {
      const trechoAtual = Math.min(tempoRestanteViagem, maxDrive);
      
      // Adicionar período de direção
      tempoAtual.setMinutes(tempoAtual.getMinutes() + trechoAtual);
      newTimeline.push({
        type: 'drive',
        icon: Route,
        title: 'Dirigindo',
        duration: `${Math.floor(trechoAtual / 60)}h ${Math.round(trechoAtual % 60)}min`,
        time: formatTime(tempoAtual),
      });

      tempoDirigidoAcumulado += trechoAtual;
      tempoRestanteViagem -= trechoAtual;

      if (tempoRestanteViagem > 0) {
        // Adicionar pausa
        tempoAtual.setMinutes(tempoAtual.getMinutes() + pauseTime);
        tempoDePausaAcumulado += pauseTime;
        newTimeline.push({
          type: 'pause',
          icon: Coffee,
          title: 'Pausa Obrigatória',
          duration: `${pauseTime} min`,
          time: formatTime(tempoAtual),
        });
      }
    }

    newTimeline.push({
      type: 'arrival',
      icon: Flag,
      title: `Chegada em ${destino || 'Destino'}`,
      time: formatTime(tempoAtual),
      details: `Tempo total de direção: ${Math.floor(tempoDirigidoAcumulado / 60)}h ${Math.round(tempoDirigidoAcumulado % 60)}min. Pausas: ${Math.floor(tempoDePausaAcumulado / 60)}h ${Math.round(tempoDePausaAcumulado % 60)}min.`
    });
    
    setTimeline(newTimeline);
  };

  const handleLimpar = () => {
    setOrigem('');
    setDestino('');
    setDistanciaTotal('');
    setVelocidadeMedia('80');
    setTempoDirecao('270');
    setTempoPausa('30');
    setHoraInicio('08:00');
    setTimeline([]);
    toast({ title: 'Campos Limpos', description: 'Pronto para um novo planejamento.' });
  };
  
  const getTimelineItemClasses = (type: TimelineItem['type']) => {
    switch(type) {
      case 'start': return 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'drive': return 'border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-300';
      case 'pause': return 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'arrival': return 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'border-muted';
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Route className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Planejamento de Viagem</CardTitle>
          </div>
          <CardDescription>Calcule suas paradas e horários para uma viagem segura e dentro da lei.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Input id="origem" value={origem} onChange={e => setOrigem(e.target.value)} placeholder="Ex: São Paulo, SP" className="rounded-lg mt-1"/>
                </div>
                <div>
                    <Label htmlFor="destino">Destino</Label>
                    <Input id="destino" value={destino} onChange={e => setDestino(e.target.value)} placeholder="Ex: Curitiba, PR" className="rounded-lg mt-1"/>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="distanciaTotal">Distância Total da Viagem (km)</Label>
                    <Input id="distanciaTotal" type="number" inputMode="decimal" value={distanciaTotal} onChange={e => setDistanciaTotal(e.target.value)} placeholder="Ex: 408" className="rounded-lg mt-1"/>
                </div>
                <div>
                    <Label htmlFor="velocidadeMedia">Velocidade Média (km/h)</Label>
                    <Input id="velocidadeMedia" type="number" inputMode="decimal" value={velocidadeMedia} onChange={e => setVelocidadeMedia(e.target.value)} placeholder="Ex: 80" className="rounded-lg mt-1"/>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="tempoDirecao">Tempo de Direção Contínua (min)</Label>
                    <Input id="tempoDirecao" type="number" inputMode="numeric" value={tempoDirecao} onChange={e => setTempoDirecao(e.target.value)} placeholder="Ex: 270 (4h30)" className="rounded-lg mt-1"/>
                </div>
                <div>
                    <Label htmlFor="tempoPausa">Pausa Obrigatória (min)</Label>
                    <Input id="tempoPausa" type="number" inputMode="numeric" value={tempoPausa} onChange={e => setTempoPausa(e.target.value)} placeholder="Ex: 30" className="rounded-lg mt-1"/>
                </div>
            </div>
            <div>
              <Label htmlFor="horaInicio">Hora de Início da Viagem</Label>
              <Input id="horaInicio" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="rounded-lg mt-1"/>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button type="button" variant="outline" onClick={handleLimpar} className="w-full sm:w-auto rounded-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Limpar
                </Button>
                <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                    <Clock className="mr-2 h-5 w-5" />
                    Calcular Planejamento
                </Button>
            </div>
          </form>

          {timeline.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Sua Linha do Tempo da Viagem:</h3>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute top-5 left-[23px] h-[calc(100%-2.5rem)] w-0.5 bg-border -z-10" />
                
                {timeline.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-4 pb-8">
                        {/* Icon circle */}
                        <div className={cn(
                            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-4 bg-background",
                            getTimelineItemClasses(item.type)
                        )}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        {/* Text content */}
                        <div className="pt-1 flex-grow">
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">{item.time}</span>
                                {item.duration && <span className="font-semibold">({item.duration})</span>}
                            </div>
                             {item.details && <p className="text-xs mt-1 text-muted-foreground">{item.details}</p>}
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

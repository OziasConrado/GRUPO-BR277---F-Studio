
'use client';

import { useState, useEffect, type FormEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Bed, BarChart3, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

interface SonoHistoricoEntry {
  data: string; // dd/mm/yyyy
  qualidade: 'Ótima' | 'Boa' | 'Regular' | 'Ruim';
  duracaoHoras: number;
  duracaoMinutos: number;
  despertares: number;
}

interface SonoResultado {
  duracaoHoras: number;
  duracaoMinutos: number;
  despertares: number;
  qualidade: 'Ótima' | 'Boa' | 'Regular' | 'Ruim';
  alertClass: 'great' | 'good' | 'regular' | 'bad' | 'error';
}

export default function QualidadeSonoPage() {
  const [horaDormir, setHoraDormir] = useState<string>('');
  const [horaAcordar, setHoraAcordar] = useState<string>('');
  const [acordadas, setAcordadas] = useState<string>('');
  const [resultado, setResultado] = useState<SonoResultado | null>(null);
  const [historico, setHistorico] = useState<SonoHistoricoEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('sonoHistoricoRotaSegura');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistorico(parsedHistory);
        }
      } catch (e) {
        console.error("Failed to parse sleep history from localStorage", e);
        localStorage.removeItem('sonoHistoricoRotaSegura');
      }
    }
  }, []);

  const saveHistory = (newEntry: SonoHistoricoEntry) => {
    const updatedHistory = [newEntry, ...historico].slice(0, 7); // Keep last 7 entries
    setHistorico(updatedHistory);
    localStorage.setItem('sonoHistoricoRotaSegura', JSON.stringify(updatedHistory));
  };

  const handleVerificarSono = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    if (!horaDormir || !horaAcordar) {
      toast({ variant: 'destructive', title: 'Campos Incompletos', description: 'Preencha a hora de dormir e acordar.' });
      return;
    }

    const [hd, md] = horaDormir.split(':').map(Number);
    const [ha, ma] = horaAcordar.split(':').map(Number);
    const despertaresNum = parseInt(acordadas) || 0;

    if (isNaN(hd) || isNaN(md) || isNaN(ha) || isNaN(ma)) {
        toast({ variant: 'destructive', title: 'Horas Inválidas', description: 'Formato de hora inválido.' });
        return;
    }

    const inicio = new Date();
    inicio.setHours(hd, md, 0, 0);

    const fim = new Date();
    fim.setHours(ha, ma, 0, 0);

    if (fim <= inicio) {
      fim.setDate(fim.getDate() + 1); // Assume acordou no dia seguinte
    }

    const diffMs = fim.getTime() - inicio.getTime();
    const horasTotais = diffMs / (1000 * 60 * 60);
    const horasCalculadas = Math.floor(horasTotais);
    const minutosCalculados = Math.round((horasTotais - horasCalculadas) * 60);

    let qualidadeCalculada: SonoResultado['qualidade'] = 'Ruim';
    let alertaClasseRes: SonoResultado['alertClass'] = 'bad';

    if (horasTotais >= 7 && despertaresNum <= 1) {
        qualidadeCalculada = 'Ótima';
        alertaClasseRes = 'great';
    } else if (horasTotais >= 6 && horasTotais < 7 && despertaresNum <= 2) {
        qualidadeCalculada = 'Boa';
        alertaClasseRes = 'good';
    } else if (horasTotais >= 5 && despertaresNum <= 4) {
        qualidadeCalculada = 'Regular';
        alertaClasseRes = 'regular';
    }

    const res: SonoResultado = {
      duracaoHoras: horasCalculadas,
      duracaoMinutos: minutosCalculados,
      despertares: despertaresNum,
      qualidade: qualidadeCalculada,
      alertClass: alertaClasseRes,
    };
    setResultado(res);

    const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    saveHistory({
      data: hoje,
      qualidade: qualidadeCalculada,
      duracaoHoras: horasCalculadas,
      duracaoMinutos: minutosCalculados,
      despertares: despertaresNum,
    });
    // setHoraDormir(''); setHoraAcordar(''); setAcordadas(''); // Opcional: Limpar campos
  };

  const getAlertStyling = (alertClass: SonoResultado['alertClass']) => {
    switch(alertClass) {
        case 'great': return { title: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: <CheckCircle className="h-5 w-5 text-green-600" /> };
        case 'good': return { title: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30', icon: <CheckCircle className="h-5 w-5 text-sky-600" /> };
        case 'regular': return { title: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: <AlertCircle className="h-5 w-5 text-yellow-600" /> };
        case 'bad': return { title: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: <AlertCircle className="h-5 w-5 text-red-600" /> };
        default: return { title: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: <AlertCircle className="h-5 w-5 text-destructive" /> };
    }
  };

  const chartData = useMemo(() => {
    return historico.map(entry => {
      let value = 0;
      if (entry.qualidade === 'Ótima') value = 4;
      else if (entry.qualidade === 'Boa') value = 3;
      else if (entry.qualidade === 'Regular') value = 2;
      else if (entry.qualidade === 'Ruim') value = 1;
      return { name: entry.data, quality: value };
    }).reverse(); // Mostrar mais recentes primeiro
  }, [historico]);

  const getBarColor = (quality: number) => {
    if (quality === 4) return 'hsl(var(--chart-2))'; // Ótima (verde)
    if (quality === 3) return 'hsl(var(--chart-1))'; // Boa (azul claro)
    if (quality === 2) return 'hsl(var(--chart-4))'; // Regular (amarelo)
    return 'hsl(var(--destructive))'; // Ruim (vermelho)
  };

  const handleClearHistory = () => {
    setHistorico([]);
    localStorage.removeItem('sonoHistoricoRotaSegura');
    setResultado(null);
    toast({ title: "Histórico Limpo", description: "Seu histórico de qualidade do sono foi apagado."});
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
            <Bed className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Qualidade do Sono</CardTitle>
          </div>
          <CardDescription>Verifique como está a qualidade do seu sono.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleVerificarSono} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horaDormir">Hora que Dormiu</Label>
                <Input id="horaDormir" type="time" value={horaDormir} onChange={e => setHoraDormir(e.target.value)} className="rounded-lg mt-1"/>
              </div>
              <div>
                <Label htmlFor="horaAcordar">Hora que Acordou</Label>
                <Input id="horaAcordar" type="time" value={horaAcordar} onChange={e => setHoraAcordar(e.target.value)} className="rounded-lg mt-1"/>
              </div>
            </div>
            <div>
              <Label htmlFor="acordadas">Quantas vezes acordou durante a noite?</Label>
              <Input id="acordadas" type="number" inputMode="numeric" value={acordadas} onChange={e => setAcordadas(e.target.value)} placeholder="Ex: 0" className="rounded-lg mt-1"/>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Bed className="mr-2 h-5 w-5" /> Verificar Qualidade
            </Button>
          </form>

          {resultado && (
            <div className="mt-6">
              <Alert variant={getAlertStyling(resultado.alertClass).bg.includes('destructive') ? 'destructive' : 'default'} className={cn("rounded-lg", getAlertStyling(resultado.alertClass).bg)}>
                {getAlertStyling(resultado.alertClass).icon}
                <AlertTitle className={cn("font-semibold", getAlertStyling(resultado.alertClass).title)}>
                  Qualidade do Sono: {resultado.qualidade}
                </AlertTitle>
                <ShadcnAlertDescription className={cn(getAlertStyling(resultado.alertClass).title, 'opacity-90')}>
                  Você dormiu por <strong>{resultado.duracaoHoras}h {resultado.duracaoMinutos}min</strong> e acordou <strong>{resultado.despertares} vez(es)</strong>.
                </ShadcnAlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {historico.length > 0 && (
        <Card className="rounded-xl shadow-md mt-6">
          <CardHeader className="flex flex-row justify-between items-center">
             <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <CardTitle className="font-headline text-lg">Histórico (Últimos 7 Dias)</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="rounded-full text-xs">
                <Trash2 className="mr-1.5 h-3.5 w-3.5"/>
                Limpar Histórico
            </Button>
          </CardHeader>
          <CardContent>
             <AdPlaceholder className="my-0 mb-4" />
            {chartData.length > 0 && (
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                        <YAxis
                            stroke="hsl(var(--foreground))"
                            fontSize={12}
                            domain={[0, 4]}
                            ticks={[0, 1, 2, 3, 4]}
                            tickFormatter={(value) => ['','Ruim','Regular','Boa','Ótima'][value]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                            formatter={(value: number) => {
                                const qualityMap = ['Inválido', 'Ruim', 'Regular', 'Boa', 'Ótima'];
                                return [qualityMap[value] || 'Desconhecido', 'Qualidade'];
                            }}
                        />
                        <Bar dataKey="quality" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.quality)} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <ul className="space-y-1 text-sm mt-4 max-h-40 overflow-y-auto">
                {historico.map((item, index) => (
                    <li key={index} className={cn("p-2 rounded-md border text-xs flex justify-between items-center",
                        item.qualidade === 'Ótima' && 'bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400',
                        item.qualidade === 'Boa' && 'bg-sky-500/5 border-sky-500/20 text-sky-700 dark:text-sky-400',
                        item.qualidade === 'Regular' && 'bg-yellow-500/5 border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
                        item.qualidade === 'Ruim' && 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400',
                    )}>
                        <span>{item.data}: {item.duracaoHoras}h {item.duracaoMinutos}min ({item.despertares}x)</span>
                        <span className="font-semibold">{item.qualidade}</span>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Alert variant="default" className="mt-6 border-primary/20 bg-primary/5 text-primary/90">
        <AlertCircle className="h-5 w-5 !text-primary" />
        <AlertTitle className="font-semibold !text-primary">Dica de Saúde</AlertTitle>
        <ShadcnAlertDescription className="!text-primary/80">
          Uma boa noite de sono é fundamental para a saúde e segurança na estrada.
          Adultos geralmente precisam de 7-9 horas de sono de qualidade.
        </ShadcnAlertDescription>
      </Alert>
      
      <div className="mt-8 text-center">
          <h4 className="text-md font-semibold mb-3">Outras Ferramentas de Bem-Estar:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/ferramentas/calculadora-imc" passHref>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <Bed className="w-6 h-6 text-primary"/> 
                          <div>
                            <p className="font-semibold text-sm">Calculadora de IMC</p>
                            <p className="text-xs text-muted-foreground">Verifique seu Índice de Massa.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
              <Link href="/ferramentas/monitoramento-pressao" passHref>
                   <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <Bed className="w-6 h-6 text-primary"/>
                          <div>
                            <p className="font-semibold text-sm">Monitorar Pressão Arterial</p>
                            <p className="text-xs text-muted-foreground">Acompanhe sua pressão.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
          </div>
        </div>
    </div>
  );
}

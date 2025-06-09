
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, HeartPulse, History, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

interface GlicemiaReading {
  id: string;
  value: number;
  classification: string;
  explanation: string;
  alertClass: 'normal' | 'pre-diabetes' | 'diabetes' | 'error';
  date: string;
}

export default function MonitoramentoGlicemiaPage() {
  const [glicemiaInput, setGlicemiaInput] = useState<string>('');
  const [result, setResult] = useState<{ classification: string; explanation: string; alertClass: 'normal' | 'pre-diabetes' | 'diabetes' | 'error' } | null>(null);
  const [history, setHistory] = useState<GlicemiaReading[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('historicoGlicemia');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      } catch (e) {
        console.error("Failed to parse glicemia history from localStorage", e);
        localStorage.removeItem('historicoGlicemia'); // Clear invalid data
      }
    }
  }, []);

  const saveHistory = (newHistory: GlicemiaReading[]) => {
    setHistory(newHistory);
    localStorage.setItem('historicoGlicemia', JSON.stringify(newHistory));
  };

  const handleVerificarGlicemia = (e: FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(glicemiaInput);

    if (isNaN(valor) || valor <= 0) {
      setResult({
        classification: "Valor Inválido",
        explanation: "Por favor, insira um valor numérico positivo para a glicemia.",
        alertClass: 'error'
      });
      return;
    }

    let classificacao = '';
    let explicacao = '';
    let alertaClasse: 'normal' | 'pre-diabetes' | 'diabetes' = 'normal';

    if (valor < 70) {
        classificacao = 'Hipoglicemia';
        explicacao = 'Sua glicemia está baixa. Consuma algo doce e monitore. Se persistir, procure um médico.';
        alertaClasse = 'pre-diabetes'; // Using pre-diabetes style for caution
    } else if (valor < 100) {
      classificacao = 'Glicemia Normal';
      explicacao = 'Sua glicemia está dentro do intervalo considerado saudável em jejum.';
      alertaClasse = 'normal';
    } else if (valor <= 125) {
      classificacao = 'Pré-diabetes';
      explicacao = 'Sua glicemia está discretamente elevada (glicemia de jejum alterada). Recomenda-se acompanhamento médico e mudanças no estilo de vida.';
      alertaClasse = 'pre-diabetes';
    } else {
      classificacao = 'Diabetes';
      explicacao = 'Sua glicemia está elevada, o que é compatível com diagnóstico de diabetes. Procure um médico para confirmação e tratamento.';
      alertaClasse = 'diabetes';
    }

    setResult({ classification: classificacao, explanation: explicacao, alertClass: alertaClasse });

    const newReading: GlicemiaReading = {
      id: `glic-${Date.now()}`,
      value: valor,
      classification: classificacao,
      explanation: explicacao,
      alertClass: alertaClasse,
      date: new Date().toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}),
    };
    saveHistory([newReading, ...history.slice(0, 19)]); // Keep last 20 readings
    setGlicemiaInput('');
  };

  const getAlertVariant = (alertClass: 'normal' | 'pre-diabetes' | 'diabetes' | 'error'): "default" | "destructive" => {
    if (alertClass === 'diabetes' || alertClass === 'error') return 'destructive';
    return 'default';
  };
  
  const getAlertIcon = (alertClass: 'normal' | 'pre-diabetes' | 'diabetes' | 'error') => {
    if (alertClass === 'normal') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (alertClass === 'pre-diabetes') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (alertClass === 'diabetes') return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getAlertTitleColor = (alertClass: 'normal' | 'pre-diabetes' | 'diabetes' | 'error') => {
    if (alertClass === 'normal') return 'text-green-700 dark:text-green-400';
    if (alertClass === 'pre-diabetes') return 'text-yellow-700 dark:text-yellow-400';
    if (alertClass === 'diabetes') return 'text-red-700 dark:text-red-400';
    return 'text-destructive';
  }

  const handleClearHistory = () => {
    saveHistory([]);
    toast({ title: "Histórico Limpo", description: "Seu histórico de leituras de glicemia foi apagado."});
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
            <HeartPulse className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Monitoramento de Glicemia</CardTitle>
          </div>
          <CardDescription>Registre e acompanhe seus níveis de glicose no sangue.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleVerificarGlicemia} className="space-y-4">
            <div>
              <Label htmlFor="glicemiaValue">Nível de Glicemia (mg/dL)</Label>
              <Input
                id="glicemiaValue"
                type="number"
                inputMode="decimal"
                value={glicemiaInput}
                onChange={(e) => setGlicemiaInput(e.target.value)}
                placeholder="Ex: 98"
                className="rounded-lg mt-1"
              />
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <HeartPulse className="mr-2 h-5 w-5" /> Verificar Glicemia
            </Button>
          </form>

          {result && (
            <Alert variant={getAlertVariant(result.alertClass)} className={cn("mt-6 rounded-lg", 
                result.alertClass === 'normal' && 'bg-green-500/10 border-green-500/30',
                result.alertClass === 'pre-diabetes' && 'bg-yellow-500/10 border-yellow-500/30',
                result.alertClass === 'diabetes' && 'bg-red-500/10 border-red-500/30',
                result.alertClass === 'error' && 'bg-destructive/10 border-destructive/30'
            )}>
              {getAlertIcon(result.alertClass)}
              <AlertTitle className={cn("font-semibold", getAlertTitleColor(result.alertClass))}>
                {result.classification}
              </AlertTitle>
              <ShadcnAlertDescription className={cn(getAlertTitleColor(result.alertClass), 'opacity-90')}>
                {result.explanation}
              </ShadcnAlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="rounded-xl shadow-md mt-6">
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                <CardTitle className="font-headline text-lg">Histórico de Leituras</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="rounded-full text-xs">Limpar Histórico</Button>
          </CardHeader>
          <CardContent>
            <AdPlaceholder className="my-0 mb-4" />
            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <li key={item.id} className={cn("p-2.5 rounded-md border flex justify-between items-center",
                    item.alertClass === 'normal' && 'bg-green-500/5 border-green-500/20',
                    item.alertClass === 'pre-diabetes' && 'bg-yellow-500/5 border-yellow-500/20',
                    item.alertClass === 'diabetes' && 'bg-red-500/5 border-red-500/20'
                )}>
                  <div>
                    <span className="font-medium">{item.value} mg/dL</span> - <span className={cn(
                        item.alertClass === 'normal' && 'text-green-700 dark:text-green-400',
                        item.alertClass === 'pre-diabetes' && 'text-yellow-700 dark:text-yellow-400',
                        item.alertClass === 'diabetes' && 'text-red-700 dark:text-red-400'
                    )}>{item.classification}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Alert variant="default" className="mt-6 border-primary/20 bg-primary/5 text-primary/90">
        <AlertCircle className="h-5 w-5 !text-primary" />
        <AlertTitle className="font-semibold !text-primary">Aviso Importante</AlertTitle>
        <ShadcnAlertDescription className="!text-primary/80">
          Esta ferramenta é para fins informativos e não substitui o aconselhamento médico profissional.
          Consulte sempre um médico para diagnósticos e tratamentos.
        </ShadcnAlertDescription>
      </Alert>
      
      <div className="mt-8 text-center">
          <h4 className="text-md font-semibold mb-3">Outras Ferramentas Úteis:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/ferramentas/calculadora-combustivel" passHref>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <HeartPulse className="w-6 h-6 text-primary"/> {/* Usando mesmo ícone como exemplo */}
                          <div>
                            <p className="font-semibold text-sm">Calculadora de Combustível</p>
                            <p className="text-xs text-muted-foreground">Planeje gastos com combustível.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
              <Link href="/ferramentas/checklist" passHref>
                   <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-primary"/> {/* Ícone diferente */}
                          <div>
                            <p className="font-semibold text-sm">Checklist de Viagem</p>
                            <p className="text-xs text-muted-foreground">Prepare-se para sua jornada.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
          </div>
        </div>

    </div>
  );
}


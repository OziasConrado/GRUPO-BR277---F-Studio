
'use client';

import { useState, useEffect, type FormEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ActivitySquare, History, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
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

interface PressaoReading {
  id: string;
  sistolica: number;
  diastolica: number;
  classification: string;
  alertClass: 'normal' | 'elevated' | 'hypertension1' | 'hypertension2' | 'undefined' | 'error';
  date: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

export default function MonitoramentoPressaoPage() {
  const [sistolicaInput, setSistolicaInput] = useState<string>('');
  const [diastolicaInput, setDiastolicaInput] = useState<string>('');
  const [result, setResult] = useState<{ classification: string; explanation: string; alertClass: PressaoReading['alertClass'] } | null>(null);
  const [history, setHistory] = useState<PressaoReading[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedHistory = localStorage.getItem('historicoPressao');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
          if (parsedHistory.length > 0) {
            const lastReading = parsedHistory[0];
            setChartData([
              { name: 'Sistólica', value: lastReading.sistolica },
              { name: 'Diastólica', value: lastReading.diastolica },
            ]);
          }
        }
      } catch (e) {
        console.error("Failed to parse pressure history from localStorage", e);
        localStorage.removeItem('historicoPressao');
      }
    }
  }, []);

  const saveHistory = (newHistory: PressaoReading[]) => {
    setHistory(newHistory);
    localStorage.setItem('historicoPressao', JSON.stringify(newHistory));
  };

  const handleVerificarPressao = (e: FormEvent) => {
    e.preventDefault();
    const sis = parseInt(sistolicaInput);
    const dia = parseInt(diastolicaInput);

    if (isNaN(sis) || isNaN(dia) || sis <= 0 || dia <= 0) {
      setResult({
        classification: "Valores Inválidos",
        explanation: "Por favor, insira valores numéricos positivos para ambas as pressões.",
        alertClass: 'error'
      });
      setChartData([]);
      return;
    }

    let classificacao = '';
    let explicacao = '';
    let alertaClasse: PressaoReading['alertClass'] = 'undefined';

    if (sis < 120 && dia < 80) {
      classificacao = 'Pressão Normal';
      explicacao = 'Sua pressão arterial está dentro dos níveis considerados ideais.';
      alertaClasse = 'normal';
    } else if (sis >= 120 && sis <= 129 && dia < 80) {
      classificacao = 'Pressão Elevada';
      explicacao = 'Sua pressão está um pouco elevada. Recomenda-se monitoramento e hábitos saudáveis.';
      alertaClasse = 'elevated';
    } else if ((sis >= 130 && sis <= 139) || (dia >= 80 && dia <= 89)) {
      classificacao = 'Hipertensão Estágio 1';
      explicacao = 'Sua pressão indica Hipertensão Estágio 1. Consulte um médico para avaliação e orientação.';
      alertaClasse = 'hypertension1';
    } else if (sis >= 140 || dia >= 90) {
      classificacao = 'Hipertensão Estágio 2';
      explicacao = 'Sua pressão indica Hipertensão Estágio 2. Procure orientação médica urgentemente.';
      alertaClasse = 'hypertension2';
    } else {
      classificacao = 'Classificação Indefinida';
      explicacao = 'Os valores inseridos não se encaixam em uma classificação padrão clara. Consulte um médico.';
      alertaClasse = 'undefined';
    }

    setResult({ classification: classificacao, explanation: explicacao, alertClass: alertaClasse });
    setChartData([
        { name: 'Sistólica', value: sis },
        { name: 'Diastólica', value: dia },
    ]);

    const newReading: PressaoReading = {
      id: `press-${Date.now()}`,
      sistolica: sis,
      diastolica: dia,
      classification: classificacao,
      alertClass: alertaClasse,
      date: new Date().toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}),
    };
    saveHistory([newReading, ...history.slice(0, 19)]); // Keep last 20 readings
    setSistolicaInput('');
    setDiastolicaInput('');
  };

  const getAlertVariant = (alertClass: PressaoReading['alertClass']): "default" | "destructive" => {
    if (alertClass === 'hypertension1' || alertClass === 'hypertension2' || alertClass === 'error') return 'destructive';
    return 'default';
  };
  
  const getAlertIcon = (alertClass: PressaoReading['alertClass']) => {
    if (alertClass === 'normal') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (alertClass === 'elevated' || alertClass === 'undefined') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (alertClass === 'hypertension1' || alertClass === 'hypertension2') return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getAlertStyling = (alertClass: PressaoReading['alertClass']) => {
    switch(alertClass) {
        case 'normal': return { title: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/30'};
        case 'elevated': return { title: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30'};
        case 'hypertension1': return { title: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30'};
        case 'hypertension2': return { title: 'text-red-700 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/30'};
        case 'undefined': return { title: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30'};
        default: return { title: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30'};
    }
  }

  const handleClearHistory = () => {
    saveHistory([]);
    setChartData([]);
    toast({ title: "Histórico Limpo", description: "Seu histórico de leituras de pressão foi apagado."});
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
            <ActivitySquare className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Monitorar Pressão Arterial</CardTitle>
          </div>
          <CardDescription>Registre e acompanhe seus níveis de pressão arterial.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleVerificarPressao} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                <Label htmlFor="sistolica">Pressão Sistólica (mmHg)</Label>
                <Input
                    id="sistolica"
                    type="number"
                    inputMode="numeric"
                    value={sistolicaInput}
                    onChange={(e) => setSistolicaInput(e.target.value)}
                    placeholder="Ex: 120"
                    className="rounded-lg mt-1"
                />
                </div>
                <div>
                <Label htmlFor="diastolica">Pressão Diastólica (mmHg)</Label>
                <Input
                    id="diastolica"
                    type="number"
                    inputMode="numeric"
                    value={diastolicaInput}
                    onChange={(e) => setDiastolicaInput(e.target.value)}
                    placeholder="Ex: 80"
                    className="rounded-lg mt-1"
                />
                </div>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <ActivitySquare className="mr-2 h-5 w-5" /> Verificar Pressão
            </Button>
          </form>

          {result && (
            <Alert variant={getAlertVariant(result.alertClass)} className={cn("mt-6 rounded-lg", getAlertStyling(result.alertClass).bg)}>
              {getAlertIcon(result.alertClass)}
              <AlertTitle className={cn("font-semibold", getAlertStyling(result.alertClass).title)}>
                {result.classification}
              </AlertTitle>
              <ShadcnAlertDescription className={cn(getAlertStyling(result.alertClass).title, 'opacity-90')}>
                {result.explanation}
              </ShadcnAlertDescription>
            </Alert>
          )}

          {chartData.length > 0 && (
            <div className="mt-6 h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} domain={[0, 'dataMax + 20']} tickFormatter={(value) => `${value}`}/>
                    <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => [`${value} mmHg`, name]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-5))'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
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
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="rounded-full text-xs">
                <Trash2 className="mr-1.5 h-3.5 w-3.5"/>
                Limpar Histórico
            </Button>
          </CardHeader>
          <CardContent>
            <AdPlaceholder className="my-0 mb-4" />
            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-1">
              {history.map((item) => {
                const itemStyle = getAlertStyling(item.alertClass);
                return (
                    <li key={item.id} className={cn("p-2.5 rounded-md border flex justify-between items-center", itemStyle.bg)}>
                    <div>
                        <span className="font-medium">{item.sistolica}/{item.diastolica} mmHg</span> - <span className={cn(itemStyle.title)}>{item.classification}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Alert variant="default" className="mt-6 border-primary/20 bg-primary/5 text-primary/90">
        <AlertCircle className="h-5 w-5 !text-primary" />
        <AlertTitle className="font-semibold !text-primary">Aviso Importante</AlertTitle>
        <ShadcnAlertDescription className="!text-primary/80">
          Esta ferramenta é para fins informativos e não substitui o aconselhamento médico profissional.
          Consulte sempre um médico para diagnósticos e tratamentos. Os valores de referência podem variar.
        </ShadcnAlertDescription>
      </Alert>
      
      <div className="mt-8 text-center">
          <h4 className="text-md font-semibold mb-3">Outras Ferramentas de Saúde:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/ferramentas/calculadora-imc" passHref>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <ActivitySquare className="w-6 h-6 text-primary"/> 
                          <div>
                            <p className="font-semibold text-sm">Calculadora de IMC</p>
                            <p className="text-xs text-muted-foreground">Verifique seu Índice de Massa.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
              <Link href="/ferramentas/monitoramento-glicemia" passHref>
                   <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                      <CardContent className="p-4 flex items-center gap-3">
                          <ActivitySquare className="w-6 h-6 text-primary"/>
                          <div>
                            <p className="font-semibold text-sm">Monitorar Glicemia</p>
                            <p className="text-xs text-muted-foreground">Acompanhe seus níveis de glicose.</p>
                          </div>
                      </CardContent>
                  </Card>
              </Link>
          </div>
        </div>
    </div>
  );
}

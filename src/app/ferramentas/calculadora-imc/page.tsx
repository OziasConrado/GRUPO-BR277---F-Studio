
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Scale, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
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

interface IMCResult {
  imc: number;
  classification: string;
  alertClass: 'normal' | 'underweight' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3' | 'error';
}

export default function CalculadoraImcPage() {
  const [peso, setPeso] = useState<string>('');
  const [altura, setAltura] = useState<string>('');
  const [resultado, setResultado] = useState<IMCResult | null>(null);
  const { toast } = useToast();

  const handleCalcularIMC = (e: FormEvent) => {
    e.preventDefault();
    const pesoNum = parseFloat(peso);
    const alturaNumCm = parseFloat(altura);

    if (isNaN(pesoNum) || pesoNum <= 0 || isNaN(alturaNumCm) || alturaNumCm <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Por favor, preencha o peso e a altura com valores positivos.',
      });
      setResultado(null);
      return;
    }

    const alturaM = alturaNumCm / 100;
    const imcCalc = pesoNum / (alturaM * alturaM);
    let classificacaoStr = "";
    let alertaClasseRes: IMCResult['alertClass'] = 'error';

    if (imcCalc < 18.5) {
      classificacaoStr = "Abaixo do peso";
      alertaClasseRes = 'underweight';
    } else if (imcCalc < 24.9) {
      classificacaoStr = "Peso normal";
      alertaClasseRes = 'normal';
    } else if (imcCalc < 29.9) {
      classificacaoStr = "Sobrepeso";
      alertaClasseRes = 'overweight';
    } else if (imcCalc < 34.9) {
      classificacaoStr = "Obesidade grau 1";
      alertaClasseRes = 'obesity1';
    } else if (imcCalc < 39.9) {
      classificacaoStr = "Obesidade grau 2";
      alertaClasseRes = 'obesity2';
    } else {
      classificacaoStr = "Obesidade grau 3";
      alertaClasseRes = 'obesity3';
    }

    setResultado({
      imc: imcCalc,
      classification: classificacaoStr,
      alertClass: alertaClasseRes,
    });
  };

  const getAlertVariant = (alertClass: IMCResult['alertClass']): "default" | "destructive" => {
    if (alertClass === 'obesity1' || alertClass === 'obesity2' || alertClass === 'obesity3' || alertClass === 'error') return 'destructive';
    return 'default';
  };
  
  const getAlertIcon = (alertClass: IMCResult['alertClass']) => {
    if (alertClass === 'normal') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (alertClass === 'underweight' || alertClass === 'overweight') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    if (alertClass === 'obesity1' || alertClass === 'obesity2' || alertClass === 'obesity3') return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getAlertTitleColor = (alertClass: IMCResult['alertClass']) => {
    if (alertClass === 'normal') return 'text-green-700 dark:text-green-400';
    if (alertClass === 'underweight' || alertClass === 'overweight') return 'text-yellow-700 dark:text-yellow-400';
    if (alertClass === 'obesity1' || alertClass === 'obesity2' || alertClass === 'obesity3') return 'text-red-700 dark:text-red-400';
    return 'text-destructive';
  }

  const getAlertBgColor = (alertClass: IMCResult['alertClass']) => {
    if (alertClass === 'normal') return 'bg-green-500/10 border-green-500/30';
    if (alertClass === 'underweight' || alertClass === 'overweight') return 'bg-yellow-500/10 border-yellow-500/30';
    if (alertClass === 'obesity1' || alertClass === 'obesity2' || alertClass === 'obesity3') return 'bg-red-500/10 border-red-500/30';
    return 'bg-destructive/10 border-destructive/30';
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
            <Scale className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de IMC</CardTitle>
          </div>
          <CardDescription>Calcule seu Índice de Massa Corporal.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcularIMC} className="space-y-4">
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                inputMode="decimal"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 70.5"
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                inputMode="decimal"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Ex: 175"
                className="rounded-lg mt-1"
              />
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Scale className="mr-2 h-5 w-5" /> Calcular IMC
            </Button>
          </form>

          {resultado && (
            <div className="mt-6">
              <Alert variant={getAlertVariant(resultado.alertClass)} className={cn("rounded-lg", getAlertBgColor(resultado.alertClass))}>
                {getAlertIcon(resultado.alertClass)}
                <AlertTitle className={cn("font-semibold", getAlertTitleColor(resultado.alertClass))}>
                  Seu IMC é {resultado.imc.toFixed(1)}
                </AlertTitle>
                <ShadcnAlertDescription className={cn(getAlertTitleColor(resultado.alertClass), 'opacity-90')}>
                  Classificação: {resultado.classification}
                </ShadcnAlertDescription>
              </Alert>
            </div>
          )}
          
          <AdPlaceholder className="mt-8" />

          <div className="mt-8 text-center">
            <h4 className="text-md font-semibold mb-3">Outras Ferramentas de Saúde:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/ferramentas/monitoramento-glicemia" passHref>
                <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                  <CardContent className="p-4 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Monitorar Glicemia</p>
                      <p className="text-xs text-muted-foreground">Acompanhe seus níveis.</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
               {/* Adicionar mais links de ferramentas de saúde aqui no futuro */}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

    
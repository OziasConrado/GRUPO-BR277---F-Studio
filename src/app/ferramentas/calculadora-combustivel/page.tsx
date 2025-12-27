
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Fuel, Calculator, Trash2, Droplets, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

interface ResultadoCombustivel {
  litros: number;
  custo: number;
}

export default function CalculadoraCombustivelPage() {
  const [distancia, setDistancia] = useState<string>('');
  const [consumoMedio, setConsumoMedio] = useState<string>('');
  const [precoCombustivel, setPrecoCombustivel] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoCombustivel | null>(null);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const distNum = parseFloat(distancia);
    const consumoNum = parseFloat(consumoMedio);
    const precoNum = parseFloat(precoCombustivel);

    if (isNaN(distNum) || distNum <= 0 || isNaN(consumoNum) || consumoNum <= 0 || isNaN(precoNum) || precoNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Preencha todos os campos com números positivos.',
      });
      return;
    }

    const litrosNecessarios = distNum / consumoNum;
    const custoTotal = litrosNecessarios * precoNum;

    setResultado({
      litros: litrosNecessarios,
      custo: custoTotal,
    });
  };

  const handleLimpar = () => {
    setDistancia('');
    setConsumoMedio('');
    setPrecoCombustivel('');
    setResultado(null);
    toast({ title: 'Campos Limpos', description: 'Pronto para um novo cálculo.' });
  };

  const suggestedTools = [
    { title: "Custo de Viagem (Diesel + Arla)", Icon: Fuel, href: "/ferramentas/custo-viagem", description: "Planeje todos os gastos." },
    { title: "Álcool ou Gasolina?", Icon: Droplets, href: "/ferramentas/etanol-gasolina", description: "Qual combustível vale mais?"}
  ];


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fuel className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Combustível</CardTitle>
          </div>
          <CardDescription>Calcule o consumo e custo de combustível para sua viagem.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <Label htmlFor="distancia">Distância da Viagem (km)</Label>
              <Input id="distancia" type="number" inputMode="decimal" value={distancia} onChange={e => setDistancia(e.target.value)} placeholder="Ex: 500" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="consumo_medio">Consumo Médio do Veículo (km/l)</Label>
              <Input id="consumo_medio" type="number" inputMode="decimal" value={consumoMedio} onChange={e => setConsumoMedio(e.target.value)} placeholder="Ex: 10" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="preco_combustivel">Preço do Combustível (R$/litro)</Label>
              <Input id="preco_combustivel" type="number" inputMode="decimal" value={precoCombustivel} onChange={e => setPrecoCombustivel(e.target.value)} placeholder="Ex: 5.50" className="rounded-lg mt-1" step="0.01"/>
            </div>
             <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button type="button" variant="outline" onClick={handleLimpar} className="w-full sm:w-auto rounded-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Limpar
                </Button>
                <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular
                </Button>
            </div>
          </form>

          {resultado && (
            <Alert className="mt-6 rounded-lg bg-primary/5 border-primary/20">
                <Fuel className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">Resultado Estimado:</AlertTitle>
                <ShadcnAlertDescription className="text-primary/90 space-y-1">
                    <p>Litros necessários: <span className="font-bold">{resultado.litros.toFixed(2)} L</span></p>
                    <p>Custo total da viagem: <span className="font-bold">R$ {resultado.custo.toFixed(2)}</span></p>
                </ShadcnAlertDescription>
            </Alert>
          )}
           <CardDescription className="text-xs text-muted-foreground mt-4 text-center">
            Nota: Esta é uma calculadora simplificada. Para cálculos mais detalhados como Diesel+Arla ou comparação Etanol/Gasolina, utilize as ferramentas específicas.
          </CardDescription>
          
          <AdPlaceholder className="mt-8" />
          
          <div className="mt-8 text-center">
            <h4 className="text-md font-semibold mb-3">Outras Ferramentas Úteis:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedTools.map(tool => (
                    <Link href={tool.href} key={tool.title} passHref>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-lg">
                            <CardContent className="p-4 flex items-center gap-3">
                                <tool.Icon className="w-6 h-6 text-primary"/>
                                <div>
                                  <p className="font-semibold text-sm">{tool.title}</p>
                                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

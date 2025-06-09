
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calculator, Trash2, Fuel, Droplets, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";


const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

interface CalculationResult {
  distancia: number;
  consumoMedio: number;
  litrosDiesel: number;
  custoDiesel: number;
  percentualArla?: number;
  litrosArla?: number;
  custoArla?: number;
  custoTotal: number;
}

interface ChartDataItem {
  name: string;
  cost: number;
}

export default function CustoViagemPage() {
  const [distancia, setDistancia] = useState<string>('');
  const [consumo, setConsumo] = useState<string>('');
  const [precoDiesel, setPrecoDiesel] = useState<string>('');
  const [usarArla, setUsarArla] = useState<boolean>(false);
  const [percentualArla, setPercentualArla] = useState<string>('5'); // Default 5%
  const [precoArla, setPrecoArla] = useState<string>('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  
  const { toast } = useToast();

  const handleCalcularViagem = () => {
    setErrorMessage(null);
    setCalculationResult(null);
    setChartData([]);

    const dist = parseFloat(distancia);
    const cons = parseFloat(consumo);
    const prDiesel = parseFloat(precoDiesel);
    
    if (isNaN(dist) || isNaN(cons) || isNaN(prDiesel) || dist <= 0 || cons <= 0 || prDiesel <= 0) {
      setErrorMessage('Preencha Distância, Consumo e Preço do Diesel com valores válidos e maiores que zero.');
      return;
    }

    let prArla = 0;
    let percArla = 0;

    if (usarArla) {
      prArla = parseFloat(precoArla);
      percArla = parseFloat(percentualArla);
      if (isNaN(prArla) || isNaN(percArla) || prArla <= 0 || percArla <= 0) {
        setErrorMessage('Se Arla 32 estiver ativo, preencha Percentual e Preço do Arla com valores válidos e maiores que zero.');
        return;
      }
    }

    const litrosDieselCalc = dist / cons;
    const custoDieselCalc = litrosDieselCalc * prDiesel;
    
    let litrosArlaCalc = 0;
    let custoArlaCalc = 0;

    if (usarArla && percArla > 0 && prArla > 0) {
      litrosArlaCalc = litrosDieselCalc * (percArla / 100);
      custoArlaCalc = litrosArlaCalc * prArla;
    }
    
    const custoTotalCalc = custoDieselCalc + custoArlaCalc;

    const resultData: CalculationResult = {
      distancia: dist,
      consumoMedio: cons,
      litrosDiesel: litrosDieselCalc,
      custoDiesel: custoDieselCalc,
      custoTotal: custoTotalCalc,
    };
    
    const newChartData: ChartDataItem[] = [
        { name: 'Diesel', cost: parseFloat(custoDieselCalc.toFixed(2)) }
    ];

    if (usarArla && custoArlaCalc > 0) {
      resultData.percentualArla = percArla;
      resultData.litrosArla = litrosArlaCalc;
      resultData.custoArla = custoArlaCalc;
      newChartData.push({ name: 'Arla 32', cost: parseFloat(custoArlaCalc.toFixed(2)) });
    }
    
    newChartData.push({ name: 'Total', cost: parseFloat(custoTotalCalc.toFixed(2))});


    setCalculationResult(resultData);
    setChartData(newChartData);
  };

  const handleLimparCampos = () => {
    setDistancia('');
    setConsumo('');
    setPrecoDiesel('');
    setUsarArla(false);
    setPercentualArla('5');
    setPrecoArla('');
    setErrorMessage(null);
    setCalculationResult(null);
    setChartData([]);
    toast({ title: "Campos Limpos", description: "Pronto para um novo cálculo!" });
  };
  
  const suggestedTools = [
    { title: "Álcool ou Gasolina?", Icon: Droplets, href: "/ferramentas/etanol-gasolina", description: "Qual combustível vale mais?"},
    { title: "Calculadora de Frete", Icon: Calculator, href: "/ferramentas/calculadora-frete", description: "Estime custos do frete."}
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
            <CardTitle className="font-headline text-xl sm:text-2xl">Custo de Viagem | Diesel + Arla 32</CardTitle>
          </div>
          <CardDescription>Calcule os gastos com combustível e Arla 32 para sua rota.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCalcularViagem(); }}>
            <div>
              <Label htmlFor="distancia2">Distância da Viagem (km)</Label>
              <Input type="number" id="distancia2" value={distancia} onChange={e => setDistancia(e.target.value)} placeholder="Ex: 1200" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="consumo2">Consumo Médio do Veículo (km/l)</Label>
              <Input type="number" id="consumo2" value={consumo} onChange={e => setConsumo(e.target.value)} placeholder="Ex: 3.5" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="precoDiesel">Preço do Diesel (R$/litro)</Label>
              <Input type="number" id="precoDiesel" value={precoDiesel} onChange={e => setPrecoDiesel(e.target.value)} placeholder="Ex: 5.80" className="rounded-lg mt-1" step="0.01"/>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="usarArla" checked={usarArla} onCheckedChange={setUsarArla} />
              <Label htmlFor="usarArla" className="font-medium">Adicionar Arla 32 ao cálculo?</Label>
            </div>

            {usarArla && (
              <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="percentualArla">Percentual de Consumo Arla 32 (%)</Label>
                  <Input type="number" id="percentualArla" value={percentualArla} onChange={e => setPercentualArla(e.target.value)} placeholder="Ex: 5" className="rounded-lg mt-1"/>
                  <p className="text-xs text-muted-foreground mt-1">Normalmente entre 5% e 7% do consumo de diesel.</p>
                </div>
                <div>
                  <Label htmlFor="precoArla">Preço do Arla 32 (R$/litro)</Label>
                  <Input type="number" id="precoArla" value={precoArla} onChange={e => setPrecoArla(e.target.value)} placeholder="Ex: 3.20" className="rounded-lg mt-1" step="0.01"/>
                </div>
              </div>
            )}
            
            {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro de Validação</AlertTitle>
                    <ShadcnAlertDescription>{errorMessage}</ShadcnAlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button type="button" variant="outline" onClick={handleLimparCampos} className="w-full sm:w-auto rounded-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Limpar
                </Button>
                <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular Custo
                </Button>
            </div>
          </form>
          
          {calculationResult && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-1">Resultado Estimado da Viagem:</h3>
              <CardDescription className="text-center mb-4">Confira os detalhes do cálculo abaixo.</CardDescription>
              
              <div className="p-4 bg-card rounded-lg border space-y-1.5 text-sm mb-6">
                <p><strong>Distância:</strong> {calculationResult.distancia} km</p>
                <p><strong>Consumo Médio:</strong> {calculationResult.consumoMedio} km/l</p>
                <p><strong>Litros de Diesel:</strong> {calculationResult.litrosDiesel.toFixed(2)} L</p>
                <p><strong>Custo do Diesel:</strong> R$ {calculationResult.custoDiesel.toFixed(2)}</p>
                {calculationResult.custoArla !== undefined && calculationResult.custoArla > 0 && (
                  <>
                    <p className="pt-1"><strong>Arla 32 ({calculationResult.percentualArla}%):</strong> {calculationResult.litrosArla?.toFixed(2)} L</p>
                    <p><strong>Custo do Arla 32:</strong> R$ {calculationResult.custoArla.toFixed(2)}</p>
                  </>
                )}
                <p className="font-bold text-base pt-2 text-primary">Custo Total Estimado: R$ {calculationResult.custoTotal.toFixed(2)}</p>
              </div>
              
              {chartData.length > 0 && (
                <div className="mt-6 h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(value) => `R$${value.toFixed(2)}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [`R$${value.toFixed(2)}`, name]}
                      />
                      <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => {
                          let fillColor = 'hsl(var(--chart-1))'; // Default for Diesel
                          if (entry.name === 'Arla 32') fillColor = 'hsl(var(--chart-2))';
                          else if (entry.name === 'Total') fillColor = 'hsl(var(--chart-3))';
                          return <Cell key={`cell-${index}`} fill={fillColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <AdPlaceholder />
              
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
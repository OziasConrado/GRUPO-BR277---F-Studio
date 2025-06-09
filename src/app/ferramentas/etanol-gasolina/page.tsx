
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Fuel, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

interface ChartDataItem {
  name: string;
  price: number;
}

export default function EtanolGasolinaPage() {
  const [ethanolPrice, setEthanolPrice] = useState<string>('');
  const [gasolinePrice, setGasolinePrice] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultColorClass, setResultColorClass] = useState<string>('');
  const [showResultSection, setShowResultSection] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const { toast } = useToast();

  const handleCompare = () => {
    const ethanol = parseFloat(ethanolPrice);
    const gasoline = parseFloat(gasolinePrice);

    if (isNaN(ethanol) || isNaN(gasoline) || ethanol <= 0 || gasoline <= 0) {
      toast({
        variant: "destructive",
        title: "Valores Inválidos",
        description: "Por favor, preencha ambos os campos com preços válidos.",
      });
      setShowResultSection(false);
      return;
    }

    const ratio = ethanol / gasoline;
    const compensaEtanol = ratio < 0.7;
    const mensagem = compensaEtanol ? "Álcool compensa mais!" : "Gasolina compensa mais!";
    
    setResultMessage(mensagem);
    setResultColorClass(compensaEtanol ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400');
    
    setChartData([
      { name: 'Álcool', price: ethanol },
      { name: 'Gasolina', price: gasoline },
    ]);
    setShowResultSection(true);
  };

  useEffect(() => {
    // Se os campos de preço forem limpos, esconder a seção de resultados.
    if (ethanolPrice === '' || gasolinePrice === '') {
      setShowResultSection(false);
      setResultMessage(null);
    }
  }, [ethanolPrice, gasolinePrice]);

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
            <CardTitle className="font-headline text-2xl">Álcool ou Gasolina?</CardTitle>
          </div>
          <CardDescription>Descubra qual combustível é mais vantajoso com base nos preços atuais.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCompare(); }}>
            <div>
              <Label htmlFor="ethanol">Preço do Álcool (R$/L)</Label>
              <Input 
                type="number" 
                id="ethanol" 
                value={ethanolPrice}
                onChange={(e) => setEthanolPrice(e.target.value)}
                placeholder="Ex: 3.50" 
                className="rounded-lg mt-1"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="gasoline">Preço da Gasolina (R$/L)</Label>
              <Input 
                type="number" 
                id="gasoline"
                value={gasolinePrice}
                onChange={(e) => setGasolinePrice(e.target.value)} 
                placeholder="Ex: 5.00" 
                className="rounded-lg mt-1"
                step="0.01"
              />
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <BarChart3 className="mr-2 h-5 w-5" />
              Comparar Preços
            </Button>
          </form>
          
          {showResultSection && resultMessage && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-2">Resultado da Comparação:</h3>
              <p className={cn("text-xl font-bold text-center py-3 px-4 rounded-md", resultColorClass, resultColorClass.includes('green') ? 'bg-green-500/10' : 'bg-red-500/10')}>
                {resultMessage}
              </p>
              
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
                        formatter={(value: number) => [`R$${value.toFixed(2)}`, 'Preço']}
                      />
                      <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Álcool' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <AdPlaceholder className="mt-8" />
              {/* Placeholder para sugestões de ferramentas futuras */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">Em breve: outras ferramentas úteis para você!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
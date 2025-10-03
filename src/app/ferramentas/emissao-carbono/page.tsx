
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Cloud, Calculator, Leaf, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

const fatoresEmissao = {
    gasolina: 2.31, // kg CO2/L
    etanol: 0.52,   // kg CO2/L (ciclo de vida)
    diesel: 2.68,   // kg CO2/L
    gnv: 2.25,      // kg CO2/m³
    eletrico: 0.05, // kg CO2/km (considerando a matriz energética brasileira)
};

const ARVORE_ABSORCAO_ANO = 22; // kg CO2 por ano

interface ResultadoEmissao {
  emissaoTotal: number;
  arvoresEquivalentes: number;
}

export default function EmissaoCarbonoPage() {
  const [distancia, setDistancia] = useState<string>('');
  const [consumo, setConsumo] = useState<string>('');
  const [combustivel, setCombustivel] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoEmissao | null>(null);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const distNum = parseFloat(distancia);
    const consumoNum = parseFloat(consumo);
    
    if (!distNum || distNum <= 0 || !combustivel) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Preencha a distância e selecione o tipo de combustível.',
      });
      return;
    }
    
    let emissaoTotalKg = 0;
    
    if (combustivel === 'eletrico') {
        const fator = fatoresEmissao.eletrico;
        emissaoTotalKg = distNum * fator;
    } else {
        const fator = fatoresEmissao[combustivel as keyof typeof fatoresEmissao];
        if (!consumoNum || consumoNum <= 0 || !fator) {
             toast({
                variant: 'destructive',
                title: 'Valores Inválidos',
                description: 'Para este combustível, o consumo médio é obrigatório.',
            });
            return;
        }
        const volumeConsumido = distNum / consumoNum;
        emissaoTotalKg = volumeConsumido * fator;
    }

    const arvoresEquivalentes = emissaoTotalKg / ARVORE_ABSORCAO_ANO;

    setResultado({
      emissaoTotal: emissaoTotalKg,
      arvoresEquivalentes: arvoresEquivalentes,
    });
  };

  const suggestedTools = [
    { title: "Custo de Viagem (Diesel + Arla)", Icon: Cloud, href: "/ferramentas/custo-viagem", description: "Planeje todos os gastos." },
    { title: "Álcool ou Gasolina?", Icon: Cloud, href: "/ferramentas/etanol-gasolina", description: "Qual combustível vale mais?"}
  ];
  
  const isElectric = combustivel === 'eletrico';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Emissão de Carbono</CardTitle>
          </div>
          <CardDescription>Estime a pegada de carbono da sua viagem e veja como compensá-la.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <Label htmlFor="distancia-carbono">Distância da Viagem (km)</Label>
              <Input id="distancia-carbono" type="number" inputMode="decimal" value={distancia} onChange={e => setDistancia(e.target.value)} placeholder="Ex: 500" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="combustivel-carbono">Tipo de Combustível</Label>
              <Select value={combustivel} onValueChange={setCombustivel}>
                <SelectTrigger id="combustivel-carbono" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder="Selecione o combustível..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="etanol">Etanol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gnv">GNV (Gás Natural)</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isElectric && (
                 <div>
                    <Label htmlFor="consumo-carbono">Consumo Médio (km/L ou km/m³)</Label>
                    <Input id="consumo-carbono" type="number" inputMode="decimal" value={consumo} onChange={e => setConsumo(e.target.value)} placeholder="Ex: 10" className="rounded-lg mt-1"/>
                </div>
            )}
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Calculator className="mr-2 h-5 w-5" /> Calcular Emissão
            </Button>
          </form>

          {resultado && (
            <div className="mt-6 pt-6 border-t">
              <Alert className="rounded-lg bg-primary/5 border-primary/20 text-center">
                  <Leaf className="h-5 w-5 text-primary mx-auto mb-2" />
                  <AlertTitle className="font-semibold text-primary text-lg">Resultado Estimado</AlertTitle>
                  <ShadcnAlertDescription className="text-primary/90 space-y-2 mt-2">
                      <p>Sua viagem emitiu aproximadamente:</p>
                      <p><strong className="text-2xl">{resultado.emissaoTotal.toFixed(2)} kg de CO₂</strong></p>
                      <p className="pt-2">Para compensar essa emissão, seria necessário o trabalho de aproximadamente <strong className="text-lg">{Math.ceil(resultado.arvoresEquivalentes)} árvore(s)</strong> por um ano inteiro.</p>
                  </ShadcnAlertDescription>
              </Alert>

              <div className="mt-8">
                 <Alert variant="default" className="border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400">
                    <Info className="h-5 w-5 !text-green-600" />
                    <AlertTitle className="font-semibold !text-green-700 dark:!text-green-500">Ações para Reduzir sua Pegada</AlertTitle>
                    <ShadcnAlertDescription className="!text-green-600/90 dark:!text-green-400/90 text-xs">
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Mantenha a manutenção do veículo e a calibragem dos pneus em dia.</li>
                            <li>Evite acelerações e freadas bruscas.</li>
                            <li>Prefira o transporte público ou caronas sempre que possível.</li>
                            <li>Apoie projetos de reflorestamento e conservação ambiental.</li>
                        </ul>
                    </ShadcnAlertDescription>
                </Alert>
              </div>

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

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

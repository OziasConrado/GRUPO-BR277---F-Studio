'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Droplets, Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

const niveisAtividade = [
  { label: "Leve (sedentário, pouco ou nenhum exercício)", value: "35" },
  { label: "Moderada (exercício 3-5 dias/semana)", value: "40" },
  { label: "Intensa (treinos diários ou trabalho pesado)", value: "45" },
];

interface ResultadoHidratacao {
  litros: string;
}

export default function CalculadoraHidratacaoPage() {
  const [peso, setPeso] = useState<string>('');
  const [nivelAtividade, setNivelAtividade] = useState<string>(niveisAtividade[0].value);
  const [resultado, setResultado] = useState<ResultadoHidratacao | null>(null);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const pesoNum = parseFloat(peso);
    const atividadeNum = parseInt(nivelAtividade);

    if (isNaN(pesoNum) || pesoNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor Inválido',
        description: 'Por favor, insira um peso válido.',
      });
      return;
    }

    const aguaMl = pesoNum * atividadeNum;
    const aguaLitros = (aguaMl / 1000).toFixed(2);

    setResultado({ litros: aguaLitros });
  };
  
  const suggestedTools = [
    { title: "Calculadora de Calorias", Icon: Droplets, href: "/ferramentas/calculadora-calorias", description: "Estime sua necessidade calórica." },
    { title: "Qualidade do Sono", Icon: Droplets, href: "/ferramentas/qualidade-sono", description: "Monitore seu descanso."}
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
            <Droplets className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Hidratação</CardTitle>
          </div>
          <CardDescription>Estime a quantidade de água que você deve beber por dia.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <Label htmlFor="peso-hidratacao">Seu Peso (kg)</Label>
              <Input id="peso-hidratacao" type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 75" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="atividade-hidratacao">Nível de Atividade Física</Label>
              <Select value={nivelAtividade} onValueChange={setNivelAtividade}>
                <SelectTrigger id="atividade-hidratacao" className="w-full rounded-lg mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {niveisAtividade.map(nivel => (
                    <SelectItem key={nivel.value} value={nivel.value}>{nivel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Calculator className="mr-2 h-5 w-5" /> Calcular Hidratação
            </Button>
          </form>

          {resultado && (
            <div className="mt-6 pt-6 border-t">
              <Alert className="rounded-lg bg-primary/5 border-primary/20 text-center">
                  <Droplets className="h-5 w-5 text-primary mx-auto mb-2" />
                  <AlertTitle className="font-semibold text-primary text-lg">Recomendação Diária</AlertTitle>
                  <ShadcnAlertDescription className="text-primary/90 space-y-2 mt-2">
                      <p>Você deve beber aproximadamente:</p>
                      <p><strong className="text-2xl">{resultado.litros} litros de água</strong></p>
                  </ShadcnAlertDescription>
              </Alert>

              <div className="mt-8">
                 <Alert variant="default" className="border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400">
                    <Info className="h-5 w-5 !text-sky-600" />
                    <AlertTitle className="font-semibold !text-sky-700 dark:!text-sky-500">Dicas para se Manter Hidratado</AlertTitle>
                    <ShadcnAlertDescription className="!text-sky-600/90 dark:!text-sky-400/90 text-xs">
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Tenha sempre uma garrafa de água por perto.</li>
                            <li>Não espere sentir sede para beber água.</li>
                            <li>Em dias quentes ou de atividade intensa, beba mais.</li>
                            <li>Observe a cor da sua urina: ela deve estar clara.</li>
                        </ul>
                    </ShadcnAlertDescription>
                </Alert>
              </div>

               <AdPlaceholder className="mt-8" />
          
                <div className="mt-8 text-center">
                    <h4 className="text-md font-semibold mb-3">Outras Ferramentas de Saúde:</h4>
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

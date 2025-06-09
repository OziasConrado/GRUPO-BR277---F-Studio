
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Flame, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

const niveisAtividade = [
  { label: "Sedentário (pouco ou nenhum exercício)", value: "1.2" },
  { label: "Levemente ativo (exercício leve 1-3 dias/semana)", value: "1.375" },
  { label: "Moderadamente ativo (exercício moderado 3-5 dias/semana)", value: "1.55" },
  { label: "Muito ativo (exercício intenso 6-7 dias/semana)", value: "1.725" },
  { label: "Extremamente ativo (exercício muito intenso, trabalho físico)", value: "1.9" },
];

interface ResultadoCalorias {
  tmb: number;
  necessidadeCalorica: number;
}

export default function CalculadoraCaloriasPage() {
  const [sexo, setSexo] = useState<string>('masculino');
  const [idade, setIdade] = useState<string>('');
  const [peso, setPeso] = useState<string>('');
  const [altura, setAltura] = useState<string>('');
  const [nivelAtividade, setNivelAtividade] = useState<string>(niveisAtividade[0].value);
  const [resultado, setResultado] = useState<ResultadoCalorias | null>(null);
  const { toast } = useToast();

  const handleCalcularCalorias = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const idadeNum = parseInt(idade);
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const atividadeNum = parseFloat(nivelAtividade);

    if (isNaN(idadeNum) || isNaN(pesoNum) || isNaN(alturaNum) || idadeNum <= 0 || pesoNum <= 0 || alturaNum <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Preencha todos os campos (Idade, Peso, Altura) com valores positivos.',
      });
      return;
    }

    let tmb = 0;
    if (sexo === 'masculino') {
      tmb = 66 + (13.7 * pesoNum) + (5 * alturaNum) - (6.8 * idadeNum);
    } else { // feminino
      tmb = 655 + (9.6 * pesoNum) + (1.8 * alturaNum) - (4.7 * idadeNum);
    }

    const caloriasDiarias = tmb * atividadeNum;

    setResultado({
      tmb: Math.round(tmb),
      necessidadeCalorica: Math.round(caloriasDiarias),
    });
  };
  
  const suggestedTools = [
    { title: "Calculadora de IMC", Icon: Calculator, href: "/ferramentas/calculadora-imc", description: "Verifique seu IMC." },
    { title: "Monitorar Glicemia", Icon: Flame, href: "/ferramentas/monitoramento-glicemia", description: "Acompanhe seus níveis."}
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
            <Flame className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Calorias</CardTitle>
          </div>
          <CardDescription>Estime sua Taxa Metabólica Basal (TMB) e necessidade calórica diária.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcularCalorias} className="space-y-4">
            <div>
              <Label htmlFor="sexo">Sexo Biológico</Label>
              <Select value={sexo} onValueChange={setSexo}>
                <SelectTrigger id="sexo" className="w-full rounded-lg mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idade">Idade (anos)</Label>
              <Input id="idade" type="number" inputMode="numeric" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 30" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="number" inputMode="decimal" value={peso} onChange={e => setPeso(e.target.value)} placeholder="Ex: 70.5" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input id="altura" type="number" inputMode="numeric" value={altura} onChange={e => setAltura(e.target.value)} placeholder="Ex: 175" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="atividade">Nível de Atividade Física</Label>
              <Select value={nivelAtividade} onValueChange={setNivelAtividade}>
                <SelectTrigger id="atividade" className="w-full rounded-lg mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {niveisAtividade.map(nivel => (
                    <SelectItem key={nivel.value} value={nivel.value}>{nivel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Flame className="mr-2 h-5 w-5" /> Calcular Calorias
            </Button>
          </form>

          {resultado && (
            <Alert className="mt-6 rounded-lg bg-primary/5 border-primary/20">
              <Flame className="h-5 w-5 text-primary" />
              <AlertTitle className="font-semibold text-primary">Resultado Estimado:</AlertTitle>
              <ShadcnAlertDescription className="text-primary/90 space-y-1">
                <p>Sua Taxa Metabólica Basal (TMB) é de aproximadamente: <strong>{resultado.tmb} kcal/dia</strong>.</p>
                <p>Sua necessidade calórica diária é de aproximadamente: <strong>{resultado.necessidadeCalorica} kcal/dia</strong>.</p>
              </ShadcnAlertDescription>
            </Alert>
          )}
          <CardDescription className="text-xs text-muted-foreground mt-4 text-center">
            Esta calculadora usa a fórmula de Harris-Benedict. Os resultados são estimativas e podem variar. Consulte um profissional de saúde para orientações personalizadas.
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

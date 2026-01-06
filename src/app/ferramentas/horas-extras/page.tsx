
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

interface ResultadoHorasExtras {
  valorHoraComum: number;
  valorHoraExtra: number;
  totalBruto: number;
  estimativaLiquida: number;
}

export default function CalculadoraHorasExtrasPage() {
  const [salarioBruto, setSalarioBruto] = useState<string>('');
  const [jornadaMensal, setJornadaMensal] = useState<string>('220');
  const [adicional, setAdicional] = useState<string>('50');
  const [quantidadeHoras, setQuantidadeHoras] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoHorasExtras | null>(null);
  const { toast } = useToast();

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);

    const salarioNum = parseFloat(salarioBruto);
    const jornadaNum = parseInt(jornadaMensal);
    const adicionalNum = parseInt(adicional);
    const horasNum = parseFloat(quantidadeHoras);

    if (isNaN(salarioNum) || salarioNum <= 0 || isNaN(jornadaNum) || jornadaNum <= 0 || isNaN(horasNum) || horasNum < 0) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Preencha Salário, Jornada e Quantidade de Horas com números válidos.',
      });
      return;
    }

    const valorHoraComum = salarioNum / jornadaNum;
    const valorHoraExtra = valorHoraComum * (1 + adicionalNum / 100);
    const totalBruto = valorHoraExtra * horasNum;
    const estimativaLiquida = totalBruto * 0.90; // Desconto estimado de 10%

    setResultado({
      valorHoraComum,
      valorHoraExtra,
      totalBruto,
      estimativaLiquida,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Horas Extras</CardTitle>
          </div>
          <CardDescription>Calcule o valor bruto e uma estimativa líquida das suas horas extras.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <Label htmlFor="salario-bruto">Salário Bruto Mensal (R$)</Label>
              <Input id="salario-bruto" type="number" inputMode="decimal" value={salarioBruto} onChange={e => setSalarioBruto(e.target.value)} placeholder="Ex: 3000.00" className="rounded-lg mt-1" step="0.01"/>
            </div>
            <div>
              <Label htmlFor="jornada-mensal">Jornada Mensal (horas)</Label>
              <Input id="jornada-mensal" type="number" inputMode="numeric" value={jornadaMensal} onChange={e => setJornadaMensal(e.target.value)} placeholder="Padrão: 220" className="rounded-lg mt-1"/>
            </div>
             <div>
              <Label htmlFor="adicional-he">Adicional de Hora Extra (%)</Label>
               <Select value={adicional} onValueChange={setAdicional}>
                <SelectTrigger id="adicional-he" className="w-full rounded-lg mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50% (Dias de semana e sábados)</SelectItem>
                  <SelectItem value="100">100% (Domingos e feriados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantidade-horas">Quantidade de Horas Extras Realizadas</Label>
              <Input id="quantidade-horas" type="number" inputMode="decimal" value={quantidadeHoras} onChange={e => setQuantidadeHoras(e.target.value)} placeholder="Ex: 10.5" className="rounded-lg mt-1" step="0.1"/>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">
                <Clock className="mr-2 h-5 w-5" />
                Calcular Horas Extras
            </Button>
          </form>

          {resultado && (
            <div className="mt-6 pt-6 border-t">
              <AdPlaceholder />
              <Alert className="rounded-lg bg-primary/5 border-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                  <AlertTitle className="font-semibold text-primary">Resultado Estimado</AlertTitle>
                  <ShadcnAlertDescription className="text-primary/90 space-y-2 mt-2 text-sm">
                      <div className="flex justify-between"><span>Valor da sua hora comum:</span> <span className="font-semibold">R$ {resultado.valorHoraComum.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Valor da hora extra ({adicional}%):</span> <span className="font-semibold">R$ {resultado.valorHoraExtra.toFixed(2)}</span></div>
                      <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-primary/20"><span>Total Bruto a Receber:</span> <span>R$ {resultado.totalBruto.toFixed(2)}</span></div>
                      <div className="flex justify-between text-base font-bold text-green-600 dark:text-green-400"><span>Estimativa Líquida (aprox.):</span> <span>R$ {resultado.estimativaLiquida.toFixed(2)}</span></div>
                  </ShadcnAlertDescription>
              </Alert>
              <CardDescription className="text-xs text-muted-foreground mt-4 text-center">
                Este cálculo é apenas uma estimativa. Descontos de INSS, IRRF e outros podem variar. Verifique sempre seu holerite oficial.
              </CardDescription>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

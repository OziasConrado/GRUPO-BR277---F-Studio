
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calculator, Fuel, AlertCircle, PiggyBank } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

const tiposCarga = ["normal", "refrigerada", "perigosa"] as const;

const freteSchema = z.object({
  distancia: z.coerce.number().min(1, "Distância é obrigatória."),
  peso: z.coerce.number().min(1, "Peso da carga é obrigatório."),
  tipoCarga: z.enum(tiposCarga, { required_error: "Tipo de carga é obrigatório." }),
  tarifaBase: z.coerce.number().min(0.01, "Tarifa base por KM é obrigatória."),
  pedagios: z.coerce.number().optional(),
  consumoVeiculo: z.coerce.number().optional(),
  precoCombustivel: z.coerce.number().optional(),
});

type FreteFormValues = z.infer<typeof freteSchema>;

interface ResultadoFrete {
  custoDistancia: number;
  custoPeso: number;
  custoTipo: number;
  custoPedagios: number;
  custoCombustivel?: number;
  totalEstimado: number;
  inputs: FreteFormValues;
}

export default function CalculadoraFretePage() {
  const [resultado, setResultado] = useState<ResultadoFrete | null>(null);
  const { toast } = useToast();

  const form = useForm<FreteFormValues>({
    resolver: zodResolver(freteSchema),
    defaultValues: {
      tipoCarga: "normal",
      // Explicitly initializing optional number fields to avoid undefined issues if not touched
      pedagios: undefined, 
      consumoVeiculo: undefined,
      precoCombustivel: undefined,
    }
  });

  const onSubmitForm = (data: FreteFormValues) => {
    let adicionalTipo = 0;
    switch (data.tipoCarga) {
      case 'refrigerada': adicionalTipo = 0.25; break;
      case 'perigosa': adicionalTipo = 0.40; break;
      default: adicionalTipo = 0; break;
    }

    const custoDistanciaCalc = data.distancia * data.tarifaBase;
    const custoPesoCalc = data.peso * 0.05; 
    const custoTipoCalc = custoDistanciaCalc * adicionalTipo;
    const custoPedagiosCalc = data.pedagios || 0;

    let custoCombustivelCalc: number | undefined = undefined;
    if (data.consumoVeiculo && data.consumoVeiculo > 0 && data.precoCombustivel && data.precoCombustivel > 0) {
      const litrosNecessarios = data.distancia / data.consumoVeiculo;
      custoCombustivelCalc = litrosNecessarios * data.precoCombustivel;
    }

    const total = custoDistanciaCalc + custoPesoCalc + custoTipoCalc + custoPedagiosCalc + (custoCombustivelCalc || 0);

    setResultado({
      custoDistancia: custoDistanciaCalc,
      custoPeso: custoPesoCalc,
      custoTipo: custoTipoCalc,
      custoPedagios: custoPedagiosCalc,
      custoCombustivel: custoCombustivelCalc,
      totalEstimado: total,
      inputs: data,
    });
  };
  
  const suggestedTools = [
    { title: "Custo de Viagem (Diesel + Arla)", Icon: Fuel, href: "/ferramentas/custo-viagem", description: "Planeje todos os gastos." },
    { title: "Checklist de Viagem", Icon: Calculator, href: "/ferramentas/checklist", description: "Não esqueça de nada."}
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
            <PiggyBank className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Calculadora de Frete</CardTitle>
          </div>
          <CardDescription>Estime o custo do seu frete com mais detalhes.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <Label htmlFor="distancia">Distância da Viagem (km) <span className="text-destructive">*</span></Label>
              <Input id="distancia" type="number" inputMode="decimal" {...form.register("distancia")} className="rounded-lg mt-1" />
              {form.formState.errors.distancia && <p className="text-sm text-destructive mt-1">{form.formState.errors.distancia.message}</p>}
            </div>
            <div>
              <Label htmlFor="peso">Peso da Carga (kg) <span className="text-destructive">*</span></Label>
              <Input id="peso" type="number" inputMode="decimal" {...form.register("peso")} className="rounded-lg mt-1" />
              {form.formState.errors.peso && <p className="text-sm text-destructive mt-1">{form.formState.errors.peso.message}</p>}
            </div>
            <div>
              <Label htmlFor="tipoCarga">Tipo de Carga <span className="text-destructive">*</span></Label>
              <Controller
                name="tipoCarga"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="tipoCarga" className="w-full rounded-lg mt-1">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="refrigerada">Refrigerada (+25%)</SelectItem>
                      <SelectItem value="perigosa">Perigosa (+40%)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.tipoCarga && <p className="text-sm text-destructive mt-1">{form.formState.errors.tipoCarga.message}</p>}
            </div>
            <div>
              <Label htmlFor="tarifaBase">Tarifa Base (R$/km) <span className="text-destructive">*</span></Label>
              <Input id="tarifaBase" type="number" inputMode="decimal" {...form.register("tarifaBase")} step="0.01" className="rounded-lg mt-1" />
              {form.formState.errors.tarifaBase && <p className="text-sm text-destructive mt-1">{form.formState.errors.tarifaBase.message}</p>}
            </div>
            <div>
              <Label htmlFor="pedagios">Custo Total com Pedágios (R$)</Label>
              <Input id="pedagios" type="number" inputMode="decimal" {...form.register("pedagios")} step="0.01" className="rounded-lg mt-1" placeholder="Opcional"/>
            </div>
            <Card className="p-4 mt-4 bg-muted/20 rounded-lg">
                <CardDescription className="text-sm mb-3 text-foreground">Cálculo de Combustível (Opcional):</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="consumoVeiculo">Consumo do Veículo (km/l)</Label>
                        <Input id="consumoVeiculo" type="number" inputMode="decimal" {...form.register("consumoVeiculo")} step="0.1" className="rounded-lg mt-1 bg-background/70"/>
                    </div>
                    <div>
                        <Label htmlFor="precoCombustivel">Preço do Combustível (R$/litro)</Label>
                        <Input id="precoCombustivel" type="number" inputMode="decimal" {...form.register("precoCombustivel")} step="0.01" className="rounded-lg mt-1 bg-background/70"/>
                    </div>
                </div>
                {(form.formState.errors.consumoVeiculo || form.formState.errors.precoCombustivel) && (
                    <p className="text-sm text-destructive mt-2">Se preencher um campo do combustível, preencha o outro ou deixe ambos vazios.</p>
                )}
            </Card>

            <Button type="submit" className="w-full rounded-full py-3 text-base">
              <Calculator className="mr-2 h-5 w-5" /> Calcular Frete
            </Button>
          </form>

          {resultado && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Resultado Estimado do Frete:</h3>
              <Card className="rounded-lg shadow-inner">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Distância:</span> <span>{resultado.inputs.distancia} km</span></div>
                  <div className="flex justify-between"><span>Peso da Carga:</span> <span>{resultado.inputs.peso} kg</span></div>
                  <div className="flex justify-between"><span>Tipo de Carga:</span> <span className="capitalize">{resultado.inputs.tipoCarga}</span></div>
                  <div className="flex justify-between"><span>Tarifa Base:</span> <span>R$ {resultado.inputs.tarifaBase.toFixed(2)} / km</span></div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between"><span>Custo por Distância:</span> <span>R$ {resultado.custoDistancia.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Adicional por Peso:</span> <span>R$ {resultado.custoPeso.toFixed(2)}</span></div>
                  {resultado.custoTipo > 0 && <div className="flex justify-between"><span>Adicional por Tipo de Carga:</span> <span>R$ {resultado.custoTipo.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span>Custo Pedágios:</span> <span>R$ {resultado.custoPedagios.toFixed(2)}</span></div>
                  {resultado.custoCombustivel !== undefined && (
                    <div className="flex justify-between">
                        <span>Custo Combustível:</span> 
                        <span>R$ {resultado.custoCombustivel.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator className="my-2" />

                  <div className="flex justify-between font-bold text-lg text-primary">
                    <span>Total Estimado do Frete:</span>
                    <span>R$ {resultado.totalEstimado.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              <CardDescription className="text-xs text-center mt-3 text-muted-foreground">
                Este é um cálculo estimado. Outros custos podem ser aplicáveis.
              </CardDescription>

              <AdPlaceholder className="mt-8" />

              <div className="mt-8 text-center">
                <h4 className="text-md font-semibold mb-3">Outras Ferramentas de Planejamento:</h4>
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

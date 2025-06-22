
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Wrench } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

const diagnosticoData = {
  motor_nao_liga: {
    title: "Motor não liga",
    sugestoes: [
      { causa: "Bateria descarregada ou com terminais frouxos/oxidados.", solucao: "Verifique os terminais da bateria. Tente uma 'chupeta' (ponte de bateria). Se não resolver, a bateria pode precisar ser trocada." },
      { causa: "Problema no motor de arranque.", solucao: "Você pode ouvir um 'clique' ao tentar dar a partida. Requer verificação por um eletricista." },
      { causa: "Falta de combustível ou combustível adulterado.", solucao: "Verifique o nível do tanque. Se suspeitar de combustível ruim, será necessário drenar o tanque e reabastecer." },
      { causa: "Falha no alternador.", solucao: "A bateria não está sendo carregada. A luz da bateria no painel pode acender com o motor em funcionamento. Procure um eletricista." },
    ]
  },
  superaquecimento: {
    title: "Superaquecimento",
    sugestoes: [
      { causa: "Nível baixo do líquido de arrefecimento.", solucao: "Pare o veículo em local seguro e espere o motor esfriar COMPLETAMENTE antes de abrir a tampa do radiador. Complete com o líquido adequado." },
      { causa: "Vazamento no sistema de arrefecimento (radiador, mangueiras).", solucao: "Procure por poças de líquido colorido sob o veículo. Reparos são necessários." },
      { causa: "Ventoinha do radiador não está funcionando.", solucao: "A ventoinha deve ligar quando o motor atinge certa temperatura. Se não ligar, pode ser um fusível queimado ou um problema elétrico." },
      { causa: "Válvula termostática travada.", solucao: "A válvula não abre para permitir a circulação do líquido de arrefecimento. Requer substituição por um mecânico." },
    ]
  },
  fumaca_escapamento: {
    title: "Fumaça no escapamento",
    sugestoes: [
      { causa: "Fumaça azulada: Queima de óleo.", solucao: "Pode indicar anéis de pistão ou vedantes de válvula desgastados. Problema sério, procure um mecânico." },
      { causa: "Fumaça branca e densa: Queima do líquido de arrefecimento.", solucao: "Pode ser um problema na junta do cabeçote. Verifique o nível do líquido de arrefecimento. Procure um mecânico com urgência." },
      { causa: "Fumaça preta: Excesso de combustível.", solucao: "Pode ser um problema nos bicos injetores, filtro de ar sujo ou sensor de oxigênio. Aumenta o consumo de combustível." },
    ]
  },
  barulho_estranho: {
    title: "Barulho estranho",
    sugestoes: [
      { causa: "Assobio agudo ao acelerar: Correia solta ou gasta.", solucao: "Verificar a tensão e o estado das correias. Pode precisar de ajuste ou substituição." },
      { causa: "Ruído metálico ('toc-toc') do motor: Falta de lubrificação ou desgaste interno.", solucao: "Verifique o nível do óleo imediatamente. Se o nível estiver correto, procure um mecânico com urgência. Não rode com o veículo." },
      { causa: "Chiado ao frear: Pastilhas de freio gastas.", solucao: "As pastilhas possuem um indicador de desgaste que produz esse som. É hora de trocá-las para não danificar os discos." },
      { causa: "Estalos ao virar o volante: Problema na junta homocinética.", solucao: "Indica desgaste na peça que conecta o eixo de transmissão às rodas. Requer substituição." },
    ]
  },
  perda_potencia: {
    title: "Perda de potência",
    sugestoes: [
      { causa: "Filtro de combustível ou de ar entupido.", solucao: "A troca dos filtros conforme o manual do veículo é a solução mais comum e barata. Melhora o desempenho e o consumo." },
      { causa: "Velas de ignição ou cabos de vela ruins.", solucao: "Causam falhas na ignição, resultando em perda de força. A troca resolve o problema." },
      { causa: "Bicos injetores sujos ou com defeito.", solucao: "A pulverização de combustível fica irregular. Uma limpeza ou troca dos bicos pode ser necessária." },
      { causa: "Problema na bomba de combustível.", solucao: "A bomba não está enviando combustível com a pressão adequada para o motor. Requer diagnóstico e possível troca." },
    ]
  },
};

type SintomaKey = keyof typeof diagnosticoData;

export default function DiagnosticoPage() {
  const [selectedSintoma, setSelectedSintoma] = useState<SintomaKey | null>(null);

  const sintomaInfo = selectedSintoma ? diagnosticoData[selectedSintoma] : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="rounded-xl shadow-md">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Wrench className="w-7 h-7 text-primary"/>
                <CardTitle className="font-headline text-xl sm:text-2xl">Diagnóstico Básico de Problemas</CardTitle>
            </div>
            <CardDescription>Selecione o sintoma para ver possíveis causas e soluções. Esta é uma ferramenta de auxílio e não substitui um mecânico profissional.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <div className="space-y-4">
            <div>
              <Label htmlFor="sintoma">Selecione o Sintoma</Label>
              <Select onValueChange={(value) => setSelectedSintoma(value as SintomaKey)}>
                <SelectTrigger id="sintoma" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder="Escolha um sintoma..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor_nao_liga">Motor não liga</SelectItem>
                  <SelectItem value="superaquecimento">Superaquecimento</SelectItem>
                  <SelectItem value="fumaca_escapamento">Fumaça no escapamento</SelectItem>
                  <SelectItem value="barulho_estranho">Barulho estranho</SelectItem>
                  <SelectItem value="perda_potencia">Perda de potência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 p-2 rounded-lg min-h-[100px]">
            {sintomaInfo ? (
              <div>
                <h4 className="font-semibold mb-2 flex items-center text-lg"><AlertCircle className="w-5 h-5 mr-2 text-primary"/>{sintomaInfo.title}</h4>
                <Accordion type="single" collapsible className="w-full">
                  {sintomaInfo.sugestoes.map((sugestao, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left font-medium">{sugestao.causa}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {sugestao.solucao}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Selecione um sintoma acima para ver as possíveis causas e soluções.</p>
            )}
          </div>
          <AdPlaceholder className="mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}

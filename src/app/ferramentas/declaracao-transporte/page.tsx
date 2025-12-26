
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ClipboardSignature, Copy, RefreshCw, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function DeclaracaoTransportePage() {
  const [nomeTransportador, setNomeTransportador] = useState('');
  const [nomeVeiculo, setNomeVeiculo] = useState('');
  const [placa, setPlaca] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [descricaoCarga, setDescricaoCarga] = useState('');
  const [pesoCarga, setPesoCarga] = useState('');
  const [dataTransporte, setDataTransporte] = useState<Date | undefined>(undefined);
  const [declaracaoGerada, setDeclaracaoGerada] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Evita erro de hidratação no servidor
    setDataTransporte(new Date());
  }, []);

  const handleGerarDeclaracao = () => {
    setErrorMessage(null);
    setDeclaracaoGerada('');

    if (!nomeTransportador || !nomeVeiculo || !placa || !origem || !destino || !descricaoCarga || !pesoCarga || !dataTransporte) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    const placaUpper = placa.trim().toUpperCase();
    const regexPlacaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
    const regexPlacaAntiga = /^[A-Z]{3}\d{4}$/;

    if (!regexPlacaMercosul.test(placaUpper) && !regexPlacaAntiga.test(placaUpper.replace(/\s/g, ''))) {
      setErrorMessage('Placa inválida. Formatos aceitos: AAA1234 ou ABC1D23.');
      return;
    }

    const textoDeclaracao = `
Declaração de Transporte

Eu, ${nomeTransportador.trim()}, transportador(a) do veículo ${nomeVeiculo.trim()} de placa ${placaUpper}, declaro para os devidos fins que realizei o transporte da seguinte carga:

- Descrição da carga: ${descricaoCarga.trim()}
- Peso da carga: ${pesoCarga.trim()} kg
- Origem: ${origem.trim()}
- Destino: ${destino.trim()}
- Data do Transporte: ${format(dataTransporte, "dd/MM/yyyy", { locale: ptBR })}

Declaro estar ciente de minhas responsabilidades, conforme as normas vigentes.

Assinatura: __________________________
    `;
    setDeclaracaoGerada(textoDeclaracao.trim());
  };

  const handleCopiarDeclaracao = () => {
    if (!declaracaoGerada) return;
    navigator.clipboard.writeText(declaracaoGerada).then(() => {
      toast({ title: "Copiado!", description: "Declaração copiada para a área de transferência." });
    }).catch(err => {
      toast({ variant: "destructive", title: "Erro ao copiar", description: "Não foi possível copiar a declaração." });
      console.error("Erro ao copiar: ", err);
    });
  };

  const handleLimparCampos = () => {
    setNomeTransportador('');
    setNomeVeiculo('');
    setPlaca('');
    setOrigem('');
    setDestino('');
    setDescricaoCarga('');
    setPesoCarga('');
    setDataTransporte(new Date());
    setDeclaracaoGerada('');
    setErrorMessage(null);
    toast({ title: "Campos Limpos", description: "Pronto para uma nova declaração." });
  };
  
  const suggestedTools = [
    { title: "Calculadora de Frete", Icon: ClipboardSignature, href: "/ferramentas/calculadora-frete", description: "Estime custos do frete." },
    { title: "Checklist de Viagem", Icon: ClipboardSignature, href: "/ferramentas/checklist", description: "Prepare-se para a estrada."}
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
            <ClipboardSignature className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Declaração de Transporte</CardTitle>
          </div>
          <CardDescription>Crie uma declaração de transporte simples e rápida.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGerarDeclaracao(); }}>
            <div>
              <Label htmlFor="nomeTransportador">Nome do Transportador(a)</Label>
              <Input id="nomeTransportador" value={nomeTransportador} onChange={e => setNomeTransportador(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="nomeVeiculo">Nome/Modelo do Veículo</Label>
              <Input id="nomeVeiculo" value={nomeVeiculo} onChange={e => setNomeVeiculo(e.target.value)} className="rounded-lg mt-1" placeholder="Ex: Volvo FH 540"/>
            </div>
            <div>
              <Label htmlFor="placa">Placa do Veículo</Label>
              <Input id="placa" value={placa} onChange={e => setPlaca(e.target.value)} className="rounded-lg mt-1" placeholder="Ex: BRA2E19 ou AAA1234" />
            </div>
            <div>
              <Label htmlFor="origem">Cidade de Origem</Label>
              <Input id="origem" value={origem} onChange={e => setOrigem(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="destino">Cidade de Destino</Label>
              <Input id="destino" value={destino} onChange={e => setDestino(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="descricaoCarga">Descrição da Carga</Label>
              <Input id="descricaoCarga" value={descricaoCarga} onChange={e => setDescricaoCarga(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="pesoCarga">Peso da Carga (kg)</Label>
              <Input id="pesoCarga" type="number" value={pesoCarga} onChange={e => setPesoCarga(e.target.value)} className="rounded-lg mt-1" placeholder="Ex: 25000" />
            </div>
            <div>
              <Label htmlFor="dataTransporte">Data do Transporte</Label>
              {/* <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-lg mt-1",
                      !dataTransporte && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataTransporte ? format(dataTransporte, "dd 'de' LLLL 'de' yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataTransporte}
                    onSelect={setDataTransporte}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover> */}
               <Input 
                id="dataTransporte" 
                type="text" 
                value={dataTransporte ? format(dataTransporte, "dd/MM/yyyy") : ''} 
                readOnly 
                className="rounded-lg mt-1 bg-background/70"
              />
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro de Validação</AlertTitle>
                    <ShadcnAlertDescription>{errorMessage}</ShadcnAlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <Button type="button" variant="outline" onClick={handleLimparCampos} className="w-full sm:w-auto rounded-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Limpar Campos
              </Button>
              <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                <ClipboardSignature className="mr-2 h-5 w-5" /> Gerar Declaração
              </Button>
            </div>
          </form>

          {declaracaoGerada && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-2">Declaração Gerada:</h3>
              <Card className="rounded-lg">
                <CardContent className="p-4">
                  <Textarea
                    value={declaracaoGerada}
                    readOnly
                    className="min-h-[250px] text-sm bg-muted/20 border-muted/50 rounded-md font-mono"
                  />
                  <Button onClick={handleCopiarDeclaracao} className="w-full mt-4 rounded-full">
                    <Copy className="mr-2 h-4 w-4" /> Copiar Texto da Declaração
                  </Button>
                </CardContent>
              </Card>
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

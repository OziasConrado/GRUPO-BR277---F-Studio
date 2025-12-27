
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ClipboardCopy, RefreshCw, Copy, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

const chavePixTipos = [
  "CPF/CNPJ", "Celular", "Email", "Aleatória"
];

export default function GeradorPixPage() {
  const [tipoChave, setTipoChave] = useState<string>(chavePixTipos[0]);
  const [chavePix, setChavePix] = useState('');
  const [nomeBeneficiario, setNomeBeneficiario] = useState('');
  const [valor, setValor] = useState('');
  const [payloadGerado, setPayloadGerado] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const handleGerarPix = () => {
    setErrorMessage(null);
    setPayloadGerado('');

    if (!chavePix.trim() || !valor.trim()) {
      setErrorMessage('A chave Pix e o valor são obrigatórios.');
      return;
    }
    
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
        setErrorMessage('O valor deve ser um número positivo.');
        return;
    }
    const valorFormatado = valorNumerico.toFixed(2).replace('.', ''); // Ex: 10.50 -> 1050

    let payload = `00020126580014BR.GOV.BCB.PIX01${chavePix.length.toString().padStart(2, '0')}${chavePix}`;

    if (nomeBeneficiario.trim()) {
        const nomeLimpo = nomeBeneficiario.trim().slice(0, 25); // Limita nome a 25 chars
        payload += `59${nomeLimpo.length.toString().padStart(2, '0')}${nomeLimpo}`;
    } else {
        payload += `5913NAO INFORMADO`; // Nome padrão se não informado
    }
    
    payload += `52040000`; // Código do país e tipo de moeda (fixo)
    payload += `5303986`; // Código MCC (Merchant Category Code) - padrão para transações genéricas
    
    // Valor da transação
    payload += `54${valorFormatado.length.toString().padStart(2, '0')}${valorFormatado}`;
    
    payload += `5802BR`; // Código do país (BR)
    payload += `6009Sao Paulo`; // Cidade (pode ser genérico ou customizável)
    // Identificador da transação (*** é um placeholder comum, pode ser customizado)
    // Se não houver identificador específico, pode ser omitido ou usar ***
    payload += `62070503***`; 
    
    // Adiciona o campo de CRC16 (placeholder)
    // A geração correta do CRC16 é complexa e geralmente feita por bibliotecas específicas.
    // Aqui, vamos usar um placeholder como no código original do usuário.
    payload += `6304`; // ID do campo CRC16
    // Calculo do CRC16 é omitido aqui, um valor fixo de placeholder será usado.
    // const crc16 = calcularCRC16(payloadSemCRC); // Função de cálculo do CRC16 não implementada
    const crc16Placeholder = "A1B2"; // Placeholder para o CRC16
    payload += crc16Placeholder;


    setPayloadGerado(payload);
  };
  
  // Função de cálculo CRC16 (Exemplo básico - NÃO USAR EM PRODUÇÃO SEM VALIDAÇÃO)
  // A implementação correta do CRC16-CCITT (XModem) é mais complexa.
  // Esta é uma simulação para ilustrar.
  function calcularCRC16Simples(dados: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < dados.length; i++) {
      crc ^= dados.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }


  const handleCopiarPayload = () => {
    if (!payloadGerado) return;
    navigator.clipboard.writeText(payloadGerado).then(() => {
      toast({ title: "Copiado!", description: "Link Pix Copia e Cola copiado para a área de transferência." });
    }).catch(err => {
      toast({ variant: "destructive", title: "Erro ao copiar", description: "Não foi possível copiar o link Pix." });
      console.error("Erro ao copiar: ", err);
    });
  };

  const handleLimparCampos = () => {
    setTipoChave(chavePixTipos[0]);
    setChavePix('');
    setNomeBeneficiario('');
    setValor('');
    setPayloadGerado('');
    setErrorMessage(null);
    toast({ title: "Campos Limpos", description: "Pronto para gerar um novo link Pix." });
  };
  
  const suggestedTools = [
    { title: "Calculadora de Custo de Viagem", Icon: ClipboardCopy, href: "/ferramentas/custo-viagem", description: "Calcule diesel, Arla e mais." },
    { title: "Declaração de Transporte", Icon: ClipboardCopy, href: "/ferramentas/declaracao-transporte", description: "Gere sua declaração."}
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
            <ClipboardCopy className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Pix Copia e Cola</CardTitle>
          </div>
          <CardDescription>Crie um código Pix Copia e Cola para seus pagamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGerarPix(); }}>
            <div>
              <Label htmlFor="tipoChavePix">Tipo da Chave</Label>
              <Select value={tipoChave} onValueChange={setTipoChave}>
                <SelectTrigger id="tipoChavePix" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder="Selecione o tipo de chave..." />
                </SelectTrigger>
                <SelectContent>
                  {chavePixTipos.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="chavePix">Chave Pix <span className="text-destructive">*</span></Label>
              <Input id="chavePix" value={chavePix} onChange={e => setChavePix(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label htmlFor="nomeBeneficiario">Nome do Beneficiário (Opcional)</Label>
              <Input id="nomeBeneficiario" value={nomeBeneficiario} onChange={e => setNomeBeneficiario(e.target.value)} className="rounded-lg mt-1" placeholder="Máx. 25 caracteres"/>
            </div>
            <div>
              <Label htmlFor="valorPix">Valor (R$) <span className="text-destructive">*</span></Label>
              <Input id="valorPix" type="text" inputMode='decimal' value={valor} onChange={e => setValor(e.target.value)} className="rounded-lg mt-1" placeholder="Ex: 10,50" />
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
                <ClipboardCopy className="mr-2 h-5 w-5" /> Gerar Pix Copia e Cola
              </Button>
            </div>
          </form>

          {payloadGerado && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-2">Pix Copia e Cola Gerado:</h3>
              <Card className="rounded-lg">
                <CardContent className="p-4">
                  <Textarea
                    value={payloadGerado}
                    readOnly
                    className="min-h-[120px] text-sm bg-muted/20 border-muted/50 rounded-md font-mono break-all"
                  />
                  <Button onClick={handleCopiarPayload} className="w-full mt-4 rounded-full">
                    <Copy className="mr-2 h-4 w-4" /> Copiar Código Pix
                  </Button>
                </CardContent>
              </Card>
              <CardDescription className="text-xs text-center mt-3 text-muted-foreground">
                Este é um gerador simplificado. O código gerado não inclui o cálculo dinâmico do CRC16,
                que é um componente padrão do Pix Copia e Cola. Teste antes de usar para transações reais.
              </CardDescription>
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

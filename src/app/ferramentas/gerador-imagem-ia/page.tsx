'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, Loader2, Download, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { gerarImagem } from '@/ai/flows/gerar-imagem-flow';
import { GerarImagemInputSchema, type GerarImagemInput } from '@/ai/schemas/gerar-imagem-schemas';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

export default function GeradorImagemPage() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GerarImagemInput>({
    resolver: zodResolver(GerarImagemInputSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: GerarImagemInput) => {
    setIsLoading(true);
    setGeneratedImage(null);
    setRevisedPrompt(null);
    try {
      const result = await gerarImagem(data);
      if (result && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        if (result.revisedPrompt) {
            setRevisedPrompt(result.revisedPrompt);
        }
        toast({ title: "Imagem Gerada!", description: "Sua imagem foi criada com sucesso." });
      } else {
        toast({ variant: "destructive", title: "Erro ao Gerar Imagem", description: "Não foi possível criar a imagem. Tente um prompt diferente." });
      }
    } catch (error: any) {
      console.error("Erro ao gerar imagem:", error);
      toast({ variant: "destructive", title: "Erro Inesperado", description: error.message || "Ocorreu um erro no servidor. Tente mais tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'imagem-gerada-br277.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({title: "Download Iniciado!"});
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
            <Wand2 className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Imagens (IA)</CardTitle>
          </div>
          <CardDescription>Use a Inteligência Artificial para criar imagens únicas a partir de texto.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="prompt">Descreva a imagem que você quer criar</Label>
              <Textarea
                id="prompt"
                {...form.register("prompt")}
                className="rounded-lg mt-1 min-h-[100px]"
                placeholder="Ex: Um caminhão futurista cromado viajando em uma estrada em Marte ao pôr do sol."
              />
              {form.formState.errors.prompt && <p className="text-sm text-destructive mt-1">{form.formState.errors.prompt.message}</p>}
            </div>

            <Button type="submit" className="w-full rounded-full py-3 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {isLoading ? "Gerando Imagem..." : "Gerar Imagem com IA"}
            </Button>
          </form>

          {(isLoading || generatedImage) && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Resultado:</h3>
              {isLoading && (
                <div className="w-full aspect-square bg-muted/50 rounded-lg flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground text-sm">Criando sua imagem, aguarde...</p>
                </div>
              )}
              {generatedImage && (
                <div className="space-y-4">
                    <div className="relative w-full aspect-square border rounded-lg overflow-hidden shadow-inner bg-muted">
                        <Image src={generatedImage} alt="Imagem gerada pela IA" layout="fill" objectFit="cover" />
                    </div>
                    {revisedPrompt && (
                         <p className="text-xs text-muted-foreground text-center italic">{revisedPrompt}</p>
                    )}
                    <Button onClick={handleDownload} className="w-full rounded-full">
                        <Download className="mr-2 h-4 w-4" /> Baixar Imagem
                    </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
       <Alert variant="default" className="border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400">
          <AlertCircle className="h-5 w-5 !text-sky-600" />
          <AlertTitle className="font-semibold !text-sky-700 dark:!text-sky-500">Dicas para Bons Resultados</AlertTitle>
          <ShadcnAlertDescription className="!text-sky-600/90 dark:!text-sky-400/90 text-xs">
              <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Seja descritivo: adicione detalhes como cores, estilos (ex: "foto realista", "desenho animado"), e ambiente.</li>
                  <li>A IA pode demorar um pouco para gerar, especialmente em imagens complexas.</li>
                  <li>Experimente diferentes prompts para obter resultados variados.</li>
              </ul>
          </ShadcnAlertDescription>
      </Alert>
    </div>
  );
}

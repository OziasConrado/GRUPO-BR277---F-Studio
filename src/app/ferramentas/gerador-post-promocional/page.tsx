
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Lightbulb, Copy, Loader2, AlertCircle, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { gerarPostsPromocionais, type GerarPostsPromocionaisInput, type GerarPostsPromocionaisOutput } from '@/ai/flows/gerar-post-promocional-flow';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { GerarPostsPromocionaisInputSchema, ToneEnum as ToneEnumSchema } from '@/ai/schemas/gerar-post-promocional-schemas'; // Updated import

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

const tonsMensagem = ToneEnumSchema.options; // Use options from imported schema
const plataformas = ["Geral", "Instagram", "Facebook", "LinkedIn", "Twitter/X"] as const;

export default function GeradorPostPromocionalPage() {
  const [generatedPosts, setGeneratedPosts] = useState<GerarPostsPromocionaisOutput['posts']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GerarPostsPromocionaisInput>({
    resolver: zodResolver(GerarPostsPromocionaisInputSchema),
    defaultValues: {
      productName: '',
      features: '',
      targetAudience: '',
      tone: 'Entusiasmado',
      includeHashtags: true,
      numVariations: 1,
      productLink: '',
      addEmojis: true,
      platform: 'Geral',
    },
  });

  const onSubmit = async (data: GerarPostsPromocionaisInput) => {
    setIsLoading(true);
    setGeneratedPosts([]);
    try {
      const result = await gerarPostsPromocionais(data);
      if (result && result.posts) {
        setGeneratedPosts(result.posts);
        toast({ title: "Posts Gerados!", description: "Seus posts promocionais estão prontos." });
      } else {
        toast({ variant: "destructive", title: "Erro ao Gerar Posts", description: "Não foi possível gerar os posts. Verifique os dados ou tente novamente." });
      }
    } catch (error) {
      console.error("Erro ao gerar posts:", error);
      toast({ variant: "destructive", title: "Erro Inesperado", description: "Ocorreu um erro no servidor. Tente mais tarde." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPost = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Post Copiado!", description: "Conteúdo copiado para a área de transferência." }))
      .catch(() => toast({ variant: "destructive", title: "Erro ao Copiar", description: "Não foi possível copiar o post." }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Post Promocional (IA)</CardTitle>
          </div>
          <CardDescription>Crie posts criativos e chamativos para suas redes sociais com a ajuda da Inteligência Artificial.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="productName">Nome do Produto/Serviço <span className="text-destructive">*</span></Label>
              <Input id="productName" {...form.register("productName")} className="rounded-lg mt-1" placeholder="Ex: Super Bota de Couro Reforçada"/>
              {form.formState.errors.productName && <p className="text-sm text-destructive mt-1">{form.formState.errors.productName.message}</p>}
            </div>

            <div>
              <Label htmlFor="features">Principais Características/Benefícios <span className="text-destructive">*</span></Label>
              <Textarea id="features" {...form.register("features")} className="rounded-lg mt-1 min-h-[80px]" placeholder="Ex: Confortável, durável, ideal para longas jornadas, design moderno..."/>
              {form.formState.errors.features && <p className="text-sm text-destructive mt-1">{form.formState.errors.features.message}</p>}
            </div>

            <div>
              <Label htmlFor="targetAudience">Público-Alvo <span className="text-destructive">*</span></Label>
              <Input id="targetAudience" {...form.register("targetAudience")} className="rounded-lg mt-1" placeholder="Ex: Caminhoneiros, aventureiros, trabalhadores..."/>
              {form.formState.errors.targetAudience && <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAudience.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tom da Mensagem</Label>
                <Controller
                  name="tone"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="tone" className="w-full rounded-lg mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tonsMensagem.map(tom => <SelectItem key={tom} value={tom}>{tom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="platform">Plataforma (Opcional)</Label>
                 <Controller
                  name="platform"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="platform" className="w-full rounded-lg mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {plataformas.map(plat => <SelectItem key={plat} value={plat}>{plat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="productLink">Link do Produto/Serviço (Opcional)</Label>
              <Input id="productLink" {...form.register("productLink")} className="rounded-lg mt-1" placeholder="https://seusite.com/produto"/>
              {form.formState.errors.productLink && <p className="text-sm text-destructive mt-1">{form.formState.errors.productLink.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="numVariations">Número de Variações (1-3)</Label>
                    <Controller
                        name="numVariations"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                id="numVariations"
                                type="number"
                                inputMode="numeric"
                                min="1"
                                max="3"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value,10))}
                                className="rounded-lg mt-1"
                            />
                        )}
                    />
                </div>
                <div className="space-y-2 pt-2 sm:pt-0">
                    <div className="flex items-center space-x-2">
                        <Controller name="addEmojis" control={form.control} render={({ field }) => (
                            <Checkbox id="addEmojis" checked={field.value} onCheckedChange={field.onChange} />
                        )} />
                        <Label htmlFor="addEmojis" className="font-normal text-sm">Incluir Emojis?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller name="includeHashtags" control={form.control} render={({ field }) => (
                            <Checkbox id="includeHashtags" checked={field.value} onCheckedChange={field.onChange} />
                        )} />
                        <Label htmlFor="includeHashtags" className="font-normal text-sm">Sugerir Hashtags?</Label>
                    </div>
                </div>
            </div>


            <Button type="submit" className="w-full rounded-full py-3 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {isLoading ? "Gerando Posts..." : "Gerar Posts com IA"}
            </Button>
          </form>

          {generatedPosts.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Posts Gerados:</h3>
              <div className="space-y-6">
                {generatedPosts.map((post, index) => (
                  <Card key={index} className="rounded-lg shadow-inner bg-muted/20">
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{post.text}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <p className="text-xs text-primary mt-2 break-all">
                          {post.hashtags.join(' ')}
                        </p>
                      )}
                      <Button onClick={() => handleCopyPost(post.text + (post.hashtags ? `\n\n${post.hashtags.join(' ')}` : ''))} className="w-full mt-4 rounded-full" variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" /> Copiar Post {index + 1}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <AdPlaceholder className="mt-8" />
            </div>
          )}
          
          {!isLoading && generatedPosts.length === 0 && (
            <div className="mt-8 text-center">
                 <CardDescription className="text-xs text-muted-foreground mt-4 text-center">
                    Preencha os campos acima e clique em "Gerar Posts com IA" para ver a mágica acontecer!
                </CardDescription>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

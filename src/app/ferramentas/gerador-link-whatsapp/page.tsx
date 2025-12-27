
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Send, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

export default function GeradorLinkWhatsappPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const { toast } = useToast();

  const handleGenerateLink = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Número Inválido',
        description: 'Por favor, digite um número de telefone válido (incluindo DDD).',
      });
      setGeneratedLink('');
      return;
    }
    const encodedMessage = encodeURIComponent(message.trim());
    const link = `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
    setGeneratedLink(link);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        toast({ title: 'Link Copiado!', description: 'O link do WhatsApp foi copiado para a área de transferência.' });
      })
      .catch(err => {
        toast({ variant: 'destructive', title: 'Erro ao Copiar', description: 'Não foi possível copiar o link.' });
        console.error('Erro ao copiar link do WhatsApp:', err);
      });
  };

  const handleClearFields = () => {
    setPhone('');
    setMessage('');
    setGeneratedLink('');
    toast({ title: 'Campos Limpos', description: 'Pronto para gerar um novo link.' });
  };
  
  const suggestedTools = [
    { title: "Gerador de QR Code", Icon: Send, href: "/ferramentas/gerador-qr-code", description: "Transforme links e textos em QR Codes." },
    { title: "Gerador de Link Pix", Icon: Send, href: "/ferramentas/gerador-pix", description: "Crie Pix Copia e Cola facilmente."}
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
            <Send className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de Link WhatsApp</CardTitle>
          </div>
          <CardDescription>Crie links diretos para conversas no WhatsApp com mensagens personalizadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGenerateLink(); }}>
            <div>
              <Label htmlFor="phone">Número de Telefone (com DDD)</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Ex: 5541999998888" 
                className="rounded-lg mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="message">Mensagem (Opcional)</Label>
              <Textarea 
                id="message" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva a mensagem que será preenchida automaticamente..." 
                className="rounded-lg mt-1 min-h-[100px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <Button type="button" variant="outline" onClick={handleClearFields} className="w-full sm:w-auto rounded-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Limpar Campos
              </Button>
              <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                <Send className="mr-2 h-5 w-5" /> Gerar Link
              </Button>
            </div>
          </form>

          {generatedLink && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-2">Link Gerado:</h3>
              <Card className="rounded-lg bg-muted/20">
                <CardContent className="p-4 break-all">
                  <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm block">
                    {generatedLink}
                  </a>
                  <Button onClick={handleCopyLink} className="w-full mt-4 rounded-full">
                    <Copy className="mr-2 h-4 w-4" /> Copiar Link
                  </Button>
                  <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="w-full inline-block mt-2">
                    <Button variant="outline" className="w-full rounded-full border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700">
                      <ExternalLink className="mr-2 h-4 w-4" /> Abrir no WhatsApp
                    </Button>
                  </a>
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
    


'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, QrCode, Download, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function GeradorQrCodePage() {
  const [textInput, setTextInput] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerateQrCode = () => {
    if (textInput.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Entrada Vazia',
        description: 'Por favor, digite algo para gerar o QR Code.',
      });
      setQrCodeValue('');
      return;
    }
    setQrCodeValue(textInput.trim());
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeValue || !qrCanvasRef.current) {
      toast({
        variant: 'destructive',
        title: 'QR Code Não Gerado',
        description: 'Gere o QR Code primeiro para poder baixá-lo.',
      });
      return;
    }
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = "qrcode_grupobr277.png";
      link.click();
      toast({ title: 'Download Iniciado', description: 'O QR Code está sendo baixado.' });
    } else {
       toast({ variant: 'destructive', title: 'Erro no Download', description: 'Não foi possível encontrar o canvas do QR Code.' });
    }
  };
  
  const handleClearFields = () => {
    setTextInput('');
    setQrCodeValue('');
    toast({ title: 'Campos Limpos', description: 'Pronto para gerar um novo QR Code.' });
  };

  const suggestedTools = [
    { title: "Gerador de Link WhatsApp", Icon: QrCode, href: "/ferramentas/gerador-link-whatsapp", description: "Crie links diretos para WhatsApp." },
    { title: "Scanner de Documentos", Icon: QrCode, href: "/ferramentas/scanner", description: "Digitalize documentos com sua câmera."}
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
            <QrCode className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gerador de QR Code</CardTitle>
          </div>
          <CardDescription>Crie QR Codes a partir de links ou textos facilmente.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleGenerateQrCode(); }}>
            <div>
              <Label htmlFor="text-input">Texto ou Link para o QR Code</Label>
              <Input 
                id="text-input" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Digite ou cole aqui..." 
                className="rounded-lg mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-3">
               <Button type="button" variant="outline" onClick={handleClearFields} className="w-full sm:w-auto rounded-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Limpar
              </Button>
              <Button type="submit" className="w-full sm:flex-1 rounded-full py-3 text-base">
                <QrCode className="mr-2 h-5 w-5" /> Gerar QR Code
              </Button>
            </div>
          </form>

          {qrCodeValue && (
            <div className="mt-8 pt-6 border-t text-center">
              <h3 className="text-lg font-semibold mb-4">QR Code Gerado:</h3>
              <div 
                ref={qrCanvasRef} 
                className="flex justify-center items-center p-4 bg-card rounded-lg border shadow-inner mx-auto max-w-[250px]"
              >
                <QRCodeCanvas
                  value={qrCodeValue}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#002776"}
                  level={"H"}
                  includeMargin={true}
                />
              </div>
              <Button onClick={handleDownloadQrCode} className="w-full max-w-xs mx-auto mt-6 rounded-full">
                <Download className="mr-2 h-4 w-4" /> Baixar QR Code (PNG)
              </Button>
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

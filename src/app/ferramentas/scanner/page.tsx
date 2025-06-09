
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Camera, Download, Send, Image as ImageIcon, RefreshCcw, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-20 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("normal");
  const [showActions, setShowActions] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Autoplay é importante, e pode precisar ser explícito
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => console.error("Erro ao dar play no vídeo:", e));
            };
          }
          setHasCameraPermission(true);
          setStreamActive(true);
        } catch (error) {
          console.error('Erro ao acessar a câmera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Erro ao Acessar Câmera',
            description: 'Não foi possível acessar a câmera. Verifique as permissões.',
          });
        }
      } else {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Câmera Não Suportada',
            description: 'Seu navegador não suporta acesso à câmera.',
        });
      }
    };

    if (!previewSrc) { // Só pede permissão se não tiver um preview (evita repedir ao voltar de um preview)
        getCameraPermission();
    }

    return () => {
      // Parar o stream quando o componente for desmontado ou o preview for mostrado
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setStreamActive(false);
      }
    };
  }, [previewSrc, toast]);


  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        toast({ variant: 'destructive', title: 'Erro no Canvas', description: 'Não foi possível obter o contexto do canvas.' });
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (selectedFilter === "pb") {
        context.filter = 'grayscale(100%) contrast(1.4) brightness(1.1)';
      } else {
        context.filter = 'none';
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      setPreviewSrc(dataURL);
      setShowActions(true);
      
      // Parar o stream da câmera após tirar a foto
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setStreamActive(false);
      }
    }
  };

  const baixarImagem = () => {
    if (previewSrc) {
      const link = document.createElement('a');
      link.download = 'documento-escaneado.png';
      link.href = previewSrc;
      link.click();
      toast({ title: 'Download Iniciado', description: 'A imagem está sendo baixada.' });
    }
  };

  const enviarWhatsApp = () => {
    if (previewSrc) {
      try {
        const blob = dataURItoBlob(previewSrc);
        const file = new File([blob], "documento-escaneado.png", { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'Documento Escaneado',
                text: 'Confira este documento escaneado:',
            })
            .then(() => toast({ title: 'Compartilhado!', description: 'Documento compartilhado com sucesso.'}))
            .catch((error) => {
                if (error.name !== 'AbortError') { // Ignora erro se o usuário cancelar o compartilhamento
                    console.error('Erro ao compartilhar:', error);
                    toast({ variant: 'destructive', title: 'Erro ao Compartilhar', description: 'Não foi possível compartilhar o documento.' });
                }
            });
        } else {
            // Fallback para o método antigo (menos confiável) ou instrução para baixar
            toast({ variant: 'default', title: 'Compartilhamento Nativo Indisponível', description: 'Baixe a imagem e compartilhe manualmente no WhatsApp.' });
            // O código original com window.open(`https://wa.me/?text=...`) é problemático para imagens.
        }
      } catch (error) {
        console.error('Erro ao preparar para WhatsApp:', error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível preparar a imagem para o WhatsApp.' });
      }
    }
  };
  
  const retakePhoto = () => {
    setPreviewSrc(null);
    setShowActions(false);
    setSelectedFilter("normal");
    // O useEffect cuidará de reativar a câmera
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
            <Camera className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Scanner de Documentos</CardTitle>
          </div>
          <CardDescription>Capture imagens de documentos de forma rápida.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acesso à Câmera Negado</AlertTitle>
              <ShadcnAlertDescription>
                Para usar o scanner, por favor, habilite a permissão de acesso à câmera nas configurações do seu navegador e recarregue a página.
              </ShadcnAlertDescription>
            </Alert>
          )}
          
          {hasCameraPermission === null && ( // Estado inicial, carregando
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Solicitando acesso à câmera...</p>
            </div>
          )}

          {hasCameraPermission && (
            <div className="space-y-4">
              {!previewSrc ? (
                <>
                  <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden border">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    {!streamActive && hasCameraPermission && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <p className="text-white text-lg">Ativando câmera...</p>
                        </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <Label htmlFor="filtro">Filtro</Label>
                        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                            <SelectTrigger id="filtro" className="w-full rounded-lg mt-1">
                            <SelectValue placeholder="Escolha um filtro..." />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="pb">Preto e Branco</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={tirarFoto} className="w-full sm:w-auto py-3 text-base rounded-full" disabled={!streamActive}>
                      <Camera className="mr-2 h-5 w-5" />
                      Tirar Foto
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-full aspect-[4/3] border rounded-lg overflow-hidden">
                    <img src={previewSrc} alt="Preview do documento escaneado" className="w-full h-full object-contain" />
                  </div>
                  <CardDescription className="text-center">Foto capturada! Escolha uma ação abaixo.</CardDescription>
                  <AdPlaceholder />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    <Button onClick={baixarImagem} variant="outline" className="rounded-full">
                      <Download className="mr-2 h-4 w-4" /> Baixar
                    </Button>
                    <Button onClick={enviarWhatsApp} variant="outline" className="rounded-full">
                      <Send className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                     <Button onClick={retakePhoto} className="lg:col-span-1 sm:col-span-2 rounded-full">
                      <RefreshCcw className="mr-2 h-4 w-4" /> Nova Foto
                    </Button>
                  </div>
                </>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="rounded-xl mt-6">
          <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary"/> Dicas para Escanear</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• Posicione o documento em uma superfície plana e bem iluminada.</p>
              <p>• Evite sombras sobre o documento.</p>
              <p>• Mantenha a câmera estável para melhor qualidade.</p>
              <p>• O filtro "Preto e Branco" pode melhorar a legibilidade de textos.</p>
          </CardContent>
      </Card>
    </div>
  );
}

    
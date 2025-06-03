
'use client';

import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import type { StreamCardProps } from './stream-card'; // Ajuste o caminho se necessário

interface StreamViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: StreamCardProps | null;
}

export default function StreamViewerModal({ isOpen, onClose, stream }: StreamViewerModalProps) {
  if (!isOpen || !stream) return null;

  const canEmbed = (url: string) => {
    // Simples verificação, pode ser expandida
    // rtsp.me e giseleimoveis podem ser iframable. fullcam.me geralmente não.
    // playerv.logicahost.com.br pode funcionar se a URL for a de embed direto.
    const nonEmbeddableHosts = ['cloud.fullcam.me'];
    try {
      const hostname = new URL(url).hostname;
      return !nonEmbeddableHosts.some(host => hostname.includes(host));
    } catch (e) {
      return false; // URL inválida não pode ser embedada
    }
  };

  const embeddable = canEmbed(stream.streamUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-start bg-black/95 p-0 data-[state=open]:animate-none data-[state=closed]:animate-none rounded-none border-none max-w-none overflow-hidden">
        <div className="absolute top-4 right-4 z-20">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>

        {/* Espaço Publicitário do Patrocinador */}
        <div className="w-full h-[60px] bg-slate-700/80 flex items-center justify-center text-white text-sm shrink-0 z-10 border-b border-slate-600">
          <p className="text-xs text-muted-foreground mr-2">Patrocinado por:</p>
          <div 
            className="h-[40px] w-[150px] bg-slate-500 flex items-center justify-center text-slate-300 rounded"
            data-ai-hint="sponsor logo placeholder"
          >
            Logo Patrocinador
          </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center w-full h-[calc(100%-120px-60px)] pt-2 pb-2 px-4"> {/* 120px AdMob + 60px Patrocinador */}
          {embeddable ? (
            <iframe
              src={stream.streamUrl}
              title={`Transmissão ao vivo: ${stream.title}`}
              className="w-full h-full border-0 rounded-md"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation" // Adicionado sandbox
            ></iframe>
          ) : (
            <div className="text-center text-white p-8 bg-slate-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{stream.title}</h3>
              <p className="text-sm mb-4">Esta transmissão não pode ser incorporada diretamente.</p>
              <Button 
                onClick={() => window.open(stream.streamUrl, '_blank')}
                variant="outline" 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ExternalLink className="mr-2 h-4 w-4"/>
                Abrir em nova janela
              </Button>
            </div>
          )}
        </div>

        {/* Espaço para Banner AdMob */}
        <div className="w-full h-[100px] bg-neutral-800/80 flex flex-col items-center justify-center text-white text-xs shrink-0 border-t border-neutral-700 z-10">
          <p className="mb-1 text-muted-foreground">Publicidade</p>
          <div 
            className="w-[320px] h-[50px] bg-neutral-500 flex items-center justify-center text-neutral-300 rounded"
            data-ai-hint="advertisement banner"
          >
            Bloco de Anúncio AdMob (320x50)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

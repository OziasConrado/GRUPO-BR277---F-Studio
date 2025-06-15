
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Flag } from 'lucide-react';
import type { StoryCircleProps } from './StoryCircle';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as RadixAlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryCircleProps | null;
}

const reportReasonsStory = [
  { id: "story_spam", label: "Spam ou irrelevante." },
  { id: "story_hate", label: "Discurso de ódio ou bullying." },
  { id: "story_nudity", label: "Nudez ou conteúdo sexual." },
  { id: "story_violence", label: "Violência ou conteúdo perigoso." },
  { id: "story_impersonation", label: "Falsidade ideológica." },
  { id: "story_other", label: "Outro motivo..." },
];

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  const { toast } = useToast();
  const [storyReactions, setStoryReactions] = useState({ thumbsUp: 0, thumbsDown: 0 });
  const [currentUserStoryReaction, setCurrentUserStoryReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);

  const [isReportModalOpenStory, setIsReportModalOpenStory] = useState(false);
  const [selectedReportReasonStory, setSelectedReportReasonStory] = useState<string | undefined>(undefined);
  const [otherReportReasonTextStory, setOtherReportReasonTextStory] = useState('');

  useEffect(() => {
    if (isOpen && story) {
      // Mock initial reactions for demonstration
      setStoryReactions({ 
        thumbsUp: Math.floor(Math.random() * 50) + (story.storyType === 'video' ? 10 : 0), 
        thumbsDown: Math.floor(Math.random() * 5) 
      });
      setCurrentUserStoryReaction(null);
      // In a real app, you would fetch reactions for story.id
    }
  }, [isOpen, story]);

  if (!isOpen || !story) return null;

  const handleStoryReactionClick = (reactionType: 'thumbsUp' | 'thumbsDown') => {
    setStoryReactions(prevReactions => {
      const newReactions = { ...prevReactions };
      if (currentUserStoryReaction === reactionType) {
        newReactions[reactionType]--;
        setCurrentUserStoryReaction(null);
      } else {
        if (currentUserStoryReaction) {
          newReactions[currentUserStoryReaction]--;
        }
        newReactions[reactionType]++;
        setCurrentUserStoryReaction(reactionType);
      }
      return newReactions;
    });
    // console.log(`Story ${story.id} reaction: ${reactionType}`);
  };

  const handleCommentClick = () => {
    toast({
      title: "Comentários para Reels",
      description: "Funcionalidade de comentários para Reels em breve!",
    });
  };

  const handleShareClick = () => {
    if (navigator.share && story.videoContentUrl) {
      navigator.share({
        title: `Confira este Reel: ${story.adminName}`,
        text: `Assista ao Reel "${story.adminName}" no Rota Segura!`,
        url: window.location.href, // Placeholder URL
      }).then(() => {
        toast({ title: "Reel compartilhado!", description: "Conteúdo enviado com sucesso." });
      }).catch((error) => {
        if (error.name !== 'AbortError') { // User didn't cancel share
          toast({ variant: "destructive", title: "Erro ao compartilhar", description: "Não foi possível compartilhar o Reel neste momento." });
        }
      });
    } else {
      toast({
        title: "Compartilhar Reel",
        description: "Funcionalidade de compartilhamento em breve ou use o compartilhamento nativo do seu dispositivo.",
      });
    }
  };
  
  const handleReportStorySubmit = () => {
    if (!selectedReportReasonStory) {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione um motivo para a denúncia." });
        return;
    }
    if (selectedReportReasonStory === "story_other" && !otherReportReasonTextStory.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, especifique o motivo em 'Outro'." });
        return;
    }
    const reasonLabel = reportReasonsStory.find(r => r.id === selectedReportReasonStory)?.label;
    const reportDetails = selectedReportReasonStory === "story_other" ? otherReportReasonTextStory : reasonLabel;
    toast({ title: "Denúncia Enviada", description: `Reel "${story.adminName}" denunciado. Motivo: ${reportDetails}` });
    setIsReportModalOpenStory(false);
    setSelectedReportReasonStory(undefined);
    setOtherReportReasonTextStory('');
  };

  const AdMobSpace = () => (
    <div className="shrink-0 h-[100px] bg-secondary/20 flex items-center justify-center text-sm text-secondary-foreground">
      Banner AdMob (320x50 ou similar)
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/90 !p-0 flex flex-col !translate-x-0 !translate-y-0"
          onEscapeKeyDown={onClose}
        >
          <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-between items-center bg-black/30 !z-[210] backdrop-blur-sm">
            <DialogTitle className="text-white text-base font-semibold truncate flex-grow pl-2">
              {story.adminName}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
                <X className="h-5 w-5 sm:h-6 sm:h-6" />
              </Button>
            </DialogClose>
          </DialogHeader>
          
          <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden relative">
            <div className="relative w-full h-full max-w-md max-h-full mx-auto">
              {story.storyType === 'video' && story.videoContentUrl ? (
                <video
                  src={story.videoContentUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                  data-ai-hint={story.dataAIAvatarHint || "user uploaded video"}
                />
              ) : (
                <Image
                  src={story.avatarUrl} 
                  alt={`Story de ${story.adminName}`}
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint={story.dataAIAvatarHint || "story content"}
                />
              )}
            </div>

            {/* Vertical Reaction Bar */}
            <div className="absolute right-2 sm:right-4 bottom-[110px] sm:bottom-1/2 sm:translate-y-1/2 z-[220] flex flex-col items-center space-y-2 bg-black/25 p-2 rounded-full backdrop-blur-sm">
              <Button 
                variant="ghost" 
                onClick={() => handleStoryReactionClick('thumbsUp')} 
                className="text-white hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Curtir"
              >
                <ThumbsUp size={26} className={cn(currentUserStoryReaction === 'thumbsUp' ? 'fill-white' : 'fill-transparent')} />
                <span className="text-xs mt-0.5">{storyReactions.thumbsUp > 0 ? storyReactions.thumbsUp : ''}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleStoryReactionClick('thumbsDown')} 
                className="text-white hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Não curtir"
              >
                <ThumbsDown size={26} className={cn(currentUserStoryReaction === 'thumbsDown' ? 'fill-white' : 'fill-transparent')} />
                 <span className="text-xs mt-0.5">{storyReactions.thumbsDown > 0 ? storyReactions.thumbsDown : ''}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleCommentClick} 
                className="text-white hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Comentários"
              >
                <MessageSquare size={26} />
                {/* <span className="text-xs mt-0.5">0</span> */}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleShareClick} 
                className="text-white hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Compartilhar"
              >
                <Share2 size={26} />
                {/* <span className="text-xs mt-0.5">Share</span> */}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                    aria-label="Mais opções"
                  >
                    <MoreVertical size={26} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="left" className="bg-background/80 backdrop-blur-md border-slate-700/50 text-foreground">
                  <DropdownMenuItem onClick={() => setIsReportModalOpenStory(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Reportar Reel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <AdMobSpace />
        </DialogContent>
      </Dialog>

      {/* Report Story Modal */}
      <AlertDialog open={isReportModalOpenStory} onOpenChange={setIsReportModalOpenStory}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <RadixAlertDialogTitle>Reportar Reel</RadixAlertDialogTitle>
            <AlertDialogDescription>
              Por favor, selecione o motivo da sua denúncia para o Reel "{story.adminName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <RadioGroup value={selectedReportReasonStory} onValueChange={setSelectedReportReasonStory} className="space-y-2 my-4">
            {reportReasonsStory.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={`story-report-${reason.id}`} />
                <Label htmlFor={`story-report-${reason.id}`} className="font-normal">{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedReportReasonStory === 'story_other' && (
            <Textarea
              placeholder="Por favor, descreva o motivo da denúncia..."
              value={otherReportReasonTextStory}
              onChange={(e) => setOtherReportReasonTextStory(e.target.value)}
              className="min-h-[80px]"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSelectedReportReasonStory(undefined); setOtherReportReasonTextStory(''); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReportStorySubmit}>Enviar Denúncia</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


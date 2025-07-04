
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Flag, Send } from 'lucide-react';
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
  AlertDialogDescription as RadixAlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as RadixAlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/client';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  runTransaction,
  increment,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface CommentProps {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  timestamp: string;
  text: string;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryCircleProps | null;
}

// Report Reasons
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
  const { currentUser } = useAuth();
  
  // State for reactions, comments, and modals
  const [storyReactions, setStoryReactions] = useState({ thumbsUp: 0, thumbsDown: 0 });
  const [currentUserStoryReaction, setCurrentUserStoryReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  
  const [isReportModalOpenStory, setIsReportModalOpenStory] = useState(false);
  const [selectedReportReasonStory, setSelectedReportReasonStory] = useState<string | undefined>(undefined);
  const [otherReportReasonTextStory, setOtherReportReasonTextStory] = useState('');

  // Effect to fetch real-time data for the story
  useEffect(() => {
    if (!isOpen || !story || !firestore) return;

    // Fetch reactions and user's vote
    const storyRef = doc(firestore, 'reels', story.id);
    const unsubReactions = onSnapshot(storyRef, (doc) => {
      const data = doc.data();
      setStoryReactions(data?.reactions || { thumbsUp: 0, thumbsDown: 0 });
    });

    let unsubUserReaction: () => void = () => {};
    if (currentUser) {
      const reactionRef = doc(firestore, 'reels', story.id, 'userReactions', currentUser.uid);
      unsubUserReaction = onSnapshot(reactionRef, (doc) => {
        setCurrentUserStoryReaction(doc.exists() ? doc.data().type : null);
      });
    }

    // Fetch comments
    const commentsQuery = query(collection(firestore, 'reels', story.id, 'comments'), orderBy('timestamp', 'desc'));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatarUrl: data.userAvatarUrl,
          text: data.text,
          timestamp: data.timestamp ? formatDistanceToNow(data.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : 'Agora',
        } as CommentProps;
      });
      setComments(fetchedComments);
    });

    return () => {
      unsubReactions();
      unsubUserReaction();
      unsubComments();
    };
  }, [isOpen, story, currentUser]);


  const handleStoryReactionClick = async (reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (!currentUser || !firestore || !story) {
        toast({ variant: 'destructive', title: 'Você precisa estar logado para reagir.' });
        return;
    }
    const storyRef = doc(firestore, 'reels', story.id);
    const reactionRef = doc(firestore, 'reels', story.id, 'userReactions', currentUser.uid);

    try {
      await runTransaction(firestore, async (transaction) => {
        const storyDoc = await transaction.get(storyRef);
        if (!storyDoc.exists()) {
            throw new Error("Este Reel não existe mais.");
        }
        
        const reactionDoc = await transaction.get(reactionRef);
        const storedReaction = reactionDoc.exists() ? reactionDoc.data().type : null;

        const newReactions = storyDoc.data().reactions || { thumbsUp: 0, thumbsDown: 0 };

        if (storedReaction === reactionType) {
            // User is un-reacting
            newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
            transaction.delete(reactionRef);
        } else {
            // User is adding a new reaction or changing their reaction
            if (storedReaction) {
                newReactions[storedReaction] = Math.max(0, (newReactions[storedReaction] || 0) - 1);
            }
            newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
            transaction.set(reactionRef, { type: reactionType, timestamp: serverTimestamp() });
        }

        transaction.update(storyRef, { reactions: newReactions });
      });
      setCurrentUserStoryReaction(prev => prev === reactionType ? null : reactionType);
    } catch (error: any) {
      console.error("Error handling story reaction:", error);
      toast({ variant: 'destructive', title: 'Erro ao Reagir', description: error.message || 'Não foi possível processar sua reação.' });
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !firestore || !story) return;

    try {
      await addDoc(collection(firestore, 'reels', story.id, 'comments'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatarUrl: currentUser.photoURL,
        text: newComment.trim(),
        timestamp: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível postar o comentário.' });
    }
  };


  const handleShareClick = () => {
    if (navigator.share && story?.videoContentUrl) {
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

  if (!isOpen || !story) return null;


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
            <DialogDescription className="sr-only">Visualizador de story de {story.adminName}.</DialogDescription>
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
                  autoPlay
                  loop
                  playsInline
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

            <div className="absolute right-2 sm:right-4 bottom-[110px] sm:bottom-1/2 sm:translate-y-1/2 z-[220] flex flex-col items-center space-y-2 bg-black/25 p-2 rounded-full">
              <Button 
                variant="ghost" 
                onClick={() => handleStoryReactionClick('thumbsUp')} 
                className="text-white hover:bg-white/10 hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Curtir"
              >
                <ThumbsUp size={26} className={cn(currentUserStoryReaction === 'thumbsUp' ? 'fill-white' : 'fill-transparent')} />
                <span className="text-xs mt-0.5">{storyReactions.thumbsUp > 0 ? storyReactions.thumbsUp : ''}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleStoryReactionClick('thumbsDown')} 
                className="text-white hover:bg-white/10 hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Não curtir"
              >
                <ThumbsDown size={26} className={cn(currentUserStoryReaction === 'thumbsDown' ? 'fill-white' : 'fill-transparent')} />
                 <span className="text-xs mt-0.5">{storyReactions.thumbsDown > 0 ? storyReactions.thumbsDown : ''}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsCommentSheetOpen(true)} 
                className="text-white hover:bg-white/10 hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Comentários"
              >
                <MessageSquare size={26} />
                <span className="text-xs mt-0.5">{comments.length > 0 ? comments.length : ''}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleShareClick} 
                className="text-white hover:bg-white/10 hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                aria-label="Compartilhar"
              >
                <Share2 size={26} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 hover:text-white/90 p-1.5 h-auto w-auto flex flex-col items-center"
                    aria-label="Mais opções"
                  >
                    <MoreVertical size={26} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="left" className="bg-background/80 backdrop-blur-md border-slate-700/50 text-foreground">
                  <DropdownMenuItem onClick={() => setIsReportModalOpenStory(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
      
      <Sheet open={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
          <SheetHeader className="p-3 border-b text-center">
            <SheetTitle>Comentários sobre o Reel</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    {comment.userAvatarUrl && <AvatarImage src={comment.userAvatarUrl} alt={comment.userName} />}
                    <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{comment.userName}</p>
                      <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center pt-8">Nenhum comentário ainda.</p>
            )}
          </div>
          <div className="p-3 border-t bg-card sticky bottom-0">
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="rounded-lg bg-muted min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button type="submit" size="icon" className="rounded-full" disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isReportModalOpenStory} onOpenChange={setIsReportModalOpenStory}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <RadixAlertDialogTitle>Reportar Reel</RadixAlertDialogTitle>
            <RadixAlertDialogDescription>
              Por favor, selecione o motivo da sua denúncia para o Reel "{story.adminName}".
            </RadixAlertDialogDescription>
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

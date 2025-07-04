
'use client';

import React, { useState, useEffect, useRef, type ChangeEvent, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Flag, Send, Loader2, UserCircle } from 'lucide-react';
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
  where,
  limit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';

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

async function createMentions(text: string, postId: string, fromUser: { uid: string, displayName: string | null, photoURL: string | null }, type: 'mention_comment') {
    if (!firestore) return;

    const foundUsers = new Map<string, { id: string }>();
    const processedIndices = new Set<number>();
    const matches = [...text.matchAll(/@/g)];

    for (const match of matches) {
        const atIndex = match.index!;
        if (processedIndices.has(atIndex)) continue;

        const queryableText = text.substring(atIndex + 1);
        const firstWordMatch = queryableText.match(/^([\p{L}\p{N}._'-]+)/u);
        if (!firstWordMatch) continue;
        
        const firstWord = firstWordMatch[1];
        
        const usersRef = collection(firestore, "Usuarios");
        const q = query(
            usersRef,
            where("displayName_lowercase", ">=", firstWord.toLowerCase()),
            where("displayName_lowercase", "<=", firstWord.toLowerCase() + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) continue;
        
        let longestMatchUser: { id: string; displayName: string } | null = null;
        
        querySnapshot.forEach(userDoc => {
            const displayName = userDoc.data().displayName;
            if (queryableText.toLowerCase().startsWith(displayName.toLowerCase())) {
                const nextChar = text[atIndex + 1 + displayName.length];
                if (nextChar === undefined || !/[\p{L}\p{N}]/u.test(nextChar)) {
                    if (!longestMatchUser || displayName.length > longestMatchUser.displayName.length) {
                        longestMatchUser = { id: userDoc.id, displayName };
                    }
                }
            }
        });

        if (longestMatchUser) {
            if (longestMatchUser.id !== fromUser.uid) {
                foundUsers.set(longestMatchUser.displayName, { id: longestMatchUser.id });
            }
            // Mark all indices within the matched name as processed to avoid sub-matches
            for (let i = 0; i < longestMatchUser.displayName.length + 1; i++) {
                processedIndices.add(atIndex + i);
            }
        }
    }

    if (foundUsers.size === 0) return;

    const batch = writeBatch(firestore);
    for (const user of foundUsers.values()) {
        const notificationRef = doc(collection(firestore, 'Usuarios', user.id, 'notifications'));
        batch.set(notificationRef, {
            type: type,
            fromUserId: fromUser.uid,
            fromUserName: fromUser.displayName || "Usuário",
            fromUserAvatar: fromUser.photoURL || null,
            postId: postId,
            textSnippet: text.substring(0, 70) + (text.length > 70 ? '...' : ''),
            timestamp: serverTimestamp(),
            read: false,
        });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error committing mention notifications batch:", error);
    }
}


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

  // State for mentions
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [loadingMentions, setLoadingMentions] = useState(false);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // User Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

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
  
  useEffect(() => {
    if (showMentions && mentionQuery.length > 0 && firestore) {
      setLoadingMentions(true);
      const fetchUsers = async () => {
        const usersRef = collection(firestore, "Usuarios");
        const q = query(
          usersRef,
          where("displayName_lowercase", ">=", mentionQuery.toLowerCase()),
          where("displayName_lowercase", "<=", mentionQuery.toLowerCase() + '\uf8ff'),
          limit(5)
        );
        try {
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map(doc => doc.data().displayName as string);
          setMentionSuggestions(users.filter(name => name));
        } catch (error) {
          console.error("Error fetching mention suggestions:", error);
          setMentionSuggestions([]);
        } finally {
          setLoadingMentions(false);
        }
      };
      
      const timeoutId = setTimeout(fetchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionQuery, showMentions]);


  const handleStoryReactionClick = async (reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (!currentUser || !firestore || !story) {
        toast({ variant: 'destructive', title: 'Você precisa estar logado para reagir.' });
        return;
    }
    const storyRef = doc(firestore, 'reels', story.id);
    const reactionRef = doc(firestore, 'reels', story.id, 'userReactions', currentUser.uid);

    try {
        await runTransaction(firestore, async (transaction) => {
            const reactionDoc = await transaction.get(reactionRef);
            const storedReaction = reactionDoc.exists() ? reactionDoc.data().type : null;

            if (storedReaction === reactionType) {
                transaction.update(storyRef, { [`reactions.${reactionType}`]: increment(-1) });
                transaction.delete(reactionRef);
            } else {
                if (storedReaction) {
                    transaction.update(storyRef, { [`reactions.${storedReaction}`]: increment(-1) });
                }
                transaction.update(storyRef, { [`reactions.${reactionType}`]: increment(1) });
                transaction.set(reactionRef, { type: reactionType, timestamp: serverTimestamp() });
            }
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
      const commentText = newComment.trim();
      await addDoc(collection(firestore, 'reels', story.id, 'comments'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatarUrl: currentUser.photoURL,
        text: commentText,
        timestamp: serverTimestamp(),
      });

      await createMentions(commentText, story.id, { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL }, 'mention_comment');

      setNewComment('');
      setShowMentions(false);
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível postar o comentário.' });
    }
  };


  const handleShareClick = () => {
    if (navigator.share && story?.videoContentUrl) {
      navigator.share({
        title: `Confira este Reel: ${story.authorName}`,
        text: `Assista ao Reel "${story.authorName}" no Rota Segura!`,
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
    toast({ title: "Denúncia Enviada", description: `Reel "${story.authorName}" denunciado. Motivo: ${reportDetails}` });
    setIsReportModalOpenStory(false);
    setSelectedReportReasonStory(undefined);
    setOtherReportReasonTextStory('');
  };

  const handleCommentInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const value = textarea.value;
    setNewComment(value);
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const currentWord = textBeforeCursor.split(/\s+/).pop() || '';
    
    if (currentWord.startsWith('@')) {
        setMentionQuery(currentWord.substring(1));
        setShowMentions(true);
    } else {
        setShowMentions(false);
    }
  };

  const handleMentionClick = (name: string) => {
    const textarea = commentTextareaRef.current;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const prefix = value.substring(0, lastAtPos);
      const suffix = value.substring(cursorPos);
      const newText = `${prefix}@${name} ${suffix}`;
      setNewComment(newText);
      setShowMentions(false);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = prefix.length + name.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleShowUserProfile = useCallback(async () => {
    if (!story?.authorId) return;
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de banco de dados indisponível.' });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'Usuarios', story.authorId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedUserProfile({
          id: userDoc.id,
          name: userData.displayName || 'Usuário',
          avatarUrl: userData.photoURL,
          location: userData.location,
          bio: userData.bio,
          instagramUsername: userData.instagramUsername,
        });
      } else {
        setSelectedUserProfile({
          id: story.authorId,
          name: story.authorName || 'Usuário',
          avatarUrl: story.authorAvatarUrl,
        });
      }
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o perfil do usuário.' });
    }
  }, [story, toast]);

  const formattedTimestamp = useMemo(() => {
    if (!story?.timestamp) return '';
    return formatDistanceToNow(new Date(story.timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '');
  }, [story?.timestamp]);

  if (!isOpen || !story) return null;

  const description = story.description || '';
  const needsTruncation = description.length > 80;


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
          <DialogHeader className="absolute top-0 left-0 right-0 shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-gradient-to-b from-black/50 to-transparent !z-[210]">
            <DialogTitle className="sr-only">
              Visualizador de Reel: {story.authorName}
            </DialogTitle>
            <DialogDescription className="sr-only">Reel de {story.authorName}.</DialogDescription>
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
                  data-ai-hint={story.dataAIThumbnailHint || "user uploaded video"}
                />
              ) : (
                <Image
                  src={story.thumbnailUrl} 
                  alt={`Story de ${story.authorName}`}
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint={story.dataAIThumbnailHint || "story content"}
                />
              )}
            </div>

            {/* Description Overlay */}
            <div 
              className={cn(
                "absolute bottom-[100px] left-0 right-0 z-[215] p-3 text-white transition-all duration-300 ease-in-out",
                isDescriptionExpanded 
                  ? "bg-black/60 backdrop-blur-sm max-h-[70vh] overflow-y-auto rounded-t-lg" 
                  : "bg-gradient-to-t from-black/70 to-transparent max-h-[40vh] pointer-events-none"
              )}
            >
              <div className="pointer-events-auto max-w-md mx-auto pr-14 sm:pr-16">
                  <button
                    onClick={handleShowUserProfile} 
                    className="flex items-center gap-2 mb-2 text-left hover:opacity-80 transition-opacity"
                    aria-label={`Ver perfil de ${story.authorName}`}
                  >
                    <Avatar className="h-9 w-9 border-2 border-white/50">
                        {story.authorAvatarUrl && <AvatarImage src={story.authorAvatarUrl as string} alt={story.authorName} />}
                        <AvatarFallback>{story.authorName.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-base font-semibold truncate">{story.authorName}</p>
                        <p className="text-xs text-white/70 truncate">{formattedTimestamp}</p>
                    </div>
                  </button>

                  {description && (
                    <div className="text-sm" onClick={() => !isDescriptionExpanded && needsTruncation && setIsDescriptionExpanded(true)}>
                      <p className={cn("whitespace-pre-wrap", !isDescriptionExpanded && "line-clamp-2")}>
                          {description}
                      </p>
                      {needsTruncation && !isDescriptionExpanded && (
                          <button onClick={() => setIsDescriptionExpanded(true)} className="text-sm font-bold mt-1 hover:underline text-white/80">
                              ...mais
                          </button>
                      )}
                      {isDescriptionExpanded && (
                          <button onClick={() => setIsDescriptionExpanded(false)} className="text-sm font-bold mt-2 hover:underline text-white/80">
                              Ver menos
                          </button>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <div className="absolute right-2 sm:right-4 bottom-[120px] sm:bottom-1/2 sm:translate-y-1/2 z-[220] flex flex-col items-center space-y-2 bg-black/25 p-2 rounded-full">
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
          <div className="p-3 border-t bg-card sticky bottom-0 space-y-2">
            {showMentions && (
              <div className="max-h-32 overflow-y-auto border-b bg-background p-2 text-sm">
                {loadingMentions ? (
                  <div className="p-2 text-center text-muted-foreground">Buscando...</div>
                ) : mentionSuggestions.length > 0 ? (
                  mentionSuggestions.map(name => (
                    <button 
                      key={name}
                      onClick={() => handleMentionClick(name)}
                      className="block w-full text-left p-2 rounded-md hover:bg-muted"
                    >
                      {name}
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
                )}
              </div>
            )}
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <Textarea
                ref={commentTextareaRef}
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={handleCommentInputChange}
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
              Por favor, selecione o motivo da sua denúncia para o Reel de "{story.authorName}".
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
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUserProfile}
      />
    </>
  );
}


'use client';

import React, { useState, useEffect, useRef, type ChangeEvent, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Flag, Send, Loader2, UserCircle, Edit3, Trash2 } from 'lucide-react';
import type { StoryData } from './StoryCircle';
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
  updateDoc,
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
  parentCommentId?: string | null;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryData | null;
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

interface MentionUser {
  id: string;
  displayName: string;
}

async function createStoryCommentMentions(
    text: string, 
    storyId: string,
    fromUser: { uid: string, displayName: string | null, photoURL: string | null }
) {
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
        
        let longestMatchUser: MentionUser | null = null;
        
        for (const userDoc of querySnapshot.docs) {
            const userData = userDoc.data();

            if (userData && typeof userData.displayName === 'string') {
                const displayName: string = userData.displayName;

                if (queryableText.toLowerCase().startsWith(displayName.toLowerCase())) {
                    const nextChar = text[atIndex + 1 + displayName.length];
                    const isFullWord = nextChar === undefined || !/[\p{L}\p{N}]/u.test(nextChar);

                    if (isFullWord) {
                        if (!longestMatchUser || displayName.length > longestMatchUser.displayName.length) {
                            longestMatchUser = { id: userDoc.id, displayName: displayName };
                        }
                    }
                }
            }
        }

        if (longestMatchUser) {
            if (longestMatchUser.id !== fromUser.uid) {
                foundUsers.set(longestMatchUser.displayName, { id: longestMatchUser.id });
            }
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
            type: 'mention_story_comment',
            fromUserId: fromUser.uid,
            fromUserName: fromUser.displayName || "Usuário",
            fromUserAvatar: fromUser.photoURL || null,
            postId: storyId,
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

interface ReplyingToInfo {
  userNameToReply: string;
  commentId: string | null;
}

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  // State for reactions, comments, and modals
  const [storyReactions, setStoryReactions] = useState({ thumbsUp: 0, thumbsDown: 0 });
  const [currentUserStoryReaction, setCurrentUserStoryReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [allComments, setAllComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);
  
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

  // New state for edit/delete
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(story?.description || '');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const isAuthor = currentUser?.uid === story?.authorId;


  const handleShowUserProfile = useCallback(async (userIdToShow: string) => {
    if (!firestore) return;
    try {
        const userDoc = await getDoc(doc(firestore, "Usuarios", userIdToShow));
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
            setIsProfileModalOpen(true);
        }
    } catch (error) {
        console.error("Error fetching user profile for modal:", error);
        toast({ variant: "destructive", title: "Erro ao carregar perfil." });
    }
  }, [toast]);


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
    const commentsQuery = query(collection(firestore, 'reels', story.id, 'comments'), orderBy('timestamp', 'asc'));
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
          parentCommentId: data.parentCommentId || null,
        } as CommentProps;
      });
      setAllComments(fetchedComments);
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
        parentCommentId: replyingTo?.commentId || null,
      });

      await createStoryCommentMentions(commentText, story.id, { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL });

      setNewComment('');
      setReplyingTo(null);
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
        text: `Assista ao Reel "${story.authorName}" no GRUPO BR277!`,
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
    if (!story) return;
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
    toast({ title: "Denúncia Enviada", description: `Reel de "${story.authorName}" denunciado. Motivo: ${reportDetails}` });
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

  const handleUpdateReel = async () => {
    if (!story || !isAuthor || !firestore) return;
    if (editedDescription.trim() === (story.description || '').trim()) {
        setIsEditing(false);
        return;
    }

    const storyRef = doc(firestore, 'reels', story.id);
    try {
        await updateDoc(storyRef, {
            description: editedDescription.trim(),
        });
        toast({ title: 'Reel atualizado com sucesso!' });
        setIsEditing(false);
        if (story) story.description = editedDescription.trim(); // Optimistic update
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o Reel.' });
    }
  };

  const handleDeleteReel = async () => {
    if (!story || !isAuthor || !firestore) return;

    const storyRef = doc(firestore, 'reels', story.id);
    try {
        await updateDoc(storyRef, { deleted: true });
        toast({ title: 'Reel excluído!' });
        onClose();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o Reel.' });
    }
    setIsDeleteAlertOpen(false);
  };


  const formattedTimestamp = useMemo(() => {
    if (!story?.timestamp) return '';
    return formatDistanceToNow(new Date(story.timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '');
  }, [story?.timestamp]);

  const CommentItem = ({ comment, allComments, level = 0, onReply }: { comment: CommentProps; allComments: CommentProps[]; level?: number; onReply: (comment: CommentProps) => void; }) => {
    const childComments = allComments.filter(c => c.parentCommentId === comment.id);
    return (
      <div className="relative">
        {level > 0 && <div className="absolute left-4 -top-3 bottom-0 w-0.5 bg-border -z-10" />}
        <div key={comment.id} className="flex items-start" style={{ marginLeft: `${level * 1}rem` }}>
           {level > 0 && <div className="absolute left-4 top-6 w-5 h-0.5 bg-border -z-10" />}
          <button className="flex-shrink-0" onClick={() => handleShowUserProfile(comment.userId)}>
            <Avatar className="h-8 w-8 mt-1">
              {comment.userAvatarUrl && <AvatarImage src={comment.userAvatarUrl} alt={comment.userName} />}
              <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
          <div className="ml-2 flex-grow p-3 rounded-lg bg-muted/60 dark:bg-muted/30">
            <div className="flex items-center justify-between">
              <button className="text-xs font-semibold font-headline hover:underline" onClick={() => handleShowUserProfile(comment.userId)}>{comment.userName}</button>
              <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
            <div className="flex items-center mt-1.5 space-x-0.5">
              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary ml-1" onClick={() => onReply(comment)}>
                Responder
              </Button>
            </div>
          </div>
        </div>
        {childComments.length > 0 && (
          <div className="mt-2">
            {childComments.map(child => <CommentItem key={child.id} comment={child} allComments={allComments} level={level + 1} onReply={onReply} />)}
          </div>
        )}
      </div>
    );
  };
  
  const threadedComments = useMemo(() => {
    const commentMap = new Map(allComments.map(c => [c.id, {...c, children: [] as CommentProps[]}]));
    const rootComments: CommentProps[] = [];

    allComments.forEach(comment => {
      if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
        commentMap.get(comment.parentCommentId)?.children.push(comment as any);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }, [allComments]);
  
  if (!isOpen || !story) return null;

  const description = story.description || '';
  const needsTruncation = description.length > 80;

  const AdMobSpace = () => (
    <div className="h-[100px] w-full flex shrink-0 items-center justify-center bg-white !z-[260]">
        <div className="flex h-[60px] w-full max-w-[320px] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            Publicidade
        </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black !p-0 !translate-x-0 !translate-y-0"
          onEscapeKeyDown={onClose}
        >
          {/* Main container for absolute positioning */}
          <div className="relative w-full h-full">

            {/* Video/Image Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
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

            {/* Header Overlay */}
            <DialogHeader className="absolute top-0 left-0 right-0 shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-gradient-to-b from-black/50 to-transparent !z-[220]">
              <DialogTitle className="sr-only">
                Visualizador de Reel: {story.authorName}
              </DialogTitle>
              <DialogDescription className="sr-only">Reel de {story.authorName}.</DialogDescription>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[220] flex-shrink-0">
                  <X className="h-5 w-5 sm:h-6 sm:h-6" />
                </Button>
              </DialogClose>
            </DialogHeader>

            {/* Right-side Reaction Buttons */}
            <div className="absolute right-2 sm:right-4 bottom-[110px] z-[220] flex flex-col items-center space-y-2 bg-black/25 p-2 rounded-full">
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
                <span className="text-xs mt-0.5">{allComments.length > 0 ? allComments.length : ''}</span>
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
                  {isAuthor ? (
                      <>
                        <DropdownMenuItem onClick={() => { setIsEditing(true); setEditedDescription(story?.description || ''); }}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          <span>Editar Descrição</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir Reel</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => setIsReportModalOpenStory(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Flag className="mr-2 h-4 w-4" />
                        <span>Reportar Reel</span>
                      </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bottom overlays container */}
            <div className="absolute bottom-0 left-0 right-0 z-[215] flex flex-col">
              <div
                className={cn(
                  "pr-[70px] sm:pr-[80px] text-white",
                  isDescriptionExpanded || isEditing
                    ? "bg-black/60 backdrop-blur-sm max-h-[50vh] overflow-y-auto" 
                    : ""
                )}
              >
                <div className="p-3 max-w-full pointer-events-auto">
                    <button
                        onClick={() => handleShowUserProfile(story.authorId)} 
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
                    {isEditing ? (
                        <div className="text-sm p-1 w-full">
                            <Textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full bg-black/50 text-white border-white/50 min-h-[80px]"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                <Button size="sm" onClick={handleUpdateReel}>Salvar</Button>
                            </div>
                        </div>
                    ) : description && (
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
              <div className="shrink-0">
                <AdMobSpace />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Sheet open={isCommentSheetOpen} onOpenChange={(open) => { setIsCommentSheetOpen(open); if(!open) setReplyingTo(null); }}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
          <SheetHeader className="p-3 border-b text-center">
            <SheetTitle>Comentários sobre o Reel</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {threadedComments.length > 0 ? (
              threadedComments.map(comment => <CommentItem key={comment.id} comment={comment} allComments={allComments} onReply={(c) => { setReplyingTo({ userNameToReply: c.userName, commentId: c.id }); setNewComment(`@${c.userName} `); commentTextareaRef.current?.focus(); }} />)
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
            {replyingTo && (
              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                  <span>Respondendo a <strong className="text-primary">@{replyingTo.userNameToReply}</strong></span>
                  <Button variant="link" className="p-0 h-auto text-destructive hover:text-destructive/80" onClick={() => setReplyingTo(null)}>
                      Cancelar
                  </Button>
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

       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <RadixAlertDialogTitle>Confirmar Exclusão</RadixAlertDialogTitle>
            <RadixAlertDialogDescription>
              Tem certeza que deseja excluir este Reel? Esta ação é irreversível.
            </RadixAlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReel} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
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

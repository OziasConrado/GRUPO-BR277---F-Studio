
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as PostCardTitleUI } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, UserCircle, Send, MoreVertical, Trash2, Edit3, Flag, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle as RadixDialogTitle, DialogClose as RadixDialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext';
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/client';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  increment,
  getDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';


export interface CommentProps {
  id: string;
  userId: string;
  userName:string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string; // This will be the relative time string
  text: string;
  textElements?: React.ReactNode[];
}

export interface PostReactions {
  thumbsUp: number;
  thumbsDown: number;
}


export interface PostCardProps {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  userLocation?: string;
  timestamp: string; // ISO String from parent
  text: string;
  imageUrl?: string | StaticImageData;
  dataAIImageHint?: string;
  uploadedImageUrl?: string | StaticImageData;
  dataAIUploadedImageHint?: string;
  reactions: PostReactions;
  bio?: string;
  instagramUsername?: string;
  cardStyle?: {
    backgroundColor?: string;
    color: string;
    backgroundImage?: string;
    name: string;
  };
  edited?: boolean;
}


interface ReplyingToInfo {
  userNameToReply: string;
}

const reportReasons = [
  { id: "suicide", label: "Suicídio, Imagem forte e/ou Automutilação." },
  { id: "minor", label: "Problema envolvendo menor de 18 anos." },
  { id: "bullying", label: "Bullying, assédio ou abuso." },
  { id: "violence", label: "Conteúdo violento que promove o ódio ou é perturbador." },
  { id: "adult", label: "Conteúdo adulto ou nudez direcionado." },
  { id: "scam", label: "Golpe, fraude ou perfil falso." },
  { id: "ip", label: "Propriedade Intelectual." },
  { id: "other", label: "Outros, informe o motivo..." },
];

const MOCK_USER_NAMES_FOR_MENTIONS = [
    'Carlos Caminhoneiro', 'Ana Viajante', 'Rota Segura Admin', 'Mariana Logística',
    'Pedro Estradeiro', 'Segurança Rodoviária', 'João Silva', 'Você', 'Ana Souza', 'Carlos Santos', 'Ozias Conrado'
];


const renderTextWithMentions = (text: string, knownUsers: string[]): React.ReactNode[] => {
  if (!text) return [text];
  const escapedUserNames = knownUsers.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const mentionRegex = new RegExp(`(@(?:${escapedUserNames.join('|')}))(?=\\s|\\p{P}|$)`, 'gu');

  const parts = text.split(mentionRegex);
  const elements: React.ReactNode[] = [];
  let currentString = '';

  parts.forEach((part, index) => {
    if (part.startsWith('@')) {
      const mentionedName = part.substring(1);
      if (knownUsers.includes(mentionedName)) {
        if (currentString) {
          elements.push(currentString);
          currentString = '';
        }
        elements.push(<strong key={`${index}-${part}`} className="text-accent font-semibold cursor-pointer hover:underline">{part}</strong>);
      } else {
        currentString += part;
      }
    } else {
      currentString += part;
    }
  });
  if (currentString) {
    elements.push(currentString);
  }
  return elements;
};


export default function PostCard({
  id: postId,
  userId,
  userName,
  userAvatarUrl,
  dataAIAvatarHint,
  userLocation,
  timestamp: initialTimestamp,
  text,
  imageUrl,
  dataAIImageHint,
  uploadedImageUrl,
  dataAIUploadedImageHint,
  reactions: initialReactions,
  bio,
  instagramUsername,
  cardStyle,
  edited,
}: PostCardProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { incrementNotificationCount } = useNotification();
  
  // State
  const [localPostReactions, setLocalPostReactions] = useState(initialReactions);
  const [currentUserPostReaction, setCurrentUserPostReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | undefined>(undefined);
  const [otherReportReasonText, setOtherReportReasonText] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState<string | StaticImageData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // Refs
  const footerTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Derived state and constants
  const timestamp = useMemo(() => formatDistanceToNow(parseISO(initialTimestamp), { addSuffix: true, locale: ptBR }), [initialTimestamp]);
  const isAuthor = currentUser?.uid === userId;
  const MAX_CHARS = 130;
  const needsTruncation = text.length > MAX_CHARS;
  const textToShow = isTextExpanded ? text : text.substring(0, MAX_CHARS);

  // Fetch user's reaction on mount
  useEffect(() => {
    if (!currentUser || !firestore) return;
    let isMounted = true;
    const reactionRef = doc(firestore, 'posts', postId, 'userReactions', currentUser.uid);
    getDoc(reactionRef).then(docSnap => {
      if (isMounted && docSnap.exists()) {
        setCurrentUserPostReaction(docSnap.data().type);
      }
    });
    return () => { isMounted = false; };
  }, [currentUser, postId]);
  
  // Fetch comments in real-time
  useEffect(() => {
    if (!firestore) return;
    const commentsCollection = collection(firestore, 'posts', postId, 'comments');
    const q = query(commentsCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        const commentTimestamp = data.timestamp instanceof Timestamp ? formatDistanceToNow(data.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : 'Agora';
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatarUrl: data.userAvatarUrl,
          text: data.text,
          timestamp: commentTimestamp,
          textElements: renderTextWithMentions(data.text, MOCK_USER_NAMES_FOR_MENTIONS),
        } as CommentProps;
      });
      setComments(fetchedComments);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [postId]);

  // Handlers
  const handlePostReactionClick = async (reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (!currentUser || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Login', description: 'Faça login para interagir.' });
      return;
    }

    const postRef = doc(firestore, 'posts', postId);
    const reactionRef = doc(firestore, 'posts', postId, 'userReactions', currentUser.uid);
    
    // Optimistic UI update
    const oldReaction = currentUserPostReaction;
    const newReaction = oldReaction === reactionType ? null : reactionType;
    setCurrentUserPostReaction(newReaction);
    setLocalPostReactions(prev => {
        const newCounts = { ...prev };
        if (oldReaction) newCounts[oldReaction]--;
        if (newReaction) newCounts[newReaction]++;
        return newCounts;
    });

    try {
      await runTransaction(firestore, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef);
        const storedReaction = reactionDoc.exists() ? reactionDoc.data().type : null;
        
        // This transaction logic ensures backend consistency, even if optimistic UI is slightly different
        if (storedReaction === reactionType) {
            transaction.delete(reactionRef);
            transaction.update(postRef, { [`reactions.${reactionType}`]: increment(-1) });
        } else {
            if (storedReaction) {
                transaction.update(postRef, { [`reactions.${storedReaction}`]: increment(-1) });
            }
            transaction.update(postRef, { [`reactions.${reactionType}`]: increment(1) });
            transaction.set(reactionRef, { type: reactionType, timestamp: serverTimestamp() });
        }
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({ variant: 'destructive', title: 'Erro ao Reagir', description: 'Não foi possível processar sua reação. A página será atualizada.' });
      // Revert optimistic update on error
      setCurrentUserPostReaction(oldReaction);
      setLocalPostReactions(initialReactions);
    }
  };
  
  const handleFooterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser || !firestore) return;
    
    try {
        await addDoc(collection(firestore, 'posts', postId, 'comments'), {
            userId: currentUser.uid,
            userName: currentUser.displayName || 'Usuário Anônimo',
            userAvatarUrl: currentUser.photoURL,
            text: newCommentText.trim(),
            timestamp: serverTimestamp(),
            // reactions can be added here later
        });
        
        setNewCommentText('');
        setReplyingTo(null);
        if (footerTextareaRef.current) footerTextareaRef.current.rows = 1;

    } catch (error) {
        console.error("Error adding comment: ", error);
        toast({ variant: "destructive", title: "Erro ao Comentar", description: "Não foi possível salvar seu comentário." });
    }
  };
  
  const handleUpdatePost = async () => {
    if (!isAuthor || !firestore) return;

    const postRef = doc(firestore, "posts", postId);
    try {
      await updateDoc(postRef, {
        text: editedText,
        edited: true,
        editedAt: serverTimestamp(),
      });
      toast({
        title: "Post Atualizado",
        description: "Sua publicação foi atualizada com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao Atualizar",
        description: "Não foi possível salvar as alterações.",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthor || !firestore) return;
    const postRef = doc(firestore, "posts", postId);
    try {
      await updateDoc(postRef, {
        deleted: true,
      });
      toast({
        title: "Post Excluído",
        description: "Sua publicação foi removida do feed.",
      });
      // The component will be unmounted automatically by the parent's onSnapshot listener filter
    } catch (error) {
      console.error("Error deleting post: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Não foi possível excluir a publicação.",
      });
    }
    setIsDeleteAlertOpen(false);
  };

  const handleAvatarOrNameClick = () => {
    setSelectedUserProfile({
      id: postId, name: userName, avatarUrl: userAvatarUrl, dataAIAvatarHint, location: userLocation, bio, instagramUsername,
    });
    setIsProfileModalOpen(true);
  };
  
  const handleImageClick = (imgUrl: string | StaticImageData) => {
    setSelectedPostImage(imgUrl);
    setIsImageModalOpen(true);
  };

  const handleReportSubmit = () => {
    if (!selectedReportReason) {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione um motivo." });
        return;
    }
    const reportDetails = selectedReportReason === "other" ? otherReportReasonText : reportReasons.find(r=>r.id === selectedReportReason)?.label;
    toast({ title: "Denúncia Enviada", description: `Motivo: ${reportDetails}` });
    setIsReportModalOpen(false);
    setSelectedReportReason(undefined);
    setOtherReportReasonText('');
  };

  const processedTextElementsForStandardPost = useMemo(() => {
    const baseElements = renderTextWithMentions(textToShow, MOCK_USER_NAMES_FOR_MENTIONS);
    return (
      <>
        {baseElements}
        {needsTruncation && (
          isTextExpanded ? (
            <>
              {' '}
              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary inline" onClick={(e) => { e.stopPropagation(); setIsTextExpanded(false); }}>
                Ver menos.
              </Button>
            </>
          ) : (
            <>
              ...{' '}
              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary inline" onClick={(e) => { e.stopPropagation(); setIsTextExpanded(true); }}>
                Ver mais...
              </Button>
            </>
          )
        )}
      </>
    );
  }, [textToShow, isTextExpanded, needsTruncation, text]);

  const displayImageUrl = cardStyle ? null : (uploadedImageUrl || imageUrl);
  const displayImageAlt = cardStyle ? '' : (uploadedImageUrl ? (dataAIUploadedImageHint || "Imagem do post") : (dataAIImageHint || "Imagem do post"));
  
  const headerTextColor = cardStyle?.color === '#FFFFFF' ? 'text-primary-foreground' : 'text-foreground';
  const mutedTextColor = cardStyle?.color === '#FFFFFF' ? 'text-primary-foreground/80' : 'text-muted-foreground';
  const reactionButtonTextColor = cardStyle?.color === '#FFFFFF' ? 'text-primary-foreground/90 hover:text-primary-foreground' : 'text-muted-foreground hover:text-primary';
  const reactionButtonActivePrimaryColor = cardStyle?.color === '#FFFFFF' ? 'text-yellow-400' : 'text-primary';
  const reactionButtonActiveDestructiveColor = cardStyle?.color === '#FFFFFF' ? 'text-orange-400' : 'text-destructive';
  const reactionButtonHoverBg = cardStyle?.color === '#FFFFFF' ? 'hover:bg-white/10' : 'hover:bg-muted/30';
  
  // Comment Component
  const CommentItem = ({ comment }: { comment: CommentProps }) => (
    <div key={comment.id} className="flex items-start space-x-2">
      <Avatar className="h-8 w-8">
        {comment.userAvatarUrl && <AvatarImage src={comment.userAvatarUrl as string} alt={comment.userName} />}
        <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow p-3 rounded-lg bg-muted/30 dark:bg-slate-700/30">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold font-headline">{comment.userName}</p>
          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
        </div>
        <p className="text-base mt-1 whitespace-pre-wrap">{comment.textElements || comment.text}</p>
        <div className="flex items-center mt-1.5 space-x-0.5">
          <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary ml-1" onClick={() => { setReplyingTo({ userNameToReply: comment.userName }); setNewCommentText(`@${comment.userName} `); footerTextareaRef.current?.focus(); }}>
            Responder
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl overflow-hidden" style={cardStyle?.backgroundImage ? { backgroundImage: cardStyle.backgroundImage } : { backgroundColor: cardStyle?.backgroundColor }}>
        <CardHeader className="flex flex-row items-start space-x-3 p-4">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={handleAvatarOrNameClick}>
            {userAvatarUrl ? <AvatarImage src={userAvatarUrl as string} alt={userName} data-ai-hint={dataAIAvatarHint} /> : null}
            <AvatarFallback>{userName ? userName.substring(0,2).toUpperCase() : <UserCircle className="h-10 w-10" />}</AvatarFallback>
          </Avatar>
          <div className="flex justify-between items-start w-full">
            <div className="cursor-pointer" onClick={handleAvatarOrNameClick}>
              <PostCardTitleUI className={cn("text-base font-headline", headerTextColor)} style={cardStyle ? { color: cardStyle.color } : {}}>{userName}</PostCardTitleUI>
              {userLocation && <p className={cn("text-xs", mutedTextColor)} style={cardStyle ? { color: cardStyle.color, opacity: 0.8 } : {}}>{userLocation}</p>}
            </div>
            <div className="flex items-center gap-1">
                {edited && <span className={cn("text-xs", mutedTextColor)} style={cardStyle ? { color: cardStyle.color, opacity: 0.8 } : {}}>(Editado)</span>}
                <p className={cn("text-xs whitespace-nowrap pl-2", mutedTextColor)} style={cardStyle ? { color: cardStyle.color, opacity: 0.8 } : {}}>{timestamp}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("p-4 pt-0", cardStyle && "flex flex-col items-center justify-center text-center min-h-[280px]")}>
          {isEditing ? (
             <div className="space-y-2">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[120px] bg-background text-foreground"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button onClick={handleUpdatePost}>Salvar</Button>
                </div>
              </div>
          ) : cardStyle ? (
            text && <p className="text-2xl font-bold leading-tight" style={{ color: cardStyle.color }}>{renderTextWithMentions(text, MOCK_USER_NAMES_FOR_MENTIONS)}</p>
          ) : (
            <>
              {text && <div className="mb-3"><p className="text-base leading-relaxed whitespace-pre-wrap">{processedTextElementsForStandardPost}</p></div>}
              {displayImageUrl && (
                <div className="bg-muted/10 dark:bg-muted/20 border-y border-border/50">
                  <button type="button" onClick={() => handleImageClick(displayImageUrl!)} className="block w-full relative aspect-square overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" aria-label="Ampliar imagem">
                    <Image src={displayImageUrl} alt={displayImageAlt} fill style={{ objectFit: 'cover' }} data-ai-hint={displayImageAlt} className="transition-transform duration-300 group-hover:scale-105" />
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={() => handlePostReactionClick('thumbsUp')} className={cn(`p-2 h-auto ${currentUserPostReaction === 'thumbsUp' ? reactionButtonActivePrimaryColor : reactionButtonTextColor} ${reactionButtonHoverBg} flex items-center gap-0.5`)} aria-label="Curtir">
                  <ThumbsUp className={`h-7 w-7 ${currentUserPostReaction === 'thumbsUp' ? (cardStyle?.color === '#FFFFFF' ? 'fill-yellow-400' : 'fill-primary') : ''}`} />
                  {localPostReactions.thumbsUp > 0 && <span className="text-xs tabular-nums">({localPostReactions.thumbsUp})</span>}
              </Button>
              <Button variant="ghost" onClick={() => handlePostReactionClick('thumbsDown')} className={cn(`p-2 h-auto ${currentUserPostReaction === 'thumbsDown' ? reactionButtonActiveDestructiveColor : reactionButtonTextColor} ${reactionButtonHoverBg} flex items-center gap-0.5`)} aria-label="Não curtir">
                  <ThumbsDown className={`h-7 w-7 ${currentUserPostReaction === 'thumbsDown' ? (cardStyle?.color === '#FFFFFF' ? 'fill-orange-400' : 'fill-destructive') : ''}`} />
                   {localPostReactions.thumbsDown > 0 && <span className="text-xs tabular-nums">({localPostReactions.thumbsDown})</span>}
              </Button>
              <Button variant="ghost" onClick={() => setIsSheetOpen(true)} className={cn(reactionButtonTextColor, reactionButtonHoverBg, "p-2 h-auto flex items-center gap-0.5")} aria-label="Comentários">
                  <MessageSquare className="h-7 w-7" />
                  {comments.length > 0 && <span className="text-xs tabular-nums">({comments.length})</span>}
              </Button>
               <Button variant="ghost" className={cn(reactionButtonTextColor, reactionButtonHoverBg, "p-2 h-auto")}>
                  <Share2 className="h-7 w-7" />
              </Button>
          </div>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn(reactionButtonTextColor, reactionButtonHoverBg, "p-2 h-auto")}>
                      <MoreVertical className="h-7 w-7" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  {isAuthor && (
                    <>
                      <DropdownMenuItem onClick={() => { setIsEditing(true); setEditedText(text); }}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          <span>Editar post</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setIsDeleteAlertOpen(true)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir post</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setIsReportModalOpen(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      <span>Sinalizar conteúdo</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if (!open) setReplyingTo(null); }}>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
              <SheetHeader className="p-3 border-b border-border text-center"><SheetTitle>Comentários</SheetTitle></SheetHeader>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
                ) : (
                  <p className="text-muted-foreground text-center pt-8">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                )}
              </div>
              <div className="p-3 border-t border-border bg-background sticky bottom-0 space-y-2">
                  {replyingTo && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                          <span>Respondendo a <strong className="text-primary">@{replyingTo.userNameToReply}</strong></span>
                          <Button variant="link" size="xs" className="p-0 h-auto text-destructive hover:text-destructive/80" onClick={() => setReplyingTo(null)}>
                              Cancelar
                          </Button>
                      </div>
                  )}
                  <form onSubmit={handleFooterSubmit} className="flex gap-2 items-end">
                      <Avatar className="h-9 w-9 self-end mb-0.5">
                          <AvatarImage src={currentUser?.photoURL || ''} />
                          <AvatarFallback><UserCircle/></AvatarFallback>
                      </Avatar>
                      <Textarea
                        ref={footerTextareaRef}
                        placeholder={replyingTo ? `Responder a @${replyingTo.userNameToReply}...` : "Escreva um comentário..."}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="rounded-lg flex-grow bg-background/70 min-h-[40px] max-h-[120px] resize-none text-base"
                        rows={1}
                      />
                      <Button type="submit" size="icon" className="shrink-0 h-10 w-10 self-end" disabled={!newCommentText.trim() || !currentUser}>
                          <Send className="h-4 w-4" />
                      </Button>
                  </form>
              </div>
          </SheetContent>
      </Sheet>

      <AlertDialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <RadixAlertDialogTitle>Sinalizar Conteúdo Inadequado</RadixAlertDialogTitle>
              <AlertDialogDescription>Por favor, selecione o motivo da sua denúncia.</AlertDialogDescription>
            </AlertDialogHeader>
            <RadioGroup value={selectedReportReason} onValueChange={setSelectedReportReason} className="space-y-2 my-4">
              {reportReasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="font-normal">{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {selectedReportReason === 'other' && (
              <Textarea placeholder="Descreva o motivo..." value={otherReportReasonText} onChange={(e) => setOtherReportReasonText(e.target.value)} className="min-h-[80px]" />
            )}
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setSelectedReportReason(undefined); setOtherReportReasonText(''); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReportSubmit}>Enviar Denúncia</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <RadixAlertDialogTitle>Confirmar Exclusão</RadixAlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita e removerá o post do feed permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={selectedUserProfile} />

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/90 !p-0 flex flex-col !translate-x-0 !translate-y-0" onEscapeKeyDown={() => setIsImageModalOpen(false)}>
              <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-black/50 !z-[210]">
                  <RadixDialogTitle className="sr-only">Visualização de Imagem</RadixDialogTitle>
                  <RadixDialogClose asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
                          <X className="h-5 w-5 sm:h-6 sm:h-6" />
                      </Button>
                  </RadixDialogClose>
              </DialogHeader>
              <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                {selectedPostImage && <div className="relative w-full h-full max-w-full max-h-full mx-auto"><Image src={selectedPostImage} alt={dataAIImageHint || "Post image ampliada"} fill style={{objectFit: 'contain'}} data-ai-hint={dataAIUploadedImageHint || dataAIImageHint || "social media post zoomed"}/></div>}
              </div>
              <div className="shrink-0 h-[100px] bg-gray-700/50 flex items-center justify-center text-sm text-white/80 !z-[210]">Espaço para Banner AdMob</div>
          </DialogContent>
      </Dialog>
    </>
  );
}

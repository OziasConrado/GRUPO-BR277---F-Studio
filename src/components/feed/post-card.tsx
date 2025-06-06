
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as PostCardTitleUI } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, UserCircle, Send, MoreVertical, Trash2, Edit3, Flag, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo } from 'react';
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


export interface ReactionState {
  thumbsUp: number;
  thumbsDown: number;
  userReaction?: 'thumbsUp' | 'thumbsDown' | null;
}

export interface ReplyProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
  reactions: ReactionState;
  replies?: ReplyProps[];
  textElements?: React.ReactNode[];
}

export interface CommentProps {
  id: string;
  userName:string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
  reactions: ReactionState;
  replies?: ReplyProps[];
  textElements?: React.ReactNode[];
}

export interface PostReactions {
  thumbsUp: number;
  thumbsDown: number;
}


export interface PostCardProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  userLocation?: string;
  timestamp: string;
  text: string;
  imageUrl?: string | StaticImageData;
  dataAIImageHint?: string;
  reactions: PostReactions;
  commentsData: CommentProps[];
  allKnownUserNames?: string[];
  bio?: string;
  instagramUsername?: string;
}


interface ReplyingToInfo {
  type: 'comment' | 'reply';
  parentId: string;
  grandParentId?: string;
  userNameToReply?: string;
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

  parts.forEach((part, index) => {
    if (part.startsWith('@')) {
      const mentionedName = part.substring(1);
      if (knownUsers.includes(mentionedName)) {
        elements.push(<strong key={`${index}-${part}`} className="text-accent font-semibold cursor-pointer hover:underline">{part}</strong>);
      } else {
        elements.push(part);
      }
    } else {
      elements.push(part);
    }
  });
  return elements;
};


export default function PostCard({
  id: postId,
  userName,
  userAvatarUrl,
  dataAIAvatarHint,
  userLocation,
  timestamp,
  text,
  imageUrl,
  dataAIImageHint,
  reactions: initialReactions,
  commentsData: initialCommentsData,
  allKnownUserNames = MOCK_USER_NAMES_FOR_MENTIONS,
  bio,
  instagramUsername,
}: PostCardProps) {
  const [currentUserPostReaction, setCurrentUserPostReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [localPostReactions, setLocalPostReactions] = useState(initialReactions);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const { toast } = useToast();
  const { incrementNotificationCount } = useNotification();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | undefined>(undefined);
  const [otherReportReasonText, setOtherReportReasonText] = useState('');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState<string | StaticImageData | null>(null);

  const MAX_CHARS = 170;
  const needsTruncation = text.length > MAX_CHARS;

  const textToShow = isTextExpanded ? text : text.substring(0, MAX_CHARS);
  const processedTextElements = useMemo(() => {
    const renderedText = renderTextWithMentions(textToShow, allKnownUserNames);
    if (!isTextExpanded && needsTruncation) {
      return [
        ...renderedText,
        '... ',
        <Button
          key="ver-mais"
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs text-primary inline"
          onClick={() => setIsTextExpanded(true)}
        >
          Ver mais...
        </Button>
      ];
    }
    if (isTextExpanded && needsTruncation) {
      return [
        ...renderedText,
        ' ',
        <Button
          key="ver-menos"
          variant="link"
          size="sm"
          className="p-0 h-auto text-xs text-primary inline"
          onClick={() => setIsTextExpanded(false)}
        >
          Ver menos.
        </Button>
      ];
    }
    return renderedText;
  }, [textToShow, allKnownUserNames, isTextExpanded, needsTruncation, text]);


  const processCommentsAndRepliesWithMentions = useCallback((items: (CommentProps | ReplyProps)[]) : any[] => {
    return items.map(item => ({
      ...item,
      textElements: item.text ? renderTextWithMentions(item.text, allKnownUserNames) : undefined,
      replies: item.replies ? processCommentsAndRepliesWithMentions(item.replies) : [],
    }));
  }, [allKnownUserNames]);


  const [localCommentsData, setLocalCommentsData] = useState<CommentProps[]>(
     () => processCommentsAndRepliesWithMentions(initialCommentsData.map(c => ({
      ...c,
      reactions: c.reactions || { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: c.replies?.map(r => ({
        ...r,
        reactions: r.reactions || { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      })) || []
    })))
  );


  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);
  const [newReplyText, setNewReplyText] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handlePostReactionClick = (reactionType: 'thumbsUp' | 'thumbsDown') => {
    setLocalPostReactions(prevReactions => {
      const newReactions = { ...prevReactions };
      if (currentUserPostReaction === reactionType) {
        newReactions[reactionType]--;
        setCurrentUserPostReaction(null);
      } else {
        if (currentUserPostReaction) {
          newReactions[currentUserPostReaction]--;
        }
        newReactions[reactionType]++;
        setCurrentUserPostReaction(reactionType);
      }
      return newReactions;
    });
  };

  const handleItemReaction = useCallback((
    itemId: string,
    reactionType: 'thumbsUp' | 'thumbsDown',
    itemType: 'comment' | 'reply',
    commentIdForReply?: string,
  ) => {
    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        const updateReaction = (item: CommentProps | ReplyProps): CommentProps | ReplyProps => {
          const currentReaction = item.reactions.userReaction;
          let newThumbsUp = item.reactions.thumbsUp;
          let newThumbsDown = item.reactions.thumbsDown;
          let newUserReaction: 'thumbsUp' | 'thumbsDown' | null = null;

          if (currentReaction === reactionType) {
            if (reactionType === 'thumbsUp') newThumbsUp--;
            else newThumbsDown--;
            newUserReaction = null;
          } else {
            if (currentReaction === 'thumbsUp') newThumbsUp--;
            if (currentReaction === 'thumbsDown') newThumbsDown--;

            if (reactionType === 'thumbsUp') newThumbsUp++;
            else newThumbsDown++;
            newUserReaction = reactionType;
          }

          return {
            ...item,
            reactions: {
              thumbsUp: Math.max(0, newThumbsUp),
              thumbsDown: Math.max(0, newThumbsDown),
              userReaction: newUserReaction,
            },
          };
        };

        if (itemType === 'comment' && comment.id === itemId) {
          return updateReaction(comment) as CommentProps;
        }

        if (comment.replies) {
          const updateNestedReplies = (replies: ReplyProps[], currentGrandParentId: string): ReplyProps[] => {
            return replies.map(reply => {
              if (itemType === 'reply' && reply.id === itemId && commentIdForReply === currentGrandParentId) {
                return updateReaction(reply) as ReplyProps;
              }
              if (reply.replies) {
                return { ...reply, replies: updateNestedReplies(reply.replies, currentGrandParentId) };
              }
              return reply;
            });
          };
          return { ...comment, replies: updateNestedReplies(comment.replies, comment.id) };
        }
        return comment;
      })
    );
  }, []);

  const checkForMentionsAndNotify = (textToCheck: string) => {
    allKnownUserNames.forEach(name => {
      const mentionRegex = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|\\p{P}|$)`, 'u');
      if (mentionRegex.test(textToCheck)) {
        console.log(`Mentioned: ${name}`);
        incrementNotificationCount();
      }
    });
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    checkForMentionsAndNotify(newCommentText);
    const newComment: CommentProps = {
      id: `c${Date.now()}`,
      userName: 'Usuário Atual',
      userAvatarUrl: 'https://placehold.co/40x40.png?text=UA',
      dataAIAvatarHint: 'current user',
      timestamp: 'Agora mesmo',
      text: newCommentText,
      textElements: renderTextWithMentions(newCommentText, allKnownUserNames),
      reactions: { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: [],
    };
    setLocalCommentsData(prevComments => [newComment, ...prevComments]);
    setNewCommentText('');
  };

  const handleAddReply = (e: FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !replyingTo) return;
    checkForMentionsAndNotify(newReplyText);
    const newReply: ReplyProps = {
      id: `r${Date.now()}`,
      userName: 'Usuário Atual',
      userAvatarUrl: 'https://placehold.co/32x32.png?text=UA',
      dataAIAvatarHint: 'current user',
      timestamp: 'Agora mesmo',
      text: newReplyText,
      textElements: renderTextWithMentions(newReplyText, allKnownUserNames),
      reactions: { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: [],
    };

    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        if (replyingTo.type === 'comment' && comment.id === replyingTo.parentId) {
          return { ...comment, replies: [newReply, ...(comment.replies || [])] };
        }
        else if (replyingTo.type === 'reply' && comment.id === replyingTo.grandParentId) {
          const addNestedReply = (replies: ReplyProps[]): ReplyProps[] => {
            return replies.map(reply => {
              if (reply.id === replyingTo.parentId) {
                return { ...reply, replies: [newReply, ...(reply.replies || [])] };
              }
              if (reply.replies) {
                return { ...reply, replies: addNestedReply(reply.replies) };
              }
              return reply;
            });
          };
          return { ...comment, replies: addNestedReply(comment.replies || []) };
        }
        return comment;
      })
    );

    setNewReplyText('');
    setReplyingTo(null);
  };

  const handleDeletePost = () => {
    toast({ title: "Post Excluído", description: "Esta ação seria implementada no backend." });
  };

  const handleEditPost = () => {
    toast({ title: "Editar Post", description: "Funcionalidade de edição a ser implementada." });
  };

  const handleReportSubmit = () => {
    if (!selectedReportReason) {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione um motivo." });
        return;
    }
    if (selectedReportReason === "other" && !otherReportReasonText.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, especifique o motivo em 'Outros'." });
        return;
    }
    const reasonLabel = reportReasons.find(r=>r.id === selectedReportReason)?.label;
    const reportDetails = selectedReportReason === "other" ? otherReportReasonText : reasonLabel;
    toast({ title: "Denúncia Enviada", description: `Motivo: ${reportDetails}` });
    setIsReportModalOpen(false);
    setSelectedReportReason(undefined);
    setOtherReportReasonText('');
  };

  const handleAvatarOrNameClick = () => {
    setSelectedUserProfile({
      id: postId,
      name: userName,
      avatarUrl: userAvatarUrl,
      dataAIAvatarHint: dataAIAvatarHint,
      location: userLocation,
      bio: bio,
      instagramUsername: instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  const handleImageClick = (imgUrl: string | StaticImageData) => {
    setSelectedPostImage(imgUrl);
    setIsImageModalOpen(true);
  };


  const renderReplies = (replies: ReplyProps[] | undefined, commentIdForReply: string, depth = 0) => {
    if (!replies || replies.length === 0) return null;
    const MAX_DEPTH = 1;

    return (
      <div className={`ml-6 mt-2 space-y-2 pt-2 ${depth > 0 ? 'pl-3 border-l-2 border-muted/30' : 'pl-3 border-l-2 border-muted/50'}`}>
        {replies.map(reply => (
          <div key={reply.id} className="space-y-1">
            <div className="flex items-start space-x-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={reply.userAvatarUrl as string} alt={reply.userName} data-ai-hint={reply.dataAIAvatarHint} />
                <AvatarFallback>{reply.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-grow p-2 rounded-md bg-muted/20 dark:bg-slate-700/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold font-headline">{reply.userName}</p>
                  <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                </div>
                <p className="text-base mt-0.5 whitespace-pre-wrap">{reply.textElements || reply.text}</p>
                <div className="flex items-center mt-1 space-x-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto text-xs ${reply.reactions.userReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary focus:text-primary'} hover:bg-muted/30 rounded-md`}
                    onClick={() => handleItemReaction(reply.id, 'thumbsUp', 'reply', commentIdForReply)}
                  >
                    <ThumbsUp className={`mr-0.5 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                    {reply.reactions.thumbsUp > 0 ? reply.reactions.thumbsUp : ''}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto text-xs ${reply.reactions.userReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive focus:text-destructive'} hover:bg-muted/30 rounded-md`}
                    onClick={() => handleItemReaction(reply.id, 'thumbsDown', 'reply', commentIdForReply)}
                  >
                    <ThumbsDown className={`mr-0.5 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                    {reply.reactions.thumbsDown > 0 ? reply.reactions.thumbsDown : ''}
                  </Button>
                  {depth < MAX_DEPTH && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs text-primary ml-1"
                      onClick={() => {
                        if (replyingTo?.type === 'reply' && replyingTo.parentId === reply.id) {
                          setReplyingTo(null);
                          setNewReplyText('');
                        } else {
                          setReplyingTo({ type: 'reply', parentId: reply.id, grandParentId: commentIdForReply, userNameToReply: reply.userName });
                          setNewReplyText('');
                        }
                      }}
                    >
                      Responder
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {replyingTo?.type === 'reply' && replyingTo.parentId === reply.id && (
              <form onSubmit={handleAddReply} className="flex gap-2 items-start ml-9 mt-1">
                <Avatar className="mt-1 h-7 w-7">
                  <AvatarImage src="https://placehold.co/32x32.png?text=UA" alt="Usuário Atual" data-ai-hint="current user" />
                  <AvatarFallback>UA</AvatarFallback>
                </Avatar>
                <Input
                  placeholder={`Respondendo a ${reply.userName}...`}
                  value={newReplyText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewReplyText(e.target.value)}
                  className="rounded-lg flex-grow h-9 bg-background/70 text-base"
                  autoFocus
                />
                <Button type="submit" size="icon" className="rounded-lg h-9 w-9 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
            {depth < MAX_DEPTH && renderReplies(reply.replies, commentIdForReply, depth + 1)}
          </div>
        ))}
      </div>
    );
  };


  return (
    <>
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-start space-x-3 p-4">
        <Avatar className="h-10 w-10 cursor-pointer" onClick={handleAvatarOrNameClick}>
          {userAvatarUrl ? <AvatarImage src={userAvatarUrl as string} alt={userName} data-ai-hint={dataAIAvatarHint} /> : null}
          <AvatarFallback>
            {userName ? userName.substring(0,2).toUpperCase() : <UserCircle className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex justify-between items-start w-full">
            <div className="cursor-pointer" onClick={handleAvatarOrNameClick}>
                <PostCardTitleUI className="text-base font-headline">{userName}</PostCardTitleUI>
                {userLocation && <p className="text-xs text-muted-foreground">{userLocation}</p>}
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap pl-2">{timestamp}</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="mb-3">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {processedTextElements}
            </p>
        </div>
        {imageUrl && (
          <div className="p-[3px] rounded-lg bg-muted/10 dark:bg-muted/20">
            <button
                type="button"
                onClick={() => handleImageClick(imageUrl as string)}
                className="block w-full relative aspect-square rounded-md overflow-hidden border border-border/50 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Ampliar imagem"
            >
                <Image
                    src={imageUrl}
                    alt={dataAIImageHint || "Post image"}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={dataAIImageHint || "social media post"}
                    className="transition-transform duration-300 group-hover:scale-105 rounded-md"
                />
            </button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between px-2 py-1.5 border-t border-border/50">
        <div className="flex items-center gap-0.5">
            <Button
                variant="ghost"
                onClick={() => handlePostReactionClick('thumbsUp')}
                className={`p-1 h-auto ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                aria-label="Curtir"
            >
                <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                {localPostReactions.thumbsUp > 0 && <span className="text-xs tabular-nums">({localPostReactions.thumbsUp})</span>}
            </Button>
            <Button
                variant="ghost"
                onClick={() => handlePostReactionClick('thumbsDown')}
                className={`p-1 h-auto ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                aria-label="Não curtir"
            >
                <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                 {localPostReactions.thumbsDown > 0 && <span className="text-xs tabular-nums">({localPostReactions.thumbsDown})</span>}
            </Button>

            <Button
                variant="ghost"
                onClick={() => setIsSheetOpen(true)}
                className="text-muted-foreground hover:text-primary p-1 h-auto hover:bg-muted/30 rounded-md flex items-center gap-0.5"
                aria-label="Comentários"
            >
                <MessageSquare className="h-5 w-5" />
                {localCommentsData.length > 0 && <span className="text-xs tabular-nums">({localCommentsData.length})</span>}
            </Button>

             <Button variant="ghost" className="text-muted-foreground hover:text-primary p-1 h-auto hover:bg-muted/30 rounded-md">
                <Share2 className="h-5 w-5" />
            </Button>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary p-1 h-auto hover:bg-muted/30 rounded-md">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditPost}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Editar post</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} >
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Sinalizar conteúdo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir post</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>


        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
                <SheetHeader className="p-4 border-b border-border flex flex-row justify-center items-center relative">
                    <SheetTitle className="sr-only">Comentários e Reações do Post</SheetTitle>
                    <div className="flex items-center justify-center gap-2 py-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePostReactionClick('thumbsUp')}
                            className={`p-1 h-auto ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                            aria-label="Curtir Post"
                        >
                            <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                            <span className="ml-0.5 text-xs tabular-nums">({localPostReactions.thumbsUp})</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePostReactionClick('thumbsDown')}
                            className={`p-1 h-auto ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                            aria-label="Não Curtir Post"
                        >
                            <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                            <span className="ml-0.5 text-xs tabular-nums">({localPostReactions.thumbsDown})</span>
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {localCommentsData.map(comment => (
                    <div key={comment.id} className="space-y-1">
                    <div className="flex items-start space-x-2">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatarUrl as string} alt={comment.userName} data-ai-hint={comment.dataAIAvatarHint} />
                        <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow p-3 rounded-lg bg-muted/30 dark:bg-slate-700/30">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold font-headline">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                        </div>
                        <p className="text-base mt-1 whitespace-pre-wrap">{comment.textElements || comment.text}</p>
                        <div className="flex items-center mt-1.5 space-x-0.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-1 h-auto text-xs ${comment.reactions.userReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary focus:text-primary'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                                onClick={() => handleItemReaction(comment.id, 'thumbsUp', 'comment')}
                            >
                            <ThumbsUp className={`mr-0.5 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                            {comment.reactions.thumbsUp > 0 ? <span className="text-xs tabular-nums">({comment.reactions.thumbsUp})</span> : ''}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-1 h-auto text-xs ${comment.reactions.userReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive focus:text-destructive'} hover:bg-muted/30 rounded-md flex items-center gap-0.5`}
                                onClick={() => handleItemReaction(comment.id, 'thumbsDown', 'comment')}
                            >
                            <ThumbsDown className={`mr-0.5 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                            {comment.reactions.thumbsDown > 0 ? <span className="text-xs tabular-nums">({comment.reactions.thumbsDown})</span> : ''}
                            </Button>
                            <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs text-primary ml-1"
                            onClick={() => {
                                if (replyingTo?.type === 'comment' && replyingTo.parentId === comment.id) {
                                setReplyingTo(null);
                                setNewReplyText('');
                                } else {
                                setReplyingTo({ type: 'comment', parentId: comment.id, userNameToReply: comment.userName });
                                setNewReplyText('');
                                }
                            }}
                            >
                            Responder
                            </Button>
                        </div>
                        </div>
                    </div>

                    {replyingTo?.type === 'comment' && replyingTo.parentId === comment.id && (
                        <form onSubmit={handleAddReply} className="flex gap-2 items-start ml-10 mt-1">
                        <Avatar className="mt-1 h-8 w-8">
                            <AvatarImage src="https://placehold.co/32x32.png?text=UA" alt="Usuário Atual" data-ai-hint="current user" />
                            <AvatarFallback>UA</AvatarFallback>
                        </Avatar>
                        <Input
                            placeholder={`Respondendo a ${comment.userName}...`}
                            value={newReplyText}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewReplyText(e.target.value)}
                            className="rounded-lg flex-grow h-10 bg-background/70 text-base"
                            autoFocus
                        />
                        <Button type="submit" size="icon" className="rounded-lg shrink-0 h-10 w-10">
                            <Send className="h-4 w-4" />
                        </Button>
                        </form>
                    )}
                    {renderReplies(comment.replies, comment.id)}
                    </div>
                ))}
                </div>

                <div className="p-4 border-t border-border bg-background sticky bottom-0">
                    <form onSubmit={handleAddComment} className="flex gap-2 items-start">
                        <Avatar className="mt-1 h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40.png?text=UA" alt="Usuário Atual" data-ai-hint="current user" />
                        <AvatarFallback>UA</AvatarFallback>
                        </Avatar>
                        <Textarea
                        placeholder="Escreva um comentário..."
                        value={newCommentText}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCommentText(e.target.value)}
                        className="rounded-lg flex-grow bg-background/70 min-h-[40px] resize-none text-base"
                        rows={1}
                        />
                        <Button type="submit" size="icon" className="rounded-lg shrink-0 h-10 w-10">
                        <Send className="h-4 w-4" />
                        </Button>
                    </form>
                     <div className="mt-4 h-[50px] bg-muted/30 rounded flex items-center justify-center text-sm text-muted-foreground">
                        Espaço para Publicidade AdMob (Ex: 320x50)
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </Card>

    <AlertDialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <RadixAlertDialogTitle>Sinalizar Conteúdo Inadequado</RadixAlertDialogTitle>
            <AlertDialogDescription>
              Por favor, selecione o motivo da sua denúncia. Sua identidade será mantida em sigilo.
            </AlertDialogDescription>
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
            <Textarea
              placeholder="Por favor, descreva o motivo da denúncia..."
              value={otherReportReasonText}
              onChange={(e) => setOtherReportReasonText(e.target.value)}
              className="min-h-[80px]"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSelectedReportReason(undefined); setOtherReportReasonText(''); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReportSubmit}>Enviar Denúncia</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUserProfile}
      />

    {/* Image Zoom Modal */}
    <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent 
            className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/90 !p-0 flex flex-col !translate-x-0 !translate-y-0"
            onEscapeKeyDown={() => setIsImageModalOpen(false)}
        >
            <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-black/50 !z-[210]">
                <RadixDialogTitle className="sr-only">Visualização de Imagem</RadixDialogTitle>
                <RadixDialogClose asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
                        <X className="h-5 w-5 sm:h-6 sm:h-6" />
                    </Button>
                </RadixDialogClose>
            </DialogHeader>
            
            <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
            {selectedPostImage && (
                <div className="relative w-full h-full max-w-full max-h-full mx-auto">
                <Image
                    src={selectedPostImage}
                    alt={dataAIImageHint || "Post image ampliada"}
                    fill
                    style={{objectFit: 'contain'}}
                    data-ai-hint={dataAIImageHint || "social media post zoomed"}
                />
                </div>
            )}
            </div>

            <div className="shrink-0 h-[100px] bg-gray-700/50 flex items-center justify-center text-sm text-white/80 !z-[210]">
                Espaço para Banner AdMob (Ex: 320x100 ou 728x90)
            </div>
        </DialogContent>
    </Dialog>

    </>
  );
}


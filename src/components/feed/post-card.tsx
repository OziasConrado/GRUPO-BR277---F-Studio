
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as PostCardTitleUI } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, UserCircle, Send, MoreVertical, Trash2, Edit3, Flag } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, useCallback, useEffect } from 'react';
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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';


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
  dataAIImageHint?: string;
  timestamp: string;
  text: string;
  imageUrl?: string | StaticImageData;
  reactions: PostReactions;
  commentsData: CommentProps[];
}


interface ReplyingToInfo {
  type: 'comment' | 'reply';
  parentId: string;
  grandParentId?: string; // Used when replying to a reply, to know the top-level comment
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
}: PostCardProps) {
  const [currentUserPostReaction, setCurrentUserPostReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [localPostReactions, setLocalPostReactions] = useState(initialReactions);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const { toast } = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | undefined>(undefined);
  const [otherReportReasonText, setOtherReportReasonText] = useState('');


  const MAX_CHARS = 170;
  const needsTruncation = text.length > MAX_CHARS;
  const displayedText = isTextExpanded ? text : text.substring(0, MAX_CHARS) + (needsTruncation && !isTextExpanded ? '...' : '');


  const [localCommentsData, setLocalCommentsData] = useState<CommentProps[]>(
    initialCommentsData.map(c => ({
      ...c,
      reactions: c.reactions || { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: c.replies?.map(r => ({
        ...r,
        reactions: r.reactions || { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      })) || []
    }))
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
    commentIdForReply?: string, // This is the grandParentId for replies to replies
  ) => {
    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        const updateReaction = (item: CommentProps | ReplyProps): CommentProps | ReplyProps => {
          const currentReaction = item.reactions.userReaction;
          let newThumbsUp = item.reactions.thumbsUp;
          let newThumbsDown = item.reactions.thumbsDown;
          let newUserReaction: 'thumbsUp' | 'thumbsDown' | null = null;

          if (currentReaction === reactionType) { // Deselecting current reaction
            if (reactionType === 'thumbsUp') newThumbsUp--;
            else newThumbsDown--;
            newUserReaction = null;
          } else { // Selecting a new reaction or switching reaction
            // First, undo the previous reaction if it exists
            if (currentReaction === 'thumbsUp') newThumbsUp--;
            if (currentReaction === 'thumbsDown') newThumbsDown--;
            
            // Apply the new reaction
            if (reactionType === 'thumbsUp') newThumbsUp++;
            else newThumbsDown++;
            newUserReaction = reactionType;
          }
          
          return {
            ...item,
            reactions: {
              thumbsUp: Math.max(0, newThumbsUp), // Ensure count doesn't go below 0
              thumbsDown: Math.max(0, newThumbsDown),
              userReaction: newUserReaction,
            },
          };
        };

        // Target is a top-level comment
        if (itemType === 'comment' && comment.id === itemId) {
          return updateReaction(comment) as CommentProps;
        }

        // Target is a reply or a nested reply
        if (comment.replies) {
          const updateNestedReplies = (replies: ReplyProps[], currentGrandParentId: string): ReplyProps[] => {
            return replies.map(reply => {
              // Target is a direct reply to the comment
              if (itemType === 'reply' && reply.id === itemId && commentIdForReply === currentGrandParentId) {
                return updateReaction(reply) as ReplyProps;
              }
              // Recursively update nested replies
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


  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment: CommentProps = {
      id: `c${Date.now()}`,
      userName: 'Usuário Atual', 
      userAvatarUrl: 'https://placehold.co/40x40.png?text=UA',
      dataAIAvatarHint: 'current user',
      timestamp: 'Agora mesmo',
      text: newCommentText,
      reactions: { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: [],
    };
    setLocalCommentsData(prevComments => [newComment, ...prevComments]);
    setNewCommentText('');
  };

  const handleAddReply = (e: FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !replyingTo) return;

    const newReply: ReplyProps = {
      id: `r${Date.now()}`,
      userName: 'Usuário Atual',
      userAvatarUrl: 'https://placehold.co/32x32.png?text=UA',
      dataAIAvatarHint: 'current user',
      timestamp: 'Agora mesmo',
      text: newReplyText,
      reactions: { thumbsUp: 0, thumbsDown: 0, userReaction: null },
      replies: [],
    };

    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        // Replying to a top-level comment
        if (replyingTo.type === 'comment' && comment.id === replyingTo.parentId) {
          return { ...comment, replies: [newReply, ...(comment.replies || [])] };
        } 
        // Replying to a reply (nested reply)
        else if (replyingTo.type === 'reply' && comment.id === replyingTo.grandParentId) {
          const addNestedReply = (replies: ReplyProps[]): ReplyProps[] => {
            return replies.map(reply => {
              if (reply.id === replyingTo.parentId) {
                return { ...reply, replies: [newReply, ...(reply.replies || [])] };
              }
              if (reply.replies) { // Recursively search in deeper replies
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


  const renderReplies = (replies: ReplyProps[] | undefined, commentIdForReply: string, depth = 0) => {
    if (!replies || replies.length === 0) return null;
    const MAX_DEPTH = 1; // Allow one level of nested replies (reply to a reply)

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
                <p className="text-base mt-0.5">{reply.text}</p>
                <div className="flex items-center mt-1 space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-0 h-auto text-xs hover:bg-transparent focus:bg-transparent ${reply.reactions.userReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary focus:text-primary'}`}
                    onClick={() => handleItemReaction(reply.id, 'thumbsUp', 'reply', commentIdForReply)}
                  >
                    <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                    {reply.reactions.thumbsUp > 0 ? reply.reactions.thumbsUp : ''}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-0 h-auto text-xs hover:bg-transparent focus:bg-transparent ${reply.reactions.userReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive focus:text-destructive'}`}
                    onClick={() => handleItemReaction(reply.id, 'thumbsDown', 'reply', commentIdForReply)}
                  >
                    <ThumbsDown className={`mr-1 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
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
        <Avatar className="h-10 w-10">
          {userAvatarUrl ? <AvatarImage src={userAvatarUrl as string} alt={userName} data-ai-hint={dataAIAvatarHint} /> : null}
          <AvatarFallback>
            {userName ? userName.substring(0,2).toUpperCase() : <UserCircle className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex justify-between items-start w-full">
            <div>
                <PostCardTitleUI className="text-base font-headline">{userName}</PostCardTitleUI>
                {userLocation && <p className="text-xs text-muted-foreground">{userLocation}</p>}
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap pl-2">{timestamp}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-1 text-base leading-relaxed">{displayedText}</p>
        {needsTruncation && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs text-primary mb-3"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
          >
            {isTextExpanded ? 'Ver menos.' : 'Ver mais...'}
          </Button>
        )}
        {imageUrl && (
          <div className="relative aspect-square rounded-lg overflow-hidden border">
            <Image
              src={imageUrl}
              alt="Post image"
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={dataAIImageHint || "social media post"}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between p-2 pt-1 border-t border-border/50">
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePostReactionClick('thumbsUp')}
                className={`p-1.5 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                aria-label="Curtir"
            >
                <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                {localPostReactions.thumbsUp > 0 && <span className="ml-1 text-xs tabular-nums">({localPostReactions.thumbsUp})</span>}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePostReactionClick('thumbsDown')}
                className={`p-1.5 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                aria-label="Não curtir"
            >
                <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                 {localPostReactions.thumbsDown > 0 && <span className="ml-1 text-xs tabular-nums">({localPostReactions.thumbsDown})</span>}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1.5 h-auto" onClick={() => setIsSheetOpen(true)}>
                <MessageSquare className="h-5 w-5" />
                {localCommentsData.length > 0 && <span className="ml-1 text-xs tabular-nums">({localCommentsData.length})</span>}
            </Button>
            
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1.5 h-auto">
                <Share2 className="h-5 w-5" />
            </Button>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary p-1.5 h-auto">
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
            <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
                <SheetHeader className="p-4 border-b border-border flex flex-row justify-center items-center relative">
                    <SheetTitle className="sr-only">Comentários e Reações do Post</SheetTitle>
                    <div className="flex items-center justify-center gap-4 py-1">
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePostReactionClick('thumbsUp')}
                        className={`p-1 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        aria-label="Curtir"
                        >
                        <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                        <span className="ml-1 text-xs tabular-nums">({localPostReactions.thumbsUp})</span>
                        </Button>
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePostReactionClick('thumbsDown')}
                        className={`p-1 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                        aria-label="Não curtir"
                        >
                        <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                        <span className="ml-1 text-xs tabular-nums">({localPostReactions.thumbsDown})</span>
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
                        <p className="text-base mt-1">{comment.text}</p>
                        <div className="flex items-center mt-1.5 space-x-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-0 h-auto text-xs hover:bg-transparent focus:bg-transparent ${comment.reactions.userReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground hover:text-primary focus:text-primary'}`}
                                onClick={() => handleItemReaction(comment.id, 'thumbsUp', 'comment')}
                            >
                            <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                            {comment.reactions.thumbsUp > 0 ? comment.reactions.thumbsUp : ''}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-0 h-auto text-xs hover:bg-transparent focus:bg-transparent ${comment.reactions.userReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive focus:text-destructive'}`}
                                onClick={() => handleItemReaction(comment.id, 'thumbsDown', 'comment')}
                            >
                            <ThumbsDown className={`mr-1 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                            {comment.reactions.thumbsDown > 0 ? comment.reactions.thumbsDown : ''}
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
                        <Button type="submit" size="icon" className="rounded-lg h-10 w-10 shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                        </form>
                    )}
                    {renderReplies(comment.replies, comment.id)}
                    </div>
                ))}
                </div>

                <div className="p-4 border-t border-border bg-background">
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
                </div>

                <div className="p-4 border-t border-border bg-background">
                <div className="h-[50px] bg-muted/30 rounded flex items-center justify-center text-sm text-muted-foreground">
                    Espaço para Publicidade AdMob (Ex: 320x50)
                </div>
                </div>
            </SheetContent>
        </Sheet>
    </Card>

    <AlertDialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sinalizar Conteúdo Inadequado</AlertDialogTitle>
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
    </>
  );
}



'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle as PostCardTitleUI } from '@/components/ui/card'; // Renamed CardTitle to avoid conflict
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, UserCircle, Send } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Added SheetTitle
import { Separator } from '@/components/ui/separator';

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
  heart: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
}


export interface PostCardProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
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
  grandParentId?: string;
}


export default function PostCard({
  id: postId,
  userName,
  userAvatarUrl,
  dataAIAvatarHint,
  timestamp,
  text,
  imageUrl,
  dataAIImageHint,
  reactions: initialReactions,
  commentsData: initialCommentsData,
}: PostCardProps) {
  const [currentUserPostReaction, setCurrentUserPostReaction] = useState<'thumbsUp' | 'thumbsDown' | null>(null);
  const [localPostReactions, setLocalPostReactions] = useState(initialReactions);

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
    commentId?: string,
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
          const updateNestedReplies = (replies: ReplyProps[]): ReplyProps[] => {
            return replies.map(reply => {
              if (itemType === 'reply' && reply.id === itemId) {
                return updateReaction(reply) as ReplyProps;
              }
              if (reply.replies) {
                return { ...reply, replies: updateNestedReplies(reply.replies) };
              }
              return reply;
            });
          };
          return { ...comment, replies: updateNestedReplies(comment.replies) };
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
        if (replyingTo.type === 'comment' && comment.id === replyingTo.parentId) {
          return { ...comment, replies: [newReply, ...(comment.replies || [])] };
        } else if (replyingTo.type === 'reply' && comment.id === replyingTo.grandParentId) {
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
                <p className="text-sm mt-0.5">{reply.text}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-xs text-muted-foreground hover:text-primary hover:bg-transparent focus:bg-transparent"
                    onClick={() => handleItemReaction(reply.id, 'thumbsUp', 'reply', commentIdForReply)}
                  >
                    <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsUp' ? 'fill-primary text-primary' : ''}`} />
                    {reply.reactions.thumbsUp > 0 ? reply.reactions.thumbsUp : ''}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-xs text-muted-foreground hover:text-destructive hover:bg-transparent focus:bg-transparent"
                    onClick={() => handleItemReaction(reply.id, 'thumbsDown', 'reply', commentIdForReply)}
                  >
                    <ThumbsDown className={`mr-1 h-3.5 w-3.5 ${reply.reactions.userReaction === 'thumbsDown' ? 'fill-destructive text-destructive' : ''}`} />
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
                          setReplyingTo({ type: 'reply', parentId: reply.id, grandParentId: commentIdForReply });
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
                  className="rounded-lg flex-grow h-9 bg-background/70 text-sm"
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
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar>
          {userAvatarUrl ? <AvatarImage src={userAvatarUrl as string} alt={userName} data-ai-hint={dataAIAvatarHint} /> : null}
          <AvatarFallback>
            <UserCircle className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <PostCardTitleUI className="text-base font-headline">{userName}</PostCardTitleUI>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-3 text-sm leading-relaxed">{text}</p>
        {imageUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden border">
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
      <CardFooter className="flex justify-end p-4 border-t border-border">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
              <MessageSquare className="mr-2 h-4 w-4" /> {localCommentsData.length} Comentários
            </Button>
          </SheetTrigger>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md ml-2">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>

          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
            <SheetHeader className="p-4 border-b border-border flex flex-row justify-center items-center relative">
              <SheetTitle className="sr-only">Comentários e Reações do Post</SheetTitle>
              <div className="flex items-center justify-center gap-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePostReactionClick('thumbsUp')}
                  className={`p-1 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground'}`}
                  aria-label="Curtir"
                >
                  <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                  <span className="ml-1 text-xs">({localPostReactions.thumbsUp})</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePostReactionClick('thumbsDown')}
                  className={`p-1 h-auto hover:bg-transparent focus:bg-transparent ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground'}`}
                  aria-label="Não curtir"
                >
                  <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                  <span className="ml-1 text-xs">({localPostReactions.thumbsDown})</span>
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {localCommentsData.length > 0 && <Separator />}

              <div className="space-y-3">
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
                        <p className="text-sm mt-1">{comment.text}</p>
                        <div className="flex items-center mt-1.5 space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-xs text-muted-foreground hover:text-primary hover:bg-transparent focus:bg-transparent"
                            onClick={() => handleItemReaction(comment.id, 'thumbsUp', 'comment')}
                          >
                            <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsUp' ? 'fill-primary text-primary' : ''}`} />
                             {comment.reactions.thumbsUp > 0 ? comment.reactions.thumbsUp : ''}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-xs text-muted-foreground hover:text-destructive hover:bg-transparent focus:bg-transparent"
                            onClick={() => handleItemReaction(comment.id, 'thumbsDown', 'comment')}
                          >
                            <ThumbsDown className={`mr-1 h-3.5 w-3.5 ${comment.reactions.userReaction === 'thumbsDown' ? 'fill-destructive text-destructive' : ''}`} />
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
                                setReplyingTo({ type: 'comment', parentId: comment.id });
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
            </div>
            
            <div className="p-4 border-t border-border bg-background">
                 <form onSubmit={handleAddComment} className="flex gap-2 items-start">
                    <Avatar className="mt-1">
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
                    <Button type="submit" size="icon" className="rounded-lg shrink-0">
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
      </CardFooter>
    </Card>
  );
}


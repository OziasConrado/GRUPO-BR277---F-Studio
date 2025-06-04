
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, UserCircle, Send, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetTrigger } from '@/components/ui/sheet'; // SheetTrigger ADICIONADO AQUI
import { Separator } from '@/components/ui/separator';

export interface ReplyReactions {
  thumbsUp: number;
}

export interface ReplyProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
  reactions: ReplyReactions;
  userHasReacted?: boolean;
  replies?: ReplyProps[]; 
}

export interface CommentReactions {
  thumbsUp: number;
}
export interface CommentProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
  reactions: CommentReactions;
  userHasReacted?: boolean;
  replies?: ReplyProps[];
}

export interface PostReactions {
  thumbsUp: number;
  thumbsDown: number;
  // Other emojis removed as per request
  heart: number; // Keep for data structure consistency, though not displayed via dedicated buttons
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

type PostReactionType = 'thumbsUp' | 'thumbsDown';


interface ReplyingToInfo {
  type: 'comment' | 'reply';
  parentId: string; // commentId if type is 'comment', or replyId if type is 'reply'
  grandParentId?: string; // commentId if replying to a reply
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
  const [currentUserPostReaction, setCurrentUserPostReaction] = useState<PostReactionType | null>(null);
  const [localReactions, setLocalReactions] = useState(initialReactions);
  const [localCommentsData, setLocalCommentsData] = useState<CommentProps[]>(initialCommentsData.map(c => ({
    ...c,
    reactions: c.reactions || { thumbsUp: 0 },
    replies: c.replies?.map(r => ({ ...r, reactions: r.reactions || { thumbsUp: 0 } })) || []
  })));

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);
  const [newReplyText, setNewReplyText] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handlePostReactionClick = (reactionType: PostReactionType) => {
    setLocalReactions(prevReactions => {
      const newReactions = { ...prevReactions };
      // If clicking the same reaction, un-react
      if (currentUserPostReaction === reactionType) {
        newReactions[reactionType]--;
        setCurrentUserPostReaction(null);
      } else {
        // If switching reaction or reacting for the first time
        if (currentUserPostReaction) {
          newReactions[currentUserPostReaction]--; // Decrement old reaction
        }
        newReactions[reactionType]++; // Increment new reaction
        setCurrentUserPostReaction(reactionType);
      }
      return newReactions;
    });
  };

  const handleToggleCommentReaction = useCallback((commentId: string) => {
    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const newReactionCount = comment.userHasReacted
            ? comment.reactions.thumbsUp - 1
            : comment.reactions.thumbsUp + 1;
          return {
            ...comment,
            reactions: { thumbsUp: newReactionCount < 0 ? 0 : newReactionCount },
            userHasReacted: !comment.userHasReacted,
          };
        }
        return comment;
      })
    );
  }, []);

  const handleToggleReplyReaction = useCallback((commentId: string, replyId: string, parentReplyId?: string) => {
    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const updateReplies = (replies: ReplyProps[] | undefined, targetReplyId: string, targetParentReplyId?: string): ReplyProps[] | undefined => {
            return replies?.map(reply => {
              if (reply.id === targetReplyId && !targetParentReplyId) { // Direct reply to comment
                const newReactionCount = reply.userHasReacted
                  ? reply.reactions.thumbsUp - 1
                  : reply.reactions.thumbsUp + 1;
                return {
                  ...reply,
                  reactions: { thumbsUp: newReactionCount < 0 ? 0 : newReactionCount },
                  userHasReacted: !reply.userHasReacted,
                };
              } else if (reply.replies && reply.id === targetParentReplyId) { // This reply is the parent of the target reply
                 return { ...reply, replies: updateReplies(reply.replies, targetReplyId) };
              } else if (reply.replies) { // Check deeper nested replies (though UI might only show one level of reply-to-reply)
                 return { ...reply, replies: updateReplies(reply.replies, targetReplyId, targetParentReplyId) };
              }
              return reply;
            });
          };
          
          return {
            ...comment,
            replies: updateReplies(comment.replies, replyId, parentReplyId),
          };
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
      reactions: { thumbsUp: 0 },
      userHasReacted: false,
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
      reactions: { thumbsUp: 0 },
      userHasReacted: false,
      replies: [],
    };

    setLocalCommentsData(prevComments =>
      prevComments.map(comment => {
        if (replyingTo.type === 'comment' && comment.id === replyingTo.parentId) {
          return { ...comment, replies: [newReply, ...(comment.replies || [])] };
        } else if (replyingTo.type === 'reply' && comment.id === replyingTo.grandParentId) {
          // Function to add reply to a nested reply
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


  const renderReplies = (replies: ReplyProps[] | undefined, commentId: string, depth = 0) => {
    if (!replies || replies.length === 0) return null;
    const MAX_DEPTH = 1; // Allow replying to a comment, and replying to that reply.

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
                <div className="flex items-center mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                    onClick={() => handleToggleReplyReaction(commentId, reply.id, depth > 0 ? replies.find(r => r.replies?.includes(reply))?.id : undefined)}
                  >
                    <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${reply.userHasReacted ? 'fill-primary text-primary' : ''}`} />
                    {reply.reactions.thumbsUp > 0 ? reply.reactions.thumbsUp : ''}
                  </Button>
                  {depth < MAX_DEPTH && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs text-primary ml-2"
                      onClick={() => {
                        if (replyingTo?.type === 'reply' && replyingTo.parentId === reply.id) {
                          setReplyingTo(null);
                          setNewReplyText('');
                        } else {
                          setReplyingTo({ type: 'reply', parentId: reply.id, grandParentId: commentId });
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
            {/* Recursive call for nested replies, controlled by depth */}
            {depth < MAX_DEPTH && renderReplies(reply.replies, commentId, depth + 1)}
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
          <CardTitle className="text-base font-headline">{userName}</CardTitle>
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

          <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
            <SheetHeader className="p-4 border-b border-border">
              <div className="flex justify-between items-center mb-2">
                <SheetTitle className="font-headline">Reações e Comentários</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <SheetDescription className="text-xs">Reaja ao post e veja o que outros estão dizendo.</SheetDescription>

              <div className="flex items-center justify-center gap-4 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePostReactionClick('thumbsUp')}
                  className={`p-1 h-auto ${currentUserPostReaction === 'thumbsUp' ? 'text-primary' : 'text-muted-foreground'}`}
                  aria-label="Curtir"
                >
                  <ThumbsUp className={`h-5 w-5 ${currentUserPostReaction === 'thumbsUp' ? 'fill-primary' : ''}`} />
                  <span className="ml-1 text-xs">({localReactions.thumbsUp})</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePostReactionClick('thumbsDown')}
                  className={`p-1 h-auto ${currentUserPostReaction === 'thumbsDown' ? 'text-destructive' : 'text-muted-foreground'}`}
                  aria-label="Não curtir"
                >
                  <ThumbsDown className={`h-5 w-5 ${currentUserPostReaction === 'thumbsDown' ? 'fill-destructive' : ''}`} />
                  <span className="ml-1 text-xs">({localReactions.thumbsDown})</span>
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              <form onSubmit={handleAddComment} className="flex gap-2 items-start sticky top-0 bg-background/80 backdrop-blur-sm p-2 -mx-2 z-10 rounded-b-lg">
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
                        <div className="flex items-center mt-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleToggleCommentReaction(comment.id)}
                          >
                            <ThumbsUp className={`mr-1 h-3.5 w-3.5 ${comment.userHasReacted ? 'fill-primary text-primary' : ''}`} />
                             {comment.reactions.thumbsUp > 0 ? comment.reactions.thumbsUp : ''}
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs text-primary ml-2"
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
            
            <div className="p-4 border-t border-border">
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

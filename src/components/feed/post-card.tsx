
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, Heart, Laugh, MessageSquare, Share2, UserCircle, Send, Sparkles, Frown, Annoyed, X } from 'lucide-react'; // Added ThumbsDown, Sparkles, Frown, Annoyed, X
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export interface ReplyProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
}

export interface CommentProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  timestamp: string;
  text: string;
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

type ReactionType = keyof PostReactions;

const reactionIcons: Record<ReactionType, React.ElementType> = {
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  heart: Heart,
  laugh: Laugh,
  wow: Sparkles,
  sad: Frown,
  angry: Annoyed,
};

const reactionLabels: Record<ReactionType, string> = {
  thumbsUp: 'Like',
  thumbsDown: 'Dislike',
  heart: 'Amei',
  laugh: 'Haha',
  wow: 'Uau',
  sad: 'Triste',
  angry: 'Grr',
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
  const [currentUserReaction, setCurrentUserReaction] = useState<ReactionType | null>(null);
  const [localReactions, setLocalReactions] = useState(initialReactions);
  const [localCommentsData, setLocalCommentsData] = useState<CommentProps[]>(initialCommentsData);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // Stores comment.id
  const [newReplyText, setNewReplyText] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleReactionClick = (reactionType: ReactionType) => {
    setLocalReactions(prevReactions => {
      const newReactions = { ...prevReactions };
      if (currentUserReaction === reactionType) {
        newReactions[reactionType]--;
        setCurrentUserReaction(null);
      } else {
        if (currentUserReaction) {
          newReactions[currentUserReaction]--; 
        }
        newReactions[reactionType]++; 
        setCurrentUserReaction(reactionType);
      }
      return newReactions;
    });
  };

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
      replies: [],
    };
    setLocalCommentsData(prevComments => [newComment, ...prevComments]);
    setNewCommentText('');
  };

  const handleAddReply = (e: FormEvent, commentId: string) => {
    e.preventDefault();
    if (!newReplyText.trim() || !replyingTo) return;
    const newReply: ReplyProps = {
      id: `r${Date.now()}`,
      userName: 'Usuário Atual', 
      userAvatarUrl: 'https://placehold.co/40x40.png?text=UA',
      dataAIAvatarHint: 'current user',
      timestamp: 'Agora mesmo',
      text: newReplyText,
    };
    setLocalCommentsData(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [newReply, ...(comment.replies || [])] }
          : comment
      )
    );
    setNewReplyText('');
    setReplyingTo(null);
  };

  const mainReactions: ReactionType[] = ['thumbsUp', 'thumbsDown'];
  const emojiReactions: ReactionType[] = ['heart', 'laugh', 'wow', 'sad', 'angry'];


  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl glassmorphic overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar>
          {userAvatarUrl ? <AvatarImage src={userAvatarUrl} alt={userName} data-ai-hint={dataAIAvatarHint} /> : null}
          <AvatarFallback>
            <UserCircle className="h-6 w-6"/>
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
              style={{objectFit: 'cover'}}
              data-ai-hint={dataAIImageHint || "social media post"}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end p-4 border-t border-white/10 dark:border-slate-700/10">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
              <MessageSquare className="mr-2 h-4 w-4" /> {localCommentsData.length} Comentários
            </Button>
          </SheetTrigger>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md ml-2">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        
          <SheetContent side="bottom" className="h-[90vh] flex flex-col glassmorphic p-0">
            <SheetHeader className="p-4 border-b border-white/20 dark:border-slate-700/20">
              <div className="flex justify-between items-center mb-2">
                <SheetTitle className="font-headline">Reações e Comentários</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <SheetDescription className="text-xs">Reaja ao post e veja o que outros estão dizendo.</SheetDescription>
              
              <div className="flex flex-wrap justify-center gap-2 pt-3">
                {mainReactions.map(reaction => {
                  const IconComponent = reactionIcons[reaction];
                  const isActive = currentUserReaction === reaction;
                  return (
                    <Button
                      key={reaction}
                      variant={isActive ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleReactionClick(reaction)}
                      className={`rounded-full flex-grow sm:flex-grow-0 ${isActive ? 'border-primary text-primary' : ''}`}
                    >
                      <IconComponent className={`mr-1.5 h-4 w-4 ${isActive ? (reaction === 'thumbsDown' ? 'fill-destructive text-destructive' : 'fill-primary text-primary') : ''}`} />
                      {reactionLabels[reaction]} ({localReactions[reaction]})
                    </Button>
                  );
                })}
              </div>
              <div className="flex justify-center gap-1 pt-2">
                {emojiReactions.map(reaction => {
                  const IconComponent = reactionIcons[reaction];
                  const isActive = currentUserReaction === reaction;
                  return (
                    <Button
                      key={reaction}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => handleReactionClick(reaction)}
                      className={`rounded-full relative group ${isActive ? 'border-primary text-primary' : ''}`}
                      title={reactionLabels[reaction]}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 
                        (reaction === 'heart' ? 'fill-rose-500 text-rose-500' : 
                         reaction === 'laugh' ? 'fill-amber-500 text-amber-500' : 
                         reaction === 'wow' ? 'fill-sky-500 text-sky-500' : 
                         reaction === 'sad' ? 'fill-indigo-500 text-indigo-500' : 
                         reaction === 'angry' ? 'fill-red-600 text-red-600' : 'fill-primary') 
                        : ''}`} />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {localReactions[reaction]}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </SheetHeader>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              <form onSubmit={handleAddComment} className="flex gap-2 items-start sticky top-0 bg-card/80 dark:bg-card/80 backdrop-blur-sm p-2 -mx-2 z-10 rounded-b-lg">
                <Avatar className="mt-1">
                  <AvatarImage src="https://placehold.co/40x40.png?text=UA" alt="Usuário Atual" data-ai-hint="current user" />
                  <AvatarFallback>UA</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newCommentText}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCommentText(e.target.value)}
                  className="rounded-lg flex-grow bg-background/70 min-h-[40px] resize-none"
                  rows={1}
                />
                <Button type="submit" size="icon" className="rounded-lg shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {localCommentsData.length > 0 && <Separator />}
              
              <div className="space-y-3">
                {localCommentsData.map(comment => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatarUrl} alt={comment.userName} data-ai-hint={comment.dataAIAvatarHint} />
                        <AvatarFallback>
                          {comment.userName.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow p-3 rounded-lg bg-muted/30 dark:bg-slate-700/30">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold font-headline">{comment.userName}</p>
                          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                         <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-xs text-primary mt-1"
                          onClick={() => {
                            if (replyingTo === comment.id) {
                              setReplyingTo(null); 
                              setNewReplyText('');
                            } else {
                              setReplyingTo(comment.id);
                              setNewReplyText(''); // Clear previous reply text
                            }
                          }}
                        >
                          Responder
                        </Button>
                      </div>
                    </div>

                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleAddReply(e, comment.id)} className="flex gap-2 items-start ml-10">
                         <Avatar className="mt-1 h-8 w-8">
                          <AvatarImage src="https://placehold.co/32x32.png?text=UA" alt="Usuário Atual" data-ai-hint="current user" />
                          <AvatarFallback>UA</AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder={`Respondendo a ${comment.userName}...`}
                          value={newReplyText}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewReplyText(e.target.value)}
                          className="rounded-lg flex-grow h-10 bg-background/70"
                          autoFocus
                        />
                        <Button type="submit" size="icon" className="rounded-lg h-10 w-10 shrink-0">
                           <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-10 space-y-2 pt-2 border-l-2 border-muted/50 pl-3">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.userAvatarUrl} alt={reply.userName} data-ai-hint={reply.dataAIAvatarHint} />
                              <AvatarFallback>
                                {reply.userName.substring(0,2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                             <div className="flex-grow p-2 rounded-lg bg-muted/20 dark:bg-slate-700/20">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold font-headline">{reply.userName}</p>
                                <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                              </div>
                              <p className="text-sm mt-0.5">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <SheetFooter className="p-4 border-t border-white/20 dark:border-slate-700/20">
                <SheetClose asChild>
                    <Button type="button" variant="outline" className="w-full rounded-lg">Fechar</Button>
                </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}

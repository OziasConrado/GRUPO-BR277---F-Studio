
'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, Heart, Laugh, MessageSquare, Share2, UserCircle, Send } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
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

export interface PostCardProps {
  id: string;
  userName: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  dataAIImageHint?: string;
  timestamp: string;
  text: string;
  imageUrl?: string | StaticImageData;
  reactions: {
    thumbsUp: number;
    heart: number;
    laugh: number;
  };
  commentsData: CommentProps[];
}

type ReactionType = 'thumbsUp' | 'heart' | 'laugh';

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
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // Stores comment.id
  const [newReplyText, setNewReplyText] = useState('');

  const handleReactionClick = (reactionType: ReactionType) => {
    setLocalReactions(prevReactions => {
      const newReactions = { ...prevReactions };
      if (currentUserReaction === reactionType) {
        // User is un-reacting
        newReactions[reactionType]--;
        setCurrentUserReaction(null);
      } else {
        // User is reacting or changing reaction
        if (currentUserReaction) {
          newReactions[currentUserReaction]--; // Decrement old reaction
        }
        newReactions[reactionType]++; // Increment new reaction
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
      userName: 'Usuário Atual', // Placeholder
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
      userName: 'Usuário Atual', // Placeholder
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
      <CardFooter className="flex flex-col items-start p-4 border-t border-white/10 dark:border-slate-700/10">
        <div className="flex justify-between w-full mb-3">
          <div className="flex space-x-2">
            <Button
              variant={currentUserReaction === 'thumbsUp' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleReactionClick('thumbsUp')}
              className="text-muted-foreground hover:text-primary rounded-md"
            >
              <ThumbsUp className={`mr-2 h-4 w-4 ${currentUserReaction === 'thumbsUp' ? 'text-primary fill-primary' : ''}`} /> 
              {localReactions.thumbsUp}
            </Button>
            <Button
              variant={currentUserReaction === 'heart' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleReactionClick('heart')}
              className="text-muted-foreground hover:text-rose-500 rounded-md"
            >
              <Heart className={`mr-2 h-4 w-4 ${currentUserReaction === 'heart' ? 'text-rose-500 fill-rose-500' : ''}`} /> 
              {localReactions.heart}
            </Button>
            <Button
              variant={currentUserReaction === 'laugh' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleReactionClick('laugh')}
              className="text-muted-foreground hover:text-amber-500 rounded-md"
            >
              <Laugh className={`mr-2 h-4 w-4 ${currentUserReaction === 'laugh' ? 'text-amber-500 fill-amber-500' : ''}`} /> 
              {localReactions.laugh}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md" onClick={() => setShowComments(!showComments)}>
              <MessageSquare className="mr-2 h-4 w-4" /> {localCommentsData.length} Comentários
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
              <Share2 className="mr-2 h-4 w-4" /> Compartilhar
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <Separator />
            <form onSubmit={handleAddComment} className="flex gap-2 items-start">
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
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
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
                            setNewReplyText('');
                          }
                        }}
                      >
                        Responder
                      </Button>
                    </div>
                  </div>

                  {/* Reply Input */}
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
                      />
                      <Button type="submit" size="icon" className="rounded-lg h-10 w-10 shrink-0">
                         <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  )}

                  {/* Replies List */}
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
        )}
      </CardFooter>
    </Card>
  );
}


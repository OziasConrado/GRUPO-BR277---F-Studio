import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Share2, UserCircle } from 'lucide-react';

export interface PostCardProps {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  timestamp: string;
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
}

export default function PostCard({
  userName,
  userAvatarUrl,
  timestamp,
  text,
  imageUrl,
  likes,
  comments,
}: PostCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 shadow-lg rounded-xl glassmorphic overflow-hidden">
      <CardHeader className="flex flex-row items-center space-x-3 p-4">
        <Avatar>
          {userAvatarUrl ? <AvatarImage src={userAvatarUrl} alt={userName} /> : null}
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
              layout="fill"
              objectFit="cover"
              data-ai-hint="social media post"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t border-white/10 dark:border-slate-700/10">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
          <ThumbsUp className="mr-2 h-4 w-4" /> {likes} Curtir
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
          <MessageSquare className="mr-2 h-4 w-4" /> {comments} Comentar
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-md">
          <Share2 className="mr-2 h-4 w-4" /> Compartilhar
        </Button>
      </CardFooter>
    </Card>
  );
}

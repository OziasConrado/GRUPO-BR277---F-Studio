'use client';

import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Instagram, MapPin } from 'lucide-react';

export interface UserProfileData {
  id: string;
  name: string;
  avatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  location?: string;
  bio?: string;
  instagramUsername?: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData | null;
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-background !p-0 flex flex-col !translate-x-0 !translate-y-0"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="shrink-0 p-3 flex flex-row justify-between items-center border-b bg-card">
          <DialogTitle className="text-lg font-semibold font-headline text-foreground">Perfil de {user.name}</DialogTitle>
          <DialogDescription className="sr-only">Exibindo o perfil do usuário {user.name} com informações como biografia e localização.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3 pt-4">
            <Avatar className="h-32 w-32 sm:h-36 sm:w-36 border-4 border-primary/30 shadow-lg">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl as string} alt={user.name} data-ai-hint={user.dataAIAvatarHint} />}
              <AvatarFallback className="text-4xl sm:text-5xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline text-foreground">{user.name}</h1>
              {user.location && (
                <p className="text-base text-muted-foreground flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  {user.location}
                </p>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="bg-card p-4 rounded-xl shadow-md">
              <h2 className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">Biografia</h2>
              <p className="text-base text-foreground/90 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {user.instagramUsername && (
            <div className="pt-2">
            <Button
              asChild
              className="w-full rounded-lg py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 text-white font-semibold shadow-md"
            >
              <a
                href={`https://instagram.com/${user.instagramUsername.replace('@','')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Seguir no Instagram
              </a>
            </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

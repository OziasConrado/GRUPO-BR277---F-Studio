'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, Edit } from 'lucide-react';
import CreatePostModal from '@/components/feed/CreatePostModal';

export default function CreatePost() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentUser) {
    return null; 
  }

  return (
    <>
      <Card
        className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        role="button"
        aria-label="Criar uma nova publicação"
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              {currentUser.photoURL && <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />}
              <AvatarFallback>
                {currentUser.displayName ? currentUser.displayName.substring(0, 1).toUpperCase() : <UserCircle />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <span className="text-muted-foreground">No que você está pensando, {currentUser.displayName?.split(' ')[0] || 'você'}?</span>
            </div>
            <Edit className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

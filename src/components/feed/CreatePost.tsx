
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, Edit } from 'lucide-react';

export default function CreatePost() {
  const { currentUser } = useAuth();

  const handleCreatePostClick = () => {
    // Futuramente, isso pode abrir um modal de criação de post completo.
    // Por enquanto, apenas simula a ação.
    console.log("Abrir modal de criação de post...");
  };

  if (!currentUser) {
    return null; // Não mostra o criador de post se o usuário não estiver logado
  }

  return (
    <Card 
      className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCreatePostClick}
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
  );
}

'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image as ImageIcon, Send, Loader2, X, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { currentUser, firestore, uploadFile } = useAuth();
  const { toast } = useToast();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!postText.trim() && !imageFile) {
      toast({ variant: 'destructive', description: 'Você precisa escrever algo ou adicionar uma imagem.' });
      return;
    }
    if (!currentUser || !firestore || !uploadFile) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | undefined;
      if (imageFile) {
        const filePath = `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        uploadedImageUrl = await uploadFile(imageFile, filePath);
      }
      
      const userProfile = currentUser.providerData[0];

      await addDoc(collection(firestore, 'posts'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuário Anônimo',
        userAvatarUrl: currentUser.photoURL,
        text: postText,
        uploadedImageUrl: uploadedImageUrl,
        timestamp: serverTimestamp(),
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        deleted: false,
      });

      toast({ title: 'Sucesso!', description: 'Sua publicação foi postada.' });
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar a publicação.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Por favor, selecione uma imagem.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'Imagem muito grande', description: 'O tamanho máximo da imagem é 5MB.' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setPostText('');
    removeImage();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center font-headline text-xl">Criar Publicação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <Avatar>
              {currentUser?.photoURL && <AvatarImage src={currentUser.photoURL} />}
              <AvatarFallback>{currentUser?.displayName ? currentUser.displayName.charAt(0) : <UserCircle />}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{currentUser?.displayName}</span>
          </div>
          <Textarea
            placeholder="No que você está pensando?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          {imagePreview && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image src={imagePreview} alt="Preview da imagem" fill style={{objectFit: "cover"}} />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full" onClick={removeImage}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="mr-2 h-4 w-4"/>
                Adicionar Foto
            </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

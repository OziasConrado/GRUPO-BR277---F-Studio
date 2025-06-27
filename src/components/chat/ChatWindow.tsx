
'use client';

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Paperclip, Mic } from "lucide-react";
import ChatMessageItem, { type ChatMessageData } from "./ChatMessageItem";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image'; // For image preview
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { firestore, storage } from '@/lib/firebase/client'; // Import firestore & storage
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  runTransaction,
  increment,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


interface ChatWindowProps {
  onClose: () => void;
}

interface ReplyingToInfo {
  userName: string;
  messageId: string;
  messageText: string;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { currentUser } = useAuth(); // Get current user

  useEffect(() => {
    if (!firestore) {
        toast({ title: "Erro de Conexão", description: "Chat não pôde conectar ao servidor.", variant: "destructive" });
        return;
    }
    const messagesCollection = collection(firestore, 'chatMessages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc')); // Fetch in ascending order

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessageData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const messageTimestamp = data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Agora'; // Fallback for newly sent messages before server timestamp is set

        fetchedMessages.push({
          id: doc.id,
          senderName: data.senderName,
          avatarUrl: data.avatarUrl,
          dataAIAvatarHint: data.dataAIAvatarHint,
          text: data.text,
          imageUrl: data.imageUrl,
          dataAIImageHint: data.dataAIImageHint,
          audioUrl: data.audioUrl,
          file: data.file,
          timestamp: messageTimestamp,
          isCurrentUser: currentUser ? data.userId === currentUser.uid : false,
          reactions: data.reactions,
          replyTo: data.replyTo, // Add replyTo field
          edited: data.edited || false,
        });
      });
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching chat messages: ", error);
      toast({ title: "Erro no Chat", description: "Não foi possível carregar as mensagens.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [currentUser, toast]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, replyingTo]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      toast({ title: "Não Autenticado", description: "Você precisa estar logado para enviar mensagens.", variant: "destructive" });
      return;
    }
    if (!firestore || !storage) {
        toast({ title: "Erro de Conexão", description: "Não é possível enviar mensagem.", variant: "destructive" });
        return;
    }

    if (newMessage.trim() === '' && !selectedImageFile) return;
    
    let imageUrl: string | undefined;
    let fileInfo: { name: string, type: 'image' } | undefined;

    if (selectedImageFile) {
        const uniqueId = `image_${Date.now()}_${selectedImageFile.name}`;
        const storageRef = ref(storage, `chat_images/${currentUser.uid}/${uniqueId}`);
        const snapshot = await uploadBytes(storageRef, selectedImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
        fileInfo = { name: selectedImageFile.name, type: 'image' };
    }

    const messageData: any = {
      userId: currentUser.uid,
      senderName: currentUser.displayName || 'Usuário Anônimo',
      avatarUrl: currentUser.photoURL || `https://placehold.co/40x40.png?text=${currentUser.displayName ? currentUser.displayName.substring(0,1).toUpperCase() : 'U'}`,
      dataAIAvatarHint: 'user avatar',
      text: newMessage.trim() || undefined,
      timestamp: serverTimestamp(),
      reactions: { heart: 0 },
      edited: false,
    };

    if (imageUrl) {
        messageData.imageUrl = imageUrl;
        messageData.dataAIImageHint = "user uploaded chat image";
        messageData.file = fileInfo;
    }

    if (replyingTo) {
        messageData.replyTo = {
            messageId: replyingTo.messageId,
            userName: replyingTo.userName,
            messageText: replyingTo.messageText,
        };
    }

    try {
      await addDoc(collection(firestore, 'chatMessages'), messageData);
    } catch (error) {
      console.error("Error sending message: ", error);
      toast({ title: "Erro ao Enviar", description: "Não foi possível enviar sua mensagem.", variant: "destructive" });
    }

    setNewMessage('');
    setReplyingTo(null);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.rows = 1;
      textareaRef.current.focus();
    }
  };

  const uploadAudioAndSendMessage = async (audioBlob: Blob) => {
    if (!currentUser || !firestore || !storage) {
        toast({ title: "Erro", description: "Não foi possível conectar para enviar o áudio.", variant: "destructive"});
        return;
    }

    const uniqueId = `audio_${Date.now()}.webm`;
    const storageRef = ref(storage, `chat_audio/${currentUser.uid}/${uniqueId}`);

    try {
        const snapshot = await uploadBytes(storageRef, audioBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const messageData = {
            userId: currentUser.uid,
            senderName: currentUser.displayName || 'Usuário Anônimo',
            avatarUrl: currentUser.photoURL || `https://placehold.co/40x40.png?text=${currentUser.displayName ? currentUser.displayName.substring(0,1).toUpperCase() : 'U'}`,
            dataAIAvatarHint: 'user avatar',
            timestamp: serverTimestamp(),
            audioUrl: downloadURL,
            file: { name: "Mensagem de voz", type: 'audio' },
            reactions: { heart: 0 },
        };

        await addDoc(collection(firestore, 'chatMessages'), messageData);

    } catch (error) {
        console.error("Error uploading audio or sending message:", error);
        toast({ variant: "destructive", title: "Erro ao Enviar Áudio", description: "Não foi possível enviar sua mensagem de voz." });
    }
  };


  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: "destructive",
        title: "Não Suportado",
        description: "Seu navegador não suporta gravação de áudio.",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      toast({ title: "Gravando...", description: "Clique no microfone novamente para parar e enviar." });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await uploadAudioAndSendMessage(audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: "Permissão Negada",
        description: "Você precisa permitir o acesso ao microfone para enviar mensagens de voz.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: "Gravação Parada", description: "Enviando áudio..." });
    }
  };

  const toggleRecording = () => {
    if (!currentUser) {
        toast({ title: "Não Autenticado", description: "Você precisa estar logado para gravar áudio.", variant: "destructive" });
        return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Tipo de arquivo não suportado',
        description: 'Por favor, selecione apenas arquivos de imagem (PNG, JPG, WebP).',
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: `O tamanho máximo da imagem é de ${MAX_SIZE_MB}MB.`,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImagePreview = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextareaInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
    const textarea = event.target;
    textarea.style.height = 'auto';
    const newScrollHeight = Math.min(textarea.scrollHeight, 120); // Max height 120px
    textarea.style.height = `${newScrollHeight}px`;
  };

  const handleReply = (messageToReply: ChatMessageData) => {
    setReplyingTo({ 
        userName: messageToReply.senderName,
        messageId: messageToReply.id,
        // Truncate the text for preview
        messageText: messageToReply.text?.substring(0, 50) || (messageToReply.file ? `Mídia: ${messageToReply.file.name}` : 'Mídia')
    });
    setNewMessage('');
    textareaRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleReactionClick = async (messageId: string) => {
    if (!currentUser || !firestore) {
      toast({ variant: 'destructive', title: 'Ação Requer Login' });
      return;
    }

    const messageRef = doc(firestore, 'chatMessages', messageId);
    const reactionRef = doc(firestore, 'chatMessages', messageId, 'userReactions', currentUser.uid);

    try {
      await runTransaction(firestore, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef);
        
        if (reactionDoc.exists()) {
          // User has already reacted with a heart, so remove reaction
          transaction.delete(reactionRef);
          transaction.update(messageRef, { 'reactions.heart': increment(-1) });
        } else {
          // User has not reacted, so add reaction
          transaction.set(reactionRef, { type: 'heart', timestamp: serverTimestamp() });
          // Use set with merge to ensure the reactions object and heart field are created if they don't exist
          transaction.set(messageRef, { reactions: { heart: increment(1) } }, { merge: true });
        }
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast({ variant: 'destructive', title: 'Erro ao Reagir' });
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!firestore || !messageId || !newText.trim()) return;
    const messageRef = doc(firestore, 'chatMessages', messageId);
    try {
        await updateDoc(messageRef, {
            text: newText,
            edited: true,
            editedAt: serverTimestamp(),
        });
        toast({ title: "Mensagem editada com sucesso." });
    } catch (error) {
        console.error("Error editing message:", error);
        toast({ variant: 'destructive', title: 'Erro ao Editar', description: 'Não foi possível salvar a alteração.' });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!firestore || !messageId) return;
    const messageRef = doc(firestore, 'chatMessages', messageId);
    try {
        await deleteDoc(messageRef);
        toast({ title: "Mensagem excluída com sucesso." });
    } catch (error) {
        console.error("Error deleting message:", error);
        toast({ variant: 'destructive', title: 'Erro ao Excluir', description: 'Não foi possível excluir a mensagem.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-background w-full h-full sm:max-w-lg sm:max-h-[90vh] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <header className="p-4 border-b border-primary/50 flex items-center justify-between bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2Fescudo-com-sombra-vetoriozida-300x300.png?alt=media" alt="Comunidade277" data-ai-hint="group chat icon"/>
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold font-headline text-lg">Comunidade277</h3>
              <p className="text-xs text-primary-foreground/80">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-primary-foreground/10">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <ChatMessageItem 
                key={msg.id} 
                message={msg} 
                onReply={handleReply} 
                onReaction={handleReactionClick}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))}
          </div>
        </ScrollArea>

        <footer className="border-t border-border/50 bg-card">
          {replyingTo && (
            <div className="px-3 pt-2 flex justify-between items-center text-xs text-muted-foreground bg-muted/50 border-b">
                <div className="py-1 overflow-hidden">
                    <p>Respondendo a <strong className="text-primary">{replyingTo.userName}</strong></p>
                    <p className="italic truncate">"{replyingTo.messageText}"</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={cancelReply}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
          <div className="p-3">
            {imagePreviewUrl && (
              <div className="relative mb-2 p-2 border rounded-lg bg-muted/30 w-fit">
                <Image src={imagePreviewUrl} alt="Preview" width={80} height={80} className="rounded object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 p-0"
                  onClick={handleRemoveImagePreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="relative flex-grow">
                <Textarea
                  ref={textareaRef}
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={handleTextareaInput}
                  className="rounded-lg bg-background/70 min-h-[44px] max-h-[120px] resize-none text-base p-2.5 pr-20"
                  rows={1}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !currentUser?.isAnonymous) {
                      handleSendMessage(e);
                    }
                  }}
                  disabled={currentUser?.isAnonymous || isRecording}
                />
                <div className="absolute right-1 bottom-1 flex items-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
                  <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9" onClick={handleAttachmentClick} disabled={currentUser?.isAnonymous || isRecording}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  {(newMessage.trim() === '' && !selectedImageFile) ? (
                    <Button type="button" variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-primary h-9 w-9", isRecording && "text-destructive bg-destructive/10 animate-pulse")} onClick={toggleRecording} disabled={currentUser?.isAnonymous}>
                      <Mic className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button type="submit" variant="default" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9" disabled={currentUser?.isAnonymous || isRecording}>
                      <Send className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}


'use client';

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Paperclip, Mic, Smile } from "lucide-react";
import ChatMessageItem, { type ChatMessageData } from "./ChatMessageItem";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  onClose: () => void;
}

const initialMessages: ChatMessageData[] = [
  {
    id: '1',
    senderName: 'João Silva',
    avatarUrl: 'https://placehold.co/40x40.png?text=JS',
    dataAIAvatarHint: 'man portrait',
    text: 'Olá pessoal! Alguma novidade na BR-277 hoje?',
    timestamp: '10:30 AM',
    isCurrentUser: false,
  },
  {
    id: '2',
    senderName: 'Você',
    avatarUrl: 'https://placehold.co/40x40.png?text=EU',
    dataAIAvatarHint: 'current user',
    text: 'Acabei de passar pelo km 150, tudo tranquilo por enquanto.',
    timestamp: '10:32 AM',
    isCurrentUser: true,
  },
  {
    id: '3',
    senderName: 'Ana Souza',
    avatarUrl: 'https://placehold.co/40x40.png?text=AS',
    dataAIAvatarHint: 'woman portrait',
    text: 'Atenção! Neblina forte perto da serra. Cuidado redobrado!',
    timestamp: '10:35 AM',
    isCurrentUser: false,
  },
   {
    id: '4',
    senderName: 'Você',
    avatarUrl: 'https://placehold.co/40x40.png?text=EU',
    dataAIAvatarHint: 'current user',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAIImageHint: 'road fog',
    text: "Confirmo a neblina. Essa foto é de agora:",
    timestamp: '10:38 AM',
    isCurrentUser: true,
  },
  {
    id: '5',
    senderName: 'Carlos Santos',
    avatarUrl: 'https://placehold.co/40x40.png?text=CS',
    dataAIAvatarHint: 'truck driver',
    file: { name: 'Alerta_importante.mp3', type: 'audio'},
    text: "Gravei um áudio sobre um desvio:",
    timestamp: '10:40 AM',
    isCurrentUser: false,
  }
];


export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (newMessage.trim() === '') return;

    const newMsg: ChatMessageData = {
      id: Date.now().toString(),
      senderName: 'Você',
      avatarUrl: 'https://placehold.co/40x40.png?text=EU',
      dataAIAvatarHint: 'current user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };
    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileType: 'image' | 'audio' | 'other' = 'other';
    if (file.type.startsWith('image/')) {
        fileType = 'image';
    } else if (file.type.startsWith('audio/')) {
        fileType = 'audio';
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const newMsg: ChatMessageData = {
            id: Date.now().toString(),
            senderName: 'Você',
            avatarUrl: 'https://placehold.co/40x40.png?text=EU',
            dataAIAvatarHint: 'current user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            ...(fileType === 'image' && { imageUrl: e.target?.result as string, dataAIImageHint: 'uploaded image' }),
            file: { name: file.name, type: fileType }
        };
        setMessages(prevMessages => [...prevMessages, newMsg]);
    };

    if (fileType === 'image') {
        reader.readAsDataURL(file);
    } else {
        // For audio and other files, we don't need to read the content for this simulation
        const newMsg: ChatMessageData = {
            id: Date.now().toString(),
            senderName: 'Você',
            avatarUrl: 'https://placehold.co/40x40.png?text=EU',
            dataAIAvatarHint: 'current user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            file: { name: file.name, type: fileType }
        };
        setMessages(prevMessages => [...prevMessages, newMsg]);
    }
    
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMicClick = () => {
    toast({
      title: "Gravação de Áudio",
      description: "Funcionalidade de gravação de áudio ainda não implementada.",
    });
  };

  const handleEmojiClick = () => {
    toast({
      title: "Seleção de Emoji",
      description: "Funcionalidade de emoji ainda não implementada.",
    });
  }


  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-background w-full h-full sm:max-w-lg sm:max-h-[90vh] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <header className="p-4 border-b border-border/50 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=CG" alt="Chat em Grupo" data-ai-hint="group chat icon"/>
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold font-headline text-lg">Chat da Comunidade</h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t border-border/50 bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={handleEmojiClick}>
              <Smile className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow rounded-full px-4 py-2 bg-background/70 focus-visible:ring-primary h-11"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
            />
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, audio/*" className="hidden" />
            <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={handleAttachmentClick}>
              <Paperclip className="h-5 w-5" />
            </Button>
            {newMessage.trim() === '' ? (
              <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={handleMicClick}>
                <Mic className="h-5 w-5" />
              </Button>
            ) : (
              <Button type="submit" variant="default" size="icon" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Send className="h-5 w-5" />
              </Button>
            )}
          </form>
        </footer>
      </div>
    </div>
  );
}

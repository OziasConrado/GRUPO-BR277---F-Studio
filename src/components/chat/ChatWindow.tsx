
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
import { useNotification } from '@/contexts/NotificationContext';
import Image from 'next/image'; // For image preview
import { cn } from '@/lib/utils';

const MOCK_CHAT_USER_NAMES = [
    'João Silva', 'Você', 'Ana Souza', 'Carlos Santos', 'Ozias Conrado'
];

const renderTextWithMentionsForChat = (text: string, knownUsers: string[]): React.ReactNode[] => {
  if (!text) return [text];
  const escapedUserNames = knownUsers.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const mentionRegex = new RegExp(`(@(?:${escapedUserNames.join('|')}))(?=\\s|\\p{P}|$)`, 'gu');
  
  const parts = text.split(mentionRegex);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith('@')) {
      const mentionedName = part.substring(1);
      if (knownUsers.includes(mentionedName)) {
        elements.push(<strong key={`${index}-${part}`} className="text-accent font-semibold cursor-pointer hover:underline">{part}</strong>);
      } else {
        elements.push(part); 
      }
    } else {
      elements.push(part);
    }
  });
  return elements;
};

const initialMessagesRaw: Omit<ChatMessageData, 'textElements'>[] = [
  {
    id: '1',
    senderName: 'João Silva',
    avatarUrl: 'https://placehold.co/40x40.png?text=JS',
    dataAIAvatarHint: 'man portrait',
    text: 'Olá pessoal! Alguma novidade na BR-277 hoje? Alguém viu o @Ozias Conrado por aí?',
    timestamp: '10:30 AM',
    isCurrentUser: false,
  },
  {
    id: '2',
    senderName: 'Você',
    avatarUrl: 'https://placehold.co/40x40.png?text=EU',
    dataAIAvatarHint: 'current user',
    text: 'Acabei de passar pelo km 150, tudo tranquilo por enquanto. @João Silva, sem sinal dele.',
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
    imageUrl: 'https://placehold.co/400x300.png', // Placeholder for an uploaded image
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

const processMessagesWithMentions = (messages: Omit<ChatMessageData, 'textElements'>[]): ChatMessageData[] => {
    return messages.map(msg => ({
        ...msg,
        textElements: msg.text ? renderTextWithMentionsForChat(msg.text, MOCK_CHAT_USER_NAMES) : undefined,
    }));
};

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>(() => processMessagesWithMentions(initialMessagesRaw));
  const [newMessage, setNewMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { incrementNotificationCount } = useNotification();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const checkForMentionsAndNotifyChat = (textToCheck: string) => {
    MOCK_CHAT_USER_NAMES.forEach(name => {
      const mentionRegex = new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|\\p{P}|$)`, 'u');
      if (mentionRegex.test(textToCheck)) {
        console.log(`Chat Mentioned: ${name}`);
        incrementNotificationCount();
      }
    });
  };

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (newMessage.trim() === '' && !selectedImageFile) return;

    if(newMessage.trim()) checkForMentionsAndNotifyChat(newMessage);

    const newMsgData: ChatMessageData = {
      id: Date.now().toString(),
      senderName: 'Você',
      avatarUrl: 'https://placehold.co/40x40.png?text=EU',
      dataAIAvatarHint: 'current user',
      text: newMessage.trim() || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
      textElements: newMessage.trim() ? renderTextWithMentionsForChat(newMessage.trim(), MOCK_CHAT_USER_NAMES) : undefined,
      ...(selectedImageFile && imagePreviewUrl && { imageUrl: imagePreviewUrl, dataAIImageHint: 'uploaded image' }),
      file: selectedImageFile ? { name: selectedImageFile.name, type: 'image' as const } : undefined,
    };
    setMessages(prevMessages => [...prevMessages, newMsgData]);
    
    setNewMessage('');
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.rows = 1;
      textareaRef.current.focus();
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
  
  const handleMicClick = () => {
    toast({
      title: "Gravação de Áudio",
      description: "Funcionalidade de gravação de áudio (máx. 1 minuto) ainda não implementada.",
    });
  };

  const handleTextareaInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
    const textarea = event.target;
    textarea.style.height = 'auto';
    const newScrollHeight = Math.min(textarea.scrollHeight, 120); // Max height 120px
    textarea.style.height = `${newScrollHeight}px`;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-background w-full h-full sm:max-w-lg sm:max-h-[90vh] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <header className="p-4 border-b border-primary/50 flex items-center justify-between bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png?text=CG" alt="Chat277" data-ai-hint="group chat icon"/>
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold font-headline text-lg">Chat277</h3>
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
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t border-border/50 bg-card">
          {imagePreviewUrl && (
            <div className="relative mb-2 p-2 border rounded-lg bg-muted/30 w-fit"> {/* w-fit to shrink to content */}
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
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="absolute right-1 bottom-1 flex items-center">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9" onClick={handleAttachmentClick}>
                  <Paperclip className="h-5 w-5" />
                </Button>
                {(newMessage.trim() === '' && !selectedImageFile) ? (
                  <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-9 w-9" onClick={handleMicClick}>
                    <Mic className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button type="submit" variant="default" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9">
                    <Send className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}

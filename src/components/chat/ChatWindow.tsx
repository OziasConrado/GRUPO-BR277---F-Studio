
'use client';

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, useMemo } from 'react';
import React from 'react'; // Import React for React.ReactNode
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Paperclip, Mic, Smile } from "lucide-react";
import ChatMessageItem, { type ChatMessageData } from "./ChatMessageItem";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext'; // Import notification context

interface ChatWindowProps {
  onClose: () => void;
}

// Mock user names for mention detection
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

const processMessagesWithMentions = (messages: Omit<ChatMessageData, 'textElements'>[]): ChatMessageData[] => {
    return messages.map(msg => ({
        ...msg,
        textElements: msg.text ? renderTextWithMentionsForChat(msg.text, MOCK_CHAT_USER_NAMES) : undefined,
    }));
};


export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>(() => processMessagesWithMentions(initialMessagesRaw));
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (newMessage.trim() === '') return;

    checkForMentionsAndNotifyChat(newMessage);

    const newMsgData: ChatMessageData = {
      id: Date.now().toString(),
      senderName: 'Você',
      avatarUrl: 'https://placehold.co/40x40.png?text=EU',
      dataAIAvatarHint: 'current user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
      textElements: renderTextWithMentionsForChat(newMessage, MOCK_CHAT_USER_NAMES),
    };
    setMessages(prevMessages => [...prevMessages, newMsgData]);
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
        const newMsgData: ChatMessageData = {
            id: Date.now().toString(),
            senderName: 'Você',
            avatarUrl: 'https://placehold.co/40x40.png?text=EU',
            dataAIAvatarHint: 'current user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            ...(fileType === 'image' && { imageUrl: e.target?.result as string, dataAIImageHint: 'uploaded image' }),
            file: { name: file.name, type: fileType }
        };
        setMessages(prevMessages => [...prevMessages, newMsgData]);
    };

    if (fileType === 'image') {
        reader.readAsDataURL(file);
    } else {
        const newMsgData: ChatMessageData = {
            id: Date.now().toString(),
            senderName: 'Você',
            avatarUrl: 'https://placehold.co/40x40.png?text=EU',
            dataAIAvatarHint: 'current user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCurrentUser: true,
            file: { name: file.name, type: fileType }
        };
        setMessages(prevMessages => [...prevMessages, newMsgData]);
    }
    
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

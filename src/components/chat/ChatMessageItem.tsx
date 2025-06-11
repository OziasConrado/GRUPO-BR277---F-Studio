
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { StaticImageData } from 'next/image';
import Image from "next/image";
import { Paperclip, Mic, FileText, PlayCircle } from "lucide-react";
import React from "react"; 

export interface ChatMessageData {
  id: string;
  senderName: string;
  avatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  text?: string;
  imageUrl?: string | StaticImageData; // Agora pode ser uma dataURI do preview ou uma URL final
  dataAIImageHint?: string;
  audioUrl?: string; 
  file?: { name: string, type: 'image' | 'audio' | 'other' }; // 'file' pode ser usado para metadados do arquivo enviado
  timestamp: string;
  isCurrentUser: boolean;
  textElements?: React.ReactNode[]; 
}

export default function ChatMessageItem({ message }: { message: ChatMessageData }) {
  const { senderName, avatarUrl, dataAIAvatarHint, text, imageUrl, dataAIImageHint, file, timestamp, isCurrentUser, textElements } = message;

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === 'image' && !imageUrl) return <Paperclip className="h-5 w-5 mr-2 text-primary" />; // Mostra clipe se for só metadado de imagem sem preview direto
    if (file.type === 'audio') return <Mic className="h-5 w-5 mr-2 text-primary" />;
    return <FileText className="h-5 w-5 mr-2 text-muted-foreground" />;
  };

  return (
    <div className={cn("flex items-end gap-2 w-full", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
          {avatarUrl && <AvatarImage src={avatarUrl as string} alt={senderName} data-ai-hint={dataAIAvatarHint} />}
          <AvatarFallback>{senderName.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl shadow",
          isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        {!isCurrentUser && <p className="text-xs font-semibold mb-1 text-primary">{senderName}</p>}
        
        {imageUrl && (
          <div className="mb-1.5 max-w-xs sm:max-w-sm rounded-lg overflow-hidden border">
             <Image
                src={imageUrl} // Pode ser dataURI ou URL
                alt={dataAIImageHint || "Imagem enviada"}
                width={400} // Base width for aspect ratio, will scale down
                height={300} // Base height for aspect ratio
                layout="responsive"
                objectFit="contain" // 'contain' para ver a imagem inteira, 'cover' para preencher
                data-ai-hint={dataAIImageHint || "chat image"}
              />
          </div>
        )}
        
        {textElements ? (
          <p className="text-sm whitespace-pre-wrap">{textElements}</p>
        ) : (
          text && <p className="text-sm whitespace-pre-wrap">{text}</p>
        )}

        {file && file.type === 'audio' && (
            <div className="mt-2 flex items-center p-2 bg-muted/50 rounded-lg">
                <PlayCircle className="h-6 w-6 mr-2 text-primary"/>
                <span className="text-sm">{file.name || "Áudio"}</span>
            </div>
        )}
         {file && file.type !== 'audio' && !imageUrl && ( // Só mostra se não houver preview de imagem
            <div className="mt-2 flex items-center p-2 bg-muted/50 rounded-lg">
                {getFileIcon()}
                <span className="text-sm">{file.name || "Arquivo"}</span>
            </div>
        )}
        <p className={cn("text-xs mt-1.5", isCurrentUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left")}>
          {timestamp}
        </p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
           {avatarUrl && <AvatarImage src={avatarUrl as string} alt={senderName} data-ai-hint={dataAIAvatarHint} />}
          <AvatarFallback>{senderName.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

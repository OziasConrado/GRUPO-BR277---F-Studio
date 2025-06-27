
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { StaticImageData } from 'next/image';
import Image from "next/image";
import { Paperclip, Mic, FileText, PlayCircle, Heart } from "lucide-react";
import React, { useState, useEffect } from "react"; 
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";

export interface ChatMessageData {
  id: string;
  senderName: string;
  avatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  text?: string;
  imageUrl?: string | StaticImageData; 
  dataAIImageHint?: string;
  audioUrl?: string; 
  file?: { name: string, type: 'image' | 'audio' | 'other' }; 
  timestamp: string;
  isCurrentUser: boolean;
  textElements?: React.ReactNode[];
  reactions?: { heart?: number };
}

const SoundWaveIcon = ({ className, width = "72", height = "22" }: { className?: string, width?: string, height?: string }) => (
  <svg width={width} height={height} viewBox="0 0 72 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="1" y="9" width="3" height="4" rx="1.5" fill="currentColor"/>
    <rect x="5" y="6" width="3" height="10" rx="1.5" fill="currentColor"/>
    <rect x="9" y="3" width="3" height="16" rx="1.5" fill="currentColor"/>
    <rect x="13" y="7" width="3" height="8" rx="1.5" fill="currentColor"/>
    <rect x="17" y="5" width="3" height="12" rx="1.5" fill="currentColor"/>
    <rect x="21" y="9" width="3" height="4" rx="1.5" fill="currentColor"/>
    <rect x="25" y="4" width="3" height="14" rx="1.5" fill="currentColor"/>
    <rect x="29" y="8" width="3" height="6" rx="1.5" fill="currentColor"/>
    <rect x="33" y="6" width="3" height="10" rx="1.5" fill="currentColor"/>
    <rect x="37" y="3" width="3" height="16" rx="1.5" fill="currentColor"/>
    <rect x="41" y="9" width="3" height="4" rx="1.5" fill="currentColor"/>
    <rect x="45" y="5" width="3" height="12" rx="1.5" fill="currentColor"/>
    <rect x="49" y="7" width="3" height="8" rx="1.5" fill="currentColor"/>
    <rect x="53" y="4" width="3" height="14" rx="1.5" fill="currentColor"/>
    <rect x="57" y="9" width="3" height="4" rx="1.5" fill="currentColor"/>
    <rect x="61" y="6" width="3" height="10" rx="1.5" fill="currentColor"/>
    <rect x="65" y="3" width="3" height="16" rx="1.5" fill="currentColor"/>
    <rect x="69" y="7" width="3" height="8" rx="1.5" fill="currentColor"/>
  </svg>
);


export default function ChatMessageItem({ message, onReply, onReaction }: { message: ChatMessageData, onReply: (userName: string) => void, onReaction: (messageId: string) => void }) {
  const { senderName, avatarUrl, dataAIAvatarHint, text, imageUrl, dataAIImageHint, file, timestamp, isCurrentUser, textElements, reactions } = message;
  const { currentUser } = useAuth();
  const [userHasReacted, setUserHasReacted] = useState(false);

  useEffect(() => {
    if (!currentUser || !firestore || !message.id) return;
    const reactionRef = doc(firestore, 'chatMessages', message.id, 'userReactions', currentUser.uid);
    const unsubscribe = onSnapshot(reactionRef, (doc) => {
        setUserHasReacted(doc.exists());
    });
    return () => unsubscribe();
  }, [currentUser, message.id]);


  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl as string);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === 'image' && !imageUrl) return <Paperclip className="h-5 w-5 mr-2 text-primary" />;
    if (file.type === 'audio') return <Mic className="h-5 w-5 mr-2 text-primary" />; // Should not be hit if audio shows waves
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
      <div className="relative group/message max-w-[70%]">
        <div
          className={cn(
            "p-3 rounded-xl shadow",
            isCurrentUser ? "bg-accent text-accent-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
          )}
        >
          {!isCurrentUser && <p className="text-xs font-semibold mb-1 text-primary">{senderName}</p>}
          
          {imageUrl && (
            <div className="mb-1.5 max-w-xs sm:max-w-sm rounded-lg overflow-hidden border">
              <Image
                  src={imageUrl} 
                  alt={dataAIImageHint || "Imagem enviada"}
                  width={400} 
                  height={300} 
                  layout="responsive"
                  objectFit="contain" 
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
              <div 
                  className={cn(
                      "mt-2 flex items-center p-2.5 rounded-lg cursor-pointer group",
                      isCurrentUser 
                          ? "bg-accent-foreground/10 hover:bg-accent-foreground/20" 
                          : "bg-muted/40 hover:bg-muted/60"
                  )}
                  onClick={handlePlayAudio}
              >
                  <PlayCircle className={cn(
                      "h-7 w-7 mr-2.5 flex-shrink-0", 
                      isCurrentUser ? "text-accent-foreground/80 group-hover:text-accent-foreground" : "text-primary group-hover:text-primary/80"
                  )} />
                  <SoundWaveIcon className={cn(
                      isCurrentUser ? "text-accent-foreground/60 group-hover:text-accent-foreground/80" : "text-muted-foreground group-hover:text-foreground/80"
                  )} />
              </div>
          )}
          {file && file.type !== 'audio' && !imageUrl && ( 
              <div className="mt-2 flex items-center p-2 bg-muted/50 rounded-lg">
                  {getFileIcon()}
                  <span className="text-sm">{file.name || "Arquivo"}</span>
              </div>
          )}
          <div className="flex items-center justify-end mt-1.5 space-x-3 text-xs">
            {!isCurrentUser &&
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onReply(senderName)}
                  className="p-0 h-auto text-xs text-primary mr-auto"
                >
                  Responder
                </Button>
            }
            <p className={cn(isCurrentUser ? "text-accent-foreground/70" : "text-muted-foreground")}>
                {timestamp}
            </p>
          </div>
        </div>
        
         {/* Reaction Display/Button */}
        {(reactions?.heart ?? 0) > 0 ? (
          <button
            onClick={() => onReaction(message.id)}
            className={cn(
              "absolute bottom-[-8px] rounded-full bg-card border shadow-sm px-1.5 py-0.5 flex items-center gap-1 cursor-pointer hover:bg-muted",
              isCurrentUser ? 'right-2' : 'left-2'
            )}
          >
            <span className={cn("text-sm transition-transform", userHasReacted && "scale-125")}>💙</span>
            <span className="text-xs font-medium">{reactions?.heart}</span>
          </button>
        ) : (
          <button
            onClick={() => onReaction(message.id)}
            className={cn(
              "absolute bottom-[-10px] z-10 p-1 rounded-full bg-card border shadow-sm opacity-0 group-hover/message:opacity-100 transition-opacity",
              isCurrentUser ? 'left-2' : 'right-2'
            )}
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
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

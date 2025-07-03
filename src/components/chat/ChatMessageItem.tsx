
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { StaticImageData } from 'next/image';
import Image from "next/image";
import { Paperclip, Mic, FileText, PlayCircle, Heart, MoreVertical, Edit, Trash2, Flag } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react"; 
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { doc, getDoc, onSnapshot, getDocs, collection, query, where, limit } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';

export interface ChatMessageData {
  id: string;
  userId: string;
  senderName: string;
  avatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  text?: string;
  textElements?: React.ReactNode[];
  imageUrl?: string | StaticImageData; 
  dataAIImageHint?: string;
  audioUrl?: string; 
  file?: { name: string, type: 'image' | 'audio' | 'other' }; 
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: { heart?: number };
  replyTo?: {
    messageId: string;
    userName: string;
    messageText: string;
  };
  edited?: boolean;
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


const ReplyPreview = ({ replyInfo }: { replyInfo: NonNullable<ChatMessageData['replyTo']> }) => {
    const handlePreviewClick = () => {
        const element = document.getElementById(`message-${replyInfo.messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-primary/10', 'ring-2', 'ring-primary/50', 'transition-all', 'duration-1000', 'ease-out', 'rounded-xl');
            setTimeout(() => {
                element.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/50', 'rounded-xl');
            }, 2500);
        }
    };

    return (
        <button 
            onClick={handlePreviewClick} 
            className="block w-full text-left p-2 mb-2 rounded-md bg-black/5 dark:bg-white/5 border-l-2 border-primary/50 hover:bg-black/10 dark:hover:bg-white/10"
        >
            <p className="text-xs font-semibold text-primary truncate">{replyInfo.userName}</p>
            <p className="text-sm text-muted-foreground truncate">{replyInfo.messageText}</p>
        </button>
    );
};


export default function ChatMessageItem({ 
  message, 
  onReply, 
  onReaction,
  onEdit,
  onDelete,
  onImageClick
}: { 
  message: ChatMessageData, 
  onReply: (message: ChatMessageData) => void, 
  onReaction: (messageId: string) => void,
  onEdit: (messageId: string, newText: string) => Promise<void>,
  onDelete: (messageId: string) => Promise<void>,
  onImageClick: (imageUrl: string | StaticImageData) => void;
}) {
  const { senderName, avatarUrl, dataAIAvatarHint, text, textElements, imageUrl, dataAIImageHint, file, timestamp, isCurrentUser, reactions, replyTo, edited } = message;
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [userHasReacted, setUserHasReacted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text || '');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    if (!currentUser || !firestore || !message.id) return;
    const reactionRef = doc(firestore, 'chatMessages', message.id, 'userReactions', currentUser.uid);
    const unsubscribe = onSnapshot(reactionRef, (doc) => {
        setUserHasReacted(doc.exists());
    });
    return () => unsubscribe();
  }, [currentUser, message.id]);
  
  const handleSaveEdit = async () => {
    if (!text || editedText.trim() === text.trim() || editedText.trim() === '') {
        setIsEditing(false);
        setEditedText(text || ''); // Reset on cancel or no change
        return;
    }
    await onEdit(message.id, editedText.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(text || '');
    setIsEditing(false);
  };

  const handleReportMessage = (messageToReport: ChatMessageData) => {
    console.log("Reporting message:", messageToReport.id, messageToReport.text);
    toast({
        title: "Denúncia Recebida",
        description: "Agradecemos sua contribuição. A mensagem foi enviada para análise da nossa equipe.",
    });
  };

  const handlePlayAudio = () => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl as string);
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === 'image' && !imageUrl) return <Paperclip className="h-5 w-5 mr-2 text-primary" />;
    if (file.type === 'audio') return <Mic className="h-5 w-5 mr-2 text-primary" />; // Should not be hit if audio shows waves
    return <FileText className="h-5 w-5 mr-2 text-muted-foreground" />;
  };

  const handleUserClick = async () => {
    if (!firestore || !message.userId) return;

    try {
        const userDocRef = doc(firestore, "Usuarios", message.userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            setSelectedUserProfile({
                id: userDoc.id,
                name: userData.displayName || 'Usuário',
                avatarUrl: userData.photoURL,
                location: userData.location,
                bio: userData.bio,
                instagramUsername: userData.instagramUsername,
            });
            setIsProfileModalOpen(true);
        } else {
            setSelectedUserProfile({
                id: message.userId,
                name: message.senderName,
                avatarUrl: message.avatarUrl,
            });
            setIsProfileModalOpen(true);
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível buscar as informações do usuário.",
            variant: "destructive"
        });
    }
  };

  return (
    <>
    <div className={cn("group/message flex items-end gap-2 w-full", isCurrentUser ? "justify-end" : "justify-start")} id={`message-${message.id}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 self-start cursor-pointer" onClick={handleUserClick}>
          {avatarUrl && <AvatarImage src={avatarUrl as string} alt={senderName} data-ai-hint={dataAIAvatarHint} />}
          <AvatarFallback>{senderName.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      {isCurrentUser && (
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 self-center rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover/message:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[210]">
                  {text && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      )}

      <div className={cn("relative max-w-[85%] min-w-0", text && !imageUrl && 'min-w-[100px]')}>
        {isEditing ? (
            <div className="p-3 rounded-xl shadow bg-accent text-accent-foreground">
                <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="mb-2 bg-background text-foreground"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit();
                        } else if (e.key === 'Escape') {
                            handleCancelEdit();
                        }
                    }}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancelar</Button>
                    <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                </div>
            </div>
        ) : (
            <div
            className={cn(
                "p-3 rounded-xl shadow overflow-hidden",
                isCurrentUser ? "bg-primary/5 text-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
            )}
            >
                {!isCurrentUser && <p className="text-xs font-semibold mb-1 text-primary break-words cursor-pointer hover:underline" onClick={handleUserClick}>{senderName}</p>}
                
                {replyTo && <ReplyPreview replyInfo={replyTo} />}
                
                {imageUrl && (
                    <button
                        onClick={() => onImageClick(imageUrl)}
                        className="mb-1.5 max-w-xs sm:max-w-sm rounded-lg overflow-hidden border block w-full relative aspect-[4/3] group focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Ampliar imagem"
                    >
                        <Image
                            src={imageUrl}
                            alt={dataAIImageHint || "Imagem enviada"}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={dataAIImageHint || "chat image"}
                            className="transition-transform duration-300 group-hover:scale-105"
                        />
                    </button>
                )}
                
                {text && (
                  <div className="min-w-0">
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {textElements || text}
                    </p>
                  </div>
                )}

                {file && file.type === 'audio' && (
                    <div 
                        className={cn(
                            "mt-2 flex items-center p-2.5 rounded-lg cursor-pointer group",
                            isCurrentUser 
                                ? "bg-primary/20 hover:bg-primary/30" 
                                : "bg-muted/40 hover:bg-muted/60"
                        )}
                        onClick={handlePlayAudio}
                    >
                        <PlayCircle className={cn(
                            "h-7 w-7 mr-2.5 flex-shrink-0", 
                            isCurrentUser ? "text-primary group-hover:text-primary/80" : "text-primary group-hover:text-primary/80"
                        )} />
                        <SoundWaveIcon className={cn(
                            isCurrentUser ? "text-primary/60 group-hover:text-primary/80" : "text-muted-foreground group-hover:text-foreground/80"
                        )} />
                    </div>
                )}
                {file && file.type !== 'audio' && !imageUrl && ( 
                    <div className="mt-2 flex items-center p-2 bg-muted/50 rounded-lg">
                        {getFileIcon()}
                        <span className="text-sm">{file.name || "Arquivo"}</span>
                    </div>
                )}
                <div className="flex items-center justify-between mt-1.5 text-xs">
                <div className="flex items-center gap-3">
                    {!isCurrentUser &&
                        <Button
                        variant="link"
                        size="sm"
                        onClick={() => onReply(message)}
                        className="p-0 h-auto text-xs text-primary"
                        >
                        Responder
                        </Button>
                    }
                </div>
                <div className="flex items-center gap-2">
                    <button 
                    onClick={() => onReaction(message.id)} 
                    className="flex items-center gap-1.5 text-muted-foreground p-1 rounded-full hover:bg-muted"
                    >
                        <Heart className={cn("h-4 w-4 transition-colors", userHasReacted ? "text-red-500 fill-red-500" : "hover:text-red-500/80")} />
                        {(reactions?.heart ?? 0) > 0 && <span className="font-medium text-xs pr-1">{reactions?.heart}</span>}
                    </button>
                    {edited && <p className={cn("italic", isCurrentUser ? "text-primary/70" : "text-muted-foreground")}>(editado)</p>}
                    <p className={cn(isCurrentUser ? "text-primary/70" : "text-muted-foreground")}>
                        {timestamp}
                    </p>
                </div>
                </div>
            </div>
        )}
      </div>

      {!isCurrentUser && (
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 self-center rounded-full text-muted-foreground hover:text-primary opacity-0 group-hover/message:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="z-[210]">
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleReportMessage(message)}>
                      <Flag className="mr-2 h-4 w-4" />
                      <span>Denunciar para o Administrador</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      )}

      {isCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
          {avatarUrl && <AvatarImage src={avatarUrl as string} alt={senderName} data-ai-hint={dataAIAvatarHint} />}
          <AvatarFallback>{senderName.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="z-[210]">
        <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mensagem</AlertDialogTitle>
            <AlertDialogDescription>
            Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                setIsDeleteDialogOpen(false); // Close dialog first
                await onDelete(message.id);  // Then delete
              }}
            >
            Excluir
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <UserProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      user={selectedUserProfile}
    />
    </>
  );
}

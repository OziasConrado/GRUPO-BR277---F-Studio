
'use client';

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent, useMemo } from 'react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Paperclip, Mic, Bell, BellRing, MessageCircle, Loader2 } from "lucide-react";
import ChatMessageItem, { type ChatMessageData } from "./ChatMessageItem";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from "next/image"; // For image preview
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
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
  getDocs,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog';
import { useNotification } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '@/types/notifications';
import type { StaticImageData } from 'next/image';

interface ChatWindowProps {
  onClose: () => void;
}

interface ReplyingToInfo {
  userName: string;
  messageId: string;
  messageText: string;
}

interface MentionUser {
    id: string;
    displayName: string;
}

async function createChatMentions(text: string, messageId: string, fromUser: { uid: string, displayName: string | null, photoURL: string | null }) {
    if (!firestore) return;

    const foundUsers = new Map<string, { id: string }>();
    const processedIndices = new Set<number>();
    const matches = [...text.matchAll(/@/g)];

    for (const match of matches) {
        const atIndex = match.index!;
        if (processedIndices.has(atIndex)) continue;

        const queryableText = text.substring(atIndex + 1);
        const firstWordMatch = queryableText.match(/^([\p{L}\p{N}._'-]+)/u);
        if (!firstWordMatch) continue;
        
        const firstWord = firstWordMatch[1];
        
        const usersRef = collection(firestore, "Usuarios");
        const q = query(
            usersRef,
            where("displayName_lowercase", ">=", firstWord.toLowerCase()),
            where("displayName_lowercase", "<=", firstWord.toLowerCase() + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) continue;
        
        let longestMatchUser: MentionUser | null = null;
        
        for (const userDoc of querySnapshot.docs) {
            const userData = userDoc.data();
            if (userData && typeof userData.displayName === 'string') {
                const displayName: string = userData.displayName;

                if (queryableText.toLowerCase().startsWith(displayName.toLowerCase())) {
                    const nextChar = text[atIndex + 1 + displayName.length];
                    if (nextChar === undefined || !/[\p{L}\p{N}]/u.test(nextChar)) {
                        if (!longestMatchUser || displayName.length > longestMatchUser.displayName.length) {
                            longestMatchUser = { id: userDoc.id, displayName: displayName };
                        }
                    }
                }
            }
        }


        if (longestMatchUser) {
            if (longestMatchUser.id !== fromUser.uid) {
                foundUsers.set(longestMatchUser.displayName, { id: longestMatchUser.id });
            }
            // Mark all indices within the matched name as processed to avoid sub-matches
            for (let i = 0; i < longestMatchUser.displayName.length + 1; i++) {
                processedIndices.add(atIndex + i);
            }
        }
    }

    if (foundUsers.size === 0) return;

    const batch = writeBatch(firestore);
    for (const user of foundUsers.values()) {
        const notificationRef = doc(collection(firestore, 'Usuarios', user.id, 'notifications'));
        batch.set(notificationRef, {
            type: 'mention_chat',
            fromUserId: fromUser.uid,
            fromUserName: fromUser.displayName || "Usuário",
            fromUserAvatar: fromUser.photoURL || null,
            postId: messageId,
            textSnippet: text.substring(0, 70) + (text.length > 70 ? '...' : ''),
            timestamp: serverTimestamp(),
            read: false,
        });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error committing mention notifications batch:", error);
    }
}

async function findMentions(text: string): Promise<{startIndex: number, length: number}[]> {
    if (!firestore || !text) return [];

    const mentions: {startIndex: number, length: number}[] = [];
    const processedIndices = new Set<number>();
    const matches = [...text.matchAll(/@/g)];

    for (const match of matches) {
        const atIndex = match.index!;
        if (processedIndices.has(atIndex)) continue;

        const queryableText = text.substring(atIndex + 1);
        const firstWordMatch = queryableText.match(/^([\p{L}\p{N}._'-]+)/u);
        if (!firstWordMatch) continue;
        
        const firstWord = firstWordMatch[1];
        
        const usersRef = collection(firestore, "Usuarios");
        const q = query(
            usersRef,
            where("displayName_lowercase", ">=", firstWord.toLowerCase()),
            where("displayName_lowercase", "<=", firstWord.toLowerCase() + '\uf8ff'),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) continue;
        
        let longestMatchUser: { displayName: string } | null = null;
        
        for (const userDoc of querySnapshot.docs) {
            const userData = userDoc.data();
            if (userData && typeof userData.displayName === 'string') {
                const displayName: string = userData.displayName;
                if (queryableText.toLowerCase().startsWith(displayName.toLowerCase())) {
                    const nextChar = text[atIndex + 1 + displayName.length];
                    if (nextChar === undefined || !/[\p{L}\p{N}]/u.test(nextChar)) {
                        if (!longestMatchUser || displayName.length > longestMatchUser.displayName.length) {
                            longestMatchUser = { displayName };
                        }
                    }
                }
            }
        }

        if (longestMatchUser) {
            const mentionLength = longestMatchUser.displayName.length + 1; // +1 for '@'
            mentions.push({
                startIndex: atIndex,
                length: mentionLength,
            });
            for (let i = 0; i < mentionLength; i++) {
                processedIndices.add(atIndex + i);
            }
        }
    }
    return mentions;
}

function renderTextWithPrecomputedMentions(text: string, mentions: {startIndex: number, length: number}[]): React.ReactNode[] {
    if (!text) return [];
    if (!mentions || mentions.length === 0) return [text];

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedMentions = mentions.sort((a, b) => a.startIndex - b.startIndex);

    sortedMentions.forEach((mention, i) => {
        if (mention.startIndex > lastIndex) {
            elements.push(text.substring(lastIndex, mention.startIndex));
        }
        const mentionText = text.substring(mention.startIndex, mention.startIndex + mention.length);
        elements.push(<strong key={`mention-${i}`} className="text-accent font-semibold cursor-pointer hover:underline">{mentionText}</strong>);
        lastIndex = mention.startIndex + mention.length;
    });

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }
    
    return elements;
}


export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingToInfo | null>(null);

  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [loadingMentions, setLoadingMentions] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { notifications, unreadCount: totalUnreadCount, loading: notificationsLoading } = useNotification();
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | StaticImageData | null>(null);


  const chatNotifications = useMemo(() => {
    return notifications.filter(n => n.type === 'mention_chat');
  }, [notifications]);

  const unreadChatCount = useMemo(() => {
    return chatNotifications.filter(n => !n.read).length;
  }, [chatNotifications]);


  useEffect(() => {
    if (!firestore) {
        toast({ title: "Erro de Conexão", description: "Chat não pôde conectar ao servidor.", variant: "destructive" });
        return;
    }
    const messagesCollection = collection(firestore, 'chatMessages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc')); 

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedMessagesPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const messageTimestamp = data.timestamp instanceof Timestamp
          ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Agora'; 

        const mentions = await findMentions(data.text);
        const textElements = renderTextWithPrecomputedMentions(data.text || '', mentions);

        return {
          id: doc.id,
          userId: data.userId,
          senderName: data.senderName,
          avatarUrl: data.avatarUrl,
          dataAIAvatarHint: data.dataAIAvatarHint,
          text: data.text,
          textElements: textElements,
          imageUrl: data.imageUrl,
          dataAIImageHint: data.dataAIImageHint,
          audioUrl: data.audioUrl,
          file: data.file,
          timestamp: messageTimestamp,
          isCurrentUser: currentUser ? data.userId === currentUser.uid : false,
          reactions: data.reactions,
          replyTo: data.replyTo,
          edited: data.edited || false,
        };
      });
      const fetchedMessages = await Promise.all(fetchedMessagesPromises);
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching chat messages: ", error);
      toast({ title: "Erro no Chat", description: "Não foi possível carregar as mensagens.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [currentUser, toast]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, replyingTo]);

  const handleImageClick = (imageUrl: string | StaticImageData) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

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

    const messageText = newMessage.trim();
    if (messageText === '' && !selectedImageFile) return;
    
    let imageUrl: string | undefined;
    let fileInfo: { name: string, type: 'image' } | undefined;

    try {
        if (selectedImageFile) {
            const uniqueId = `image_${Date.now()}_${selectedImageFile.name}`;
            const storageRef = ref(storage, `chat_images/${currentUser.uid}/${uniqueId}`);
            const metadata = { contentType: selectedImageFile.type };
            const uploadTask = uploadBytesResumable(storageRef, selectedImageFile, metadata);

            imageUrl = await new Promise<string>((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {}, 
                    (error) => {
                        console.error("Upload error in Chat (Image):", error);
                        toast({
                            variant: "destructive",
                            title: "Erro ao Enviar Imagem",
                            description: `Não foi possível enviar a imagem. Erro: ${error.code}`,
                        });
                        reject(error);
                    }, 
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
                    }
                );
            });
            fileInfo = { name: selectedImageFile.name, type: 'image' };
        }

        const messageData: any = {
          userId: currentUser.uid,
          senderName: currentUser.displayName || 'Usuário Anônimo',
          avatarUrl: currentUser.photoURL || `https://placehold.co/40x40.png?text=${currentUser.displayName ? currentUser.displayName.substring(0,1).toUpperCase() : 'U'}`,
          dataAIAvatarHint: 'user avatar',
          text: messageText || undefined,
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
        
        const docRef = await addDoc(collection(firestore, 'chatMessages'), messageData);

        if (currentUser && messageText) {
          await createChatMentions(messageText, docRef.id, { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL });
        }
        
    } catch (error) {
        console.error("Error sending message:", error);
    } finally {
        setNewMessage('');
        setReplyingTo(null);
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.rows = 1;
          textareaRef.current.focus();
        }
    }
  };

  const uploadAudioAndSendMessage = async (audioBlob: Blob) => {
    if (!currentUser || !firestore || !storage) {
        toast({ title: "Erro", description: "Não foi possível conectar para enviar o áudio.", variant: "destructive"});
        return;
    }

    const uniqueId = `audio_${Date.now()}.webm`;
    const storageRef = ref(storage, `chat_audio/${currentUser.uid}/${uniqueId}`);
    const metadata = { contentType: 'audio/webm' };

    try {
        const uploadTask = uploadBytesResumable(storageRef, audioBlob, metadata);
        
        const downloadURL = await new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => {}, 
                (error) => {
                  console.error("Upload error in Chat (Audio):", error);
                  toast({
                      variant: "destructive",
                      title: "Erro ao Enviar Áudio",
                      description: `Não foi possível enviar sua mensagem de voz. Erro: ${error.code}`,
                  });
                  reject(error)
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
                }
            );
        });

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

    const MAX_SIZE_MB = 10;
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

  useEffect(() => {
    if (mentionQuery.length > 0 && firestore) {
      setLoadingMentions(true);
      const fetchUsers = async () => {
        if (!firestore) return;
        const usersRef = collection(firestore, "Usuarios");
        const q = query(
          usersRef,
          where("displayName_lowercase", ">=", mentionQuery.toLowerCase()),
          where("displayName_lowercase", "<=", mentionQuery.toLowerCase() + '\uf8ff'),
          limit(5)
        );
        try {
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map(doc => doc.data().displayName as string);
          setMentionSuggestions(users.filter(name => name));
        } catch (error) {
          console.error("Error fetching mention suggestions:", error);
          setMentionSuggestions([]);
        } finally {
          setLoadingMentions(false);
        }
      };
      
      const timeoutId = setTimeout(fetchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionQuery]);

  const handleTextareaInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    const value = textarea.value;
    setNewMessage(value);
    
    // Auto-resize textarea
    textarea.style.height = 'auto'; 
    const newScrollHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newScrollHeight}px`;

    // Mention logic
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const currentWord = textBeforeCursor.split(/\s+/).pop() || '';
    
    if (currentWord.startsWith('@')) {
        setMentionQuery(currentWord.substring(1));
        setShowMentions(true);
    } else {
        setShowMentions(false);
    }
  };
  
  const handleMentionClick = (name: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const prefix = value.substring(0, lastAtPos);
      const suffix = value.substring(cursorPos);
      const newText = `${prefix}@${name} ${suffix}`;
      setNewMessage(newText);
      setShowMentions(false);
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = prefix.length + name.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
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
        const messageDoc = await transaction.get(messageRef);
        if (!messageDoc.exists()) {
            throw new Error("A mensagem não existe mais.");
        }

        const reactionDoc = await transaction.get(reactionRef);
        
        const currentReactions = messageDoc.data().reactions || { heart: 0 };
        const newHeartCount = currentReactions.heart || 0;
        
        if (reactionDoc.exists()) {
          // User is un-reacting
          transaction.update(messageRef, { 'reactions.heart': Math.max(0, newHeartCount - 1) });
          transaction.delete(reactionRef);
        } else {
          // User is adding a new reaction
          transaction.update(messageRef, { 'reactions.heart': newHeartCount + 1 });
          transaction.set(reactionRef, { type: 'heart', timestamp: serverTimestamp() });
        }
      });
    } catch (error: any) {
      console.error("Error handling reaction:", error);
      toast({ variant: 'destructive', title: 'Erro ao Reagir', description: error.message || 'Não foi possível processar sua reação.' });
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

  const handleMarkChatNotificationsAsRead = async () => {
    if (!currentUser || !firestore || unreadChatCount === 0) return;

    const batch = writeBatch(firestore);
    chatNotifications.forEach(n => {
        if (!n.read) {
            const notifRef = doc(firestore, 'Usuarios', currentUser.uid, 'notifications', n.id);
            batch.update(notifRef, { read: true });
        }
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error marking chat notifications as read:", error);
    }
  };

  const handleChatNotificationClick = (notification: Notification) => {
    const messageElement = document.getElementById(`message-${notification.postId}`);
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('bg-primary/10', 'ring-2', 'ring-primary/50', 'transition-all', 'duration-1000', 'ease-out', 'rounded-xl');
        setTimeout(() => {
            messageElement.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/50', 'rounded-xl');
        }, 2500);
    }
  };


  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none bg-background !p-0 grid grid-rows-[auto_1fr_auto] !translate-x-0 !translate-y-0">
          <header className="p-4 border-b border-primary/50 flex items-center justify-between bg-primary text-primary-foreground shrink-0">
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
            <div className="flex items-center gap-2">
              <DropdownMenu onOpenChange={(open) => { if(!open) handleMarkChatNotificationsAsRead(); }}>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/10">
                          <Bell className="h-5 w-5"/>
                           {unreadChatCount > 0 && (
                              <span className="absolute top-2.5 right-2.5 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                              </span>
                          )}
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 z-[210]">
                      <DropdownMenuLabel>Menções no Chat</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       {notificationsLoading ? (
                          <DropdownMenuItem disabled>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Carregando...
                          </DropdownMenuItem>
                      ) : chatNotifications.length > 0 ? (
                          chatNotifications.map(n => (
                              <DropdownMenuItem key={n.id} className={cn("flex items-start gap-2 h-auto whitespace-normal cursor-pointer", !n.read && "bg-primary/10")} onClick={() => handleChatNotificationClick(n)}>
                                  <div className="mt-1">
                                      <MessageCircle className="h-5 w-5 text-primary"/>
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-sm">
                                          <span className="font-semibold">{n.fromUserName}</span> mencionou você: <span className="text-muted-foreground italic">"{n.textSnippet}"</span>
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                      {n.timestamp instanceof Timestamp ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true, locale: ptBR }).replace('cerca de ', '') : 'agora'}
                                      </p>
                                  </div>
                              </DropdownMenuItem>
                          ))
                      ) : (
                          <DropdownMenuItem disabled className="text-center justify-center">Nenhuma menção nova</DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
              <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                      <X className="h-5 w-5" />
                  </Button>
              </DialogClose>
            </div>
          </header>

          <div className="overflow-y-auto min-h-0 bg-muted/20" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map(msg => (
                <ChatMessageItem 
                  key={msg.id} 
                  message={msg} 
                  onReply={handleReply} 
                  onReaction={handleReactionClick}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          </div>

          <footer className="border-t border-border/50 bg-card shrink-0">
            {showMentions && (
              <div className="max-h-32 overflow-y-auto border-b bg-background p-2 text-sm">
                 {loadingMentions ? (
                  <div className="p-2 text-center text-muted-foreground">Buscando...</div>
                ) : mentionSuggestions.length > 0 ? (
                  mentionSuggestions.map(name => (
                    <button 
                      key={name}
                      onClick={() => handleMentionClick(name)}
                      className="block w-full text-left p-2 rounded-md hover:bg-muted"
                    >
                      {name}
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
                )}
              </div>
            )}
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
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent 
            className="!fixed !inset-0 !z-[250] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/90 !p-0 flex flex-col !translate-x-0 !translate-y-0"
            onEscapeKeyDown={() => setIsImageModalOpen(false)}
        >
            <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-black/50 !z-[260]">
                <DialogTitle className="sr-only">Visualização de Imagem</DialogTitle>
                <DialogDescription className="sr-only">A imagem do chat em tela cheia.</DialogDescription>
                <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[260] flex-shrink-0">
                        <X className="h-5 w-5 sm:h-6 sm:h-6" />
                    </Button>
                </DialogClose>
            </DialogHeader>
            <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                {selectedImageUrl && (
                    <div className="relative w-full h-full max-w-full max-h-full mx-auto">
                        <Image 
                            src={selectedImageUrl} 
                            alt="Imagem do chat ampliada" 
                            layout="fill" 
                            objectFit="contain" 
                            data-ai-hint="zoomed in chat image"
                        />
                    </div>
                )}
            </div>
            <div className="h-[100px] w-full flex shrink-0 items-center justify-center bg-white !z-[260]">
                <div className="flex h-[60px] w-full max-w-[320px] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                    Publicidade
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

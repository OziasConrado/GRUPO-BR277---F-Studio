
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { askCopilot, type CopilotInput } from '@/ai/flows/copilot-flow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  author: 'user' | 'ai';
  content: string;
}

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CopilotModal({ isOpen, onClose }: CopilotModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    // Optional: Reset state when closing the modal
    // setConversation([]);
    // setUserInput('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { author: 'user', content: trimmedInput };
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const input: CopilotInput = { query: trimmedInput };
      const result = await askCopilot(input);
      const aiMessage: Message = { author: 'ai', content: result.response };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking copilot:", error);
      const errorMessage: Message = { author: 'ai', content: "Desculpe, não consegui processar sua solicitação no momento. Tente novamente." };
      setConversation(prev => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Erro de Comunicação com a IA",
        description: "Houve um problema ao contatar o Copiloto. Verifique sua conexão ou tente mais tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [conversation]);
  
  useEffect(() => {
    // Set initial welcome message only when the modal opens for the first time or is empty
    if (isOpen && conversation.length === 0) {
        const welcomeMessage: Message = { author: 'ai', content: `Olá, ${currentUser?.displayName || 'viajante'}! Como posso ajudar na sua rota hoje?`};
        setConversation([welcomeMessage]);
    }
  }, [isOpen, conversation.length, currentUser]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 rounded-xl flex flex-col h-[85vh] max-h-[700px]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2 font-headline text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Copiloto277
          </DialogTitle>
           <DialogDescription>
            Seu assistente de IA para rotas e viagens.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {conversation.map((msg, index) => (
              <div key={index} className={cn("flex items-start gap-3", msg.author === 'user' && "justify-end")}>
                {msg.author === 'ai' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/30">
                    <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                    "max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap",
                    msg.author === 'ai' ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                )}>
                  {msg.content}
                </div>
                 {msg.author === 'user' && (
                  <Avatar className="h-8 w-8">
                     {currentUser?.photoURL ? (
                        <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User"} />
                     ) : null}
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border-2 border-primary/30">
                    <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-foreground p-3 rounded-lg flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span className="text-sm">Pensando...</span>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-card/50">
          <div className="relative">
            <Textarea
              placeholder="Informe seu local e destino..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="rounded-lg pr-12 min-h-[44px] text-base resize-none"
              onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
            />
            <Button 
                type="submit" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                disabled={isLoading || !userInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

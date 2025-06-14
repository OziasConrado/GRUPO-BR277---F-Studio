'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react"; // Icon updated
import { useChat } from "@/contexts/ChatContext";

export default function ChatFloatingButton() {
  const { openChat } = useChat();

  return (
    <Button
      onClick={openChat}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 rounded-full h-14 w-14 shadow-xl flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground" // Color, size, and mobile bottom position updated
      aria-label="Abrir chat em grupo"
    >
      <MessageCircle className="h-7 w-7" /> {/* Icon and size updated */}
    </Button>
  );
}

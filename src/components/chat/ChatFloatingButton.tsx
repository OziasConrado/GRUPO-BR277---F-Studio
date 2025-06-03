
'use client';

import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

interface ChatFloatingButtonProps {
  onClick: () => void;
}

export default function ChatFloatingButton({ onClick }: ChatFloatingButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 rounded-full h-16 w-16 shadow-xl flex items-center justify-center bg-accent hover:bg-accent/90 text-accent-foreground"
      aria-label="Abrir chat em grupo"
    >
      <MessageSquarePlus className="h-8 w-8" />
    </Button>
  );
}

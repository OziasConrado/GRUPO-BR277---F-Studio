
'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface EmergencyButtonModalTriggerProps {
  className?: string;
  iconClassName?: string;
  children?: ReactNode; // To allow text like "Emergência"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

export default function EmergencyButtonModalTrigger({ 
  className, 
  iconClassName, 
  children,
  variant = "destructive", // Default to destructive for icon-only button
  size = "icon" // Default to icon size
}: EmergencyButtonModalTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleLocationSend = () => {
    toast({
      title: "Localização Enviada",
      description: "Sua localização foi enviada para a equipe de suporte.",
    });
    setIsModalOpen(false);
  };

  const handleEmergencyCall = () => {
    toast({
      title: "Chamada de Emergência",
      description: "Conectando com os serviços de emergência...",
      variant: "destructive"
    });
    setIsModalOpen(false);
    // window.location.href = "tel:190"; // Example for actual call
  };


  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
            "rounded-full", // Ensure pill shape if not icon
            size === "icon" && "h-12 w-12 shadow-xl", // Specific style for icon only
            className
        )}
        onClick={() => setIsModalOpen(true)}
        aria-label="Botão de Emergência"
      >
        {children ? children : <AlertTriangle className={cn("h-6 w-6", iconClassName)} />}
      </Button>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-center text-xl">Contato de Emergência</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Selecione uma opção abaixo em caso de emergência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-3 py-4">
            <Button variant="outline" onClick={handleEmergencyCall} className="w-full py-3 text-base rounded-full">
              <Phone className="mr-2 h-5 w-5" />
              Ligar para Emergência
            </Button>
            <Button variant="outline" onClick={handleLocationSend} className="w-full py-3 text-base rounded-full">
              <MapPin className="mr-2 h-5 w-5" />
              Enviar Localização para Suporte
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full rounded-full">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

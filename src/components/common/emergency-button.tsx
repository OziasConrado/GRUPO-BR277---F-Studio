
'use client';

import { useState } from 'react';
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

export default function EmergencyButton({ className, iconClassName }: { className?: string; iconClassName?: string }) {
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
    // Simulate call
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
        variant="destructive"
        size="icon"
        className={className || "rounded-full h-12 w-12 shadow-xl"}
        onClick={() => setIsModalOpen(true)}
        aria-label="Botão de Emergência"
      >
        <AlertTriangle className={iconClassName || "h-6 w-6"} />
      </Button>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="glassmorphic">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-center">Contato de Emergência</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Selecione uma opção abaixo em caso de emergência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <Button variant="outline" onClick={handleEmergencyCall} className="w-full rounded-lg py-6">
              <Phone className="mr-2 h-5 w-5" />
              Ligar para Emergência
            </Button>
            <Button variant="outline" onClick={handleLocationSend} className="w-full rounded-lg py-6">
              <MapPin className="mr-2 h-5 w-5" />
              Enviar Localização para Suporte
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full rounded-lg">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


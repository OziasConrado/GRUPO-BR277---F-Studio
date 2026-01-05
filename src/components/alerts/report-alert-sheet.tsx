
'use client';

import { useState, type FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createAlertServer } from '@/app/actions/firestore';

const alertTypes = [
  "Acidente",
  "Obras na Pista",
  "Congestionamento",
  "Neblina/Cond. Climática",
  "Animal na Pista",
  "Veículo Quebrado/Acidentado",
  "Queda de Barreira",
  "Fumaça na Pista",
  "Ocorrência Policial",
  "Manifestação",
  "Outro",
];

interface ReportAlertSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertCreated: () => void;
}

export default function ReportAlertSheet({ isOpen, onOpenChange, onAlertCreated }: ReportAlertSheetProps) {
  const { currentUser, userProfile, isProfileComplete } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canSubmit = description.trim().length >= 20 && description.trim().length <= 1100 && type;
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isProfileComplete) {
      toast({
        variant: "destructive",
        title: "Ação Requerida",
        description: "Você precisa estar logado e com perfil completo para criar um alerta."
      });
      return;
    }
    if (!canSubmit) return;

    setIsSubmitting(true);
    const result = await createAlertServer({
      type,
      location: location.trim() || null,
      description,
      userId: currentUser.uid,
      userName: userProfile?.displayName || 'Usuário Anônimo',
      userAvatarUrl: userProfile?.photoURL || null,
      userLocation: userProfile?.location,
      instagramUsername: userProfile?.instagramUsername,
      bio: userProfile?.bio,
    });

    if (result.success) {
      toast({ title: "Alerta Publicado!", description: "Obrigado por sua colaboração." });
      onAlertCreated();
      onOpenChange(false);
      // Reset form
      setType('');
      setLocation('');
      setDescription('');
    } else {
      toast({ variant: "destructive", title: "Erro ao Publicar", description: result.error || 'Não foi possível criar o alerta.' });
    }
    setIsSubmitting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-2xl">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-center font-headline text-xl">Reportar Alerta</SheetTitle>
          <SheetDescription className="text-center text-sm">
            Informe a comunidade sobre o que está acontecendo na estrada.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4 flex-grow">
            <div>
              <Label htmlFor="alert-type">Tipo de Ocorrência</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="alert-type" className="w-full mt-1">
                  <SelectValue placeholder="Selecione o tipo de alerta..." />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-location">Localização (Opcional)</Label>
              <Input
                id="alert-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: BR-277, km 340, próximo a Guarapuava"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alert-description">Descrição</Label>
              <Textarea
                id="alert-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o que está acontecendo."
                className="mt-1 min-h-[120px]"
                maxLength={1100}
              />
               <p className="text-xs text-muted-foreground mt-1 text-right">{description.length} / 1100 (mín 20)</p>
            </div>
          </div>
          <div className="p-4 border-t sticky bottom-0 bg-background">
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publicar Alerta
            </Button>
            <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full mt-2">Cancelar</Button>
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

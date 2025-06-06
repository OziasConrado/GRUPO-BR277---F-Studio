
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { PlusCircle, ListFilter, ArrowLeft, Edit, XCircle, Check, Flame, Construction, MessageSquare } from "lucide-react";
import Link from 'next/link';
import AlertCard, { type AlertProps } from '@/components/alerts/alert-card';
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';


const alertTypesOptions = [
  'Acidente', 'Obras na Pista', 'Congestionamento',
  'Condição Climática Adversa', 'Animal na Pista', 'Alagamento',
  'Neve/Gelo', 'Vento Forte', 'Queimada, fumaça densa sobre a pista', 'Remoção de veículo acidentado', 'Outro'
];


const mockAlertsData: AlertProps[] = [
  {
    id: 'alert-1',
    type: 'Acidente',
    location: 'BR-116, Km 230, Próximo a Curitiba-PR',
    description: 'Colisão entre dois caminhões. Trânsito lento nos dois sentidos. Equipes de resgate no local.',
    timestamp: '2024-07-28T10:30:00Z',
    userNameReportedBy: 'Usuário_123',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=U1',
    dataAIAvatarHint: 'male driver',
    bio: 'Contribuindo com a comunidade rodoviária.',
    instagramUsername: 'user123_estrada',
  },
  {
    id: 'alert-2',
    type: 'Obras na Pista',
    location: 'Rodovia dos Bandeirantes, Km 55, Sentido Interior',
    description: 'Recapeamento da via. Faixa da direita interditada. Previsão de término: 18:00.',
    timestamp: '2024-07-28T08:15:00Z',
    userNameReportedBy: 'Admin RotaSegura',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=RS',
    dataAIAvatarHint: 'app logo admin',
    bio: 'Canal oficial de alertas do Rota Segura.',
  },
  {
    id: 'alert-3',
    type: 'Congestionamento',
    location: 'Marginal Tietê, Próximo à Ponte das Bandeiras, São Paulo-SP',
    description: 'Trânsito intenso devido a excesso de veículos. Evite a região se possível.',
    timestamp: '2024-07-28T11:00:00Z',
    userNameReportedBy: 'Usuário_AB',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=UA',
    dataAIAvatarHint: 'female traveler',
    bio: 'Viajante frequente compartilhando informações.',
  },
  {
    id: 'alert-4',
    type: 'Queimada, fumaça densa sobre a pista',
    location: 'BR-070, Km 50, Próximo a Cáceres-MT',
    description: 'Grande queimada às margens da rodovia, fumaça densa cobrindo a pista. Visibilidade muito reduzida. Incêndio se alastrando rapidamente.',
    timestamp: '2024-07-29T14:00:00Z',
    userNameReportedBy: 'FazendeiroLocal',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=FL',
    dataAIAvatarHint: 'farmer man',
    bio: 'Morador da região, sempre atento às estradas.',
  },
  {
    id: 'alert-5',
    type: 'Remoção de veículo acidentado',
    location: 'Via Dutra, Km 180, Sentido Rio',
    description: 'Guincho e equipes da concessionária removendo caminhão acidentado. Duas faixas interditadas. Congestionamento de 3km.',
    timestamp: '2024-07-29T15:30:00Z',
    userNameReportedBy: 'ConcessionariaApoio',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=CA',
    dataAIAvatarHint: 'road worker',
    bio: 'Equipe de apoio da concessionária.',
  },
];


export default function AlertasPage() {
  const [isReportingAlert, setIsReportingAlert] = useState(false);
  const [newAlertDescription, setNewAlertDescription] = useState('');
  const [newAlertType, setNewAlertType] = useState('');
  const [alerts, setAlerts] = useState<AlertProps[]>(mockAlertsData);
  const { toast } = useToast();

  // Ordenar alertas por data/hora mais recente ao montar e quando novos alertas são adicionados
  useEffect(() => {
    const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (JSON.stringify(sortedAlerts) !== JSON.stringify(alerts)) {
        setAlerts(sortedAlerts);
    }
  }, [alerts]);

  const handleToggleReportAlert = () => {
    setIsReportingAlert(!isReportingAlert);
    if (isReportingAlert) { // Se estava aberto e vai fechar, limpa os campos
        setNewAlertDescription('');
        setNewAlertType('');
    }
  };

  const handleReportAlert = (e: FormEvent) => {
    e.preventDefault();
    if (!newAlertDescription.trim() || !newAlertType) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, preencha a descrição e selecione o tipo de alerta.',
      });
      return;
    }

    const newAlert: AlertProps = {
      id: `alert-${Date.now()}`,
      type: newAlertType,
      location: 'Localização a ser definida (ex: GPS)', // Simulação, localização precisaria ser obtida
      description: newAlertDescription,
      timestamp: new Date().toISOString(),
      userNameReportedBy: 'Você',
      userAvatarUrl: 'https://placehold.co/40x40.png?text=EU', // Placeholder para o avatar do usuário atual
      dataAIAvatarHint: 'current user',
      bio: 'Usuário ativo do Rota Segura.',
      instagramUsername: 'seu_insta_aqui',
    };

    setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    setNewAlertDescription('');
    setNewAlertType('');
    setIsReportingAlert(false);
    toast({
      title: "Alerta Reportado!",
      description: "Obrigado por sua contribuição para a comunidade.",
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className='w-full sm:w-auto'>
            <h1 className="text-3xl font-bold font-headline text-center sm:text-left">Alertas da Comunidade</h1>
            <p className="text-muted-foreground text-center sm:text-left text-sm">Informações em tempo real sobre as estradas.</p>
        </div>
        <Button
            onClick={handleToggleReportAlert}
            className={cn(
                "w-full sm:w-auto",
                "bg-transparent border border-primary text-primary",
                "hover:bg-primary/10 hover:text-primary"
            )}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isReportingAlert ? 'Cancelar Alerta' : 'Reportar Novo Alerta'}
        </Button>
      </div>

      {isReportingAlert && (
        <div className="p-4 rounded-xl bg-card border shadow-md">
          <CardTitle className="font-headline flex items-center text-lg mb-3">Novo Alerta</CardTitle>
          <form onSubmit={handleReportAlert} className="space-y-4">
            <div>
              <Label htmlFor="alertType">Tipo de Alerta</Label>
              <Select onValueChange={setNewAlertType} value={newAlertType}>
                <SelectTrigger id="alertType" className="w-full rounded-lg mt-1 bg-background/70">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {alertTypesOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alertDescription">Descrição</Label>
              <Textarea
                id="alertDescription"
                placeholder="Descreva a ocorrência..."
                value={newAlertDescription}
                onChange={(e) => setNewAlertDescription(e.target.value)}
                className="rounded-lg mt-1 min-h-[100px] bg-background/70"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={handleToggleReportAlert}>Cancelar</Button>
                <Button type="submit">
                    <Check className="mr-2 h-4 w-4"/>
                    Enviar Alerta
                </Button>
            </div>
          </form>
        </div>
      )}

      {/* Banner AdMob Placeholder */}
      <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
      </div>
      
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-4">Nenhum alerta encontrado.</p>
      )}

       <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mt-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Feed
      </Link>
    </div>
  );
}

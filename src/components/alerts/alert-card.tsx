
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileData, default as UserProfileModal } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Car, Construction, CloudFog, Clock, UserCircle, TrafficCone, Waves, MountainSnow, Wind, Flame } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AlertProps {
  id: string;
  type: string; // Tipos customizáveis
  location: string;
  description: string;
  timestamp: string; // ISO 8601 string
  userNameReportedBy: string; // Nome do usuário que reportou
  userAvatarUrl?: string;
  dataAIAvatarHint?: string;
  bio?: string;
  instagramUsername?: string;
}

interface AlertCardProps {
  alert: AlertProps;
}

const getAlertIcon = (type: AlertProps['type']) => {
  switch (type) {
    case 'Acidente':
      return <Car className="h-5 w-5 text-red-500" />;
    case 'Obras na Pista':
    case 'Remoção de veículo acidentado': // Novo tipo usando mesmo ícone
      return <Construction className="h-5 w-5 text-yellow-500" />;
    case 'Congestionamento':
      return <TrafficCone className="h-5 w-5 text-orange-500" />;
    case 'Condição Climática Adversa':
      return <CloudFog className="h-5 w-5 text-blue-500" />;
    case 'Animal na Pista':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dog text-yellow-600"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M18 10V7a2 2 0 0 0-2-2h-1"/><path d="M14 12a2 2 0 1 1 0-4h4v4a2 2 0 0 1-2 2h-2Z"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m18 18-3-10-1 2-1.5-1-1.5 1-1-2-3 10"/></svg>;
    case 'Alagamento':
      return <Waves className="h-5 w-5 text-sky-600" />;
    case 'Neve/Gelo':
      return <MountainSnow className="h-5 w-5 text-cyan-400" />;
    case 'Vento Forte':
      return <Wind className="h-5 w-5 text-gray-500" />;
    case 'Queimada, fumaça densa sobre a pista': // Novo tipo
      return <Flame className="h-5 w-5 text-orange-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-primary" />;
  }
};

export default function AlertCard({ alert }: AlertCardProps) {
  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  const handleReporterClick = () => {
    setSelectedUserProfile({
      id: alert.id, // Usando o ID do alerta como ID do perfil (simulação)
      name: alert.userNameReportedBy,
      avatarUrl: alert.userAvatarUrl,
      dataAIAvatarHint: alert.dataAIAvatarHint,
      location: "Localização do Usuário", // Simulação
      bio: alert.bio || "Usuário da comunidade Rota Segura.",
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <Card className="w-full shadow-md rounded-lg overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-white/10 dark:border-slate-700/10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <CardTitle className="text-lg font-headline">{alert.type}</CardTitle>
              </div>
              {/* Badge de severidade removido */}
          </div>
          <CardDescription className="text-xs pt-1">{alert.location}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm leading-relaxed">{alert.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 pb-3">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>{timeAgo}</span>
          </div>
          {alert.userNameReportedBy && (
            <button
              onClick={handleReporterClick}
              className="flex items-center cursor-pointer hover:underline focus:outline-none"
              aria-label={`Ver perfil de ${alert.userNameReportedBy}`}
            >
              <Avatar className="h-6 w-6 mr-1.5 border-2 border-primary/30">
                {alert.userAvatarUrl ? <AvatarImage src={alert.userAvatarUrl} alt={alert.userNameReportedBy} data-ai-hint={alert.dataAIAvatarHint} /> : null}
                <AvatarFallback className="text-xs">
                  {alert.userNameReportedBy ? alert.userNameReportedBy.substring(0,1).toUpperCase() : <UserCircle className="h-4 w-4"/>}
                </AvatarFallback>
              </Avatar>
              <span>{alert.userNameReportedBy}</span>
            </button>
          )}
        </CardFooter>
      </Card>
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUserProfile}
      />
    </>
  );
}

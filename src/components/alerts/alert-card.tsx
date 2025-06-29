'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileData, default as UserProfileModal } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Car, Ambulance, Construction, CloudFog, Clock, UserCircle, Flame, Crane, Droplets, Mountain, Siren, Users, Dog } from "lucide-react";
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
  userLocation?: string;
}

interface AlertCardProps {
  alert: AlertProps;
}

const getAlertIcon = (type: AlertProps['type']) => {
  switch (type) {
    case 'Acidente':
      return <Ambulance className="h-5 w-5 text-red-500" />;
    case 'Obras na Pista':
      return <Construction className="h-5 w-5 text-yellow-500" />;
    case 'Congestionamento':
      return <Car className="h-5 w-5 text-orange-500" />;
    case 'Neblina/Cond. Climática':
      return <CloudFog className="h-5 w-5 text-blue-500" />;
    case 'Remoção/Veículo Acidentado':
        return <Crane className="h-5 w-5 text-blue-500" />;
    case 'Óleo na Pista':
        return <Droplets className="h-5 w-5 text-slate-600" />;
    case 'Queda de Barreira':
        return <Mountain className="h-5 w-5 text-gray-500" />;
    case 'Animal na Pista':
      return <Dog className="h-5 w-5 text-yellow-600" />;
    case 'Queimada/Fumaça':
      return <Flame className="h-5 w-5 text-orange-600" />;
    case 'Ocorrência Policial':
        return <Siren className="h-5 w-5 text-red-600" />;
    case 'Manifestação Popular':
        return <Users className="h-5 w-5 text-blue-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-primary" />;
  }
};

export default function AlertCard({ alert }: AlertCardProps) {
  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '')
      .replace(' minuto', ' min')
      .replace(' minutos', ' min')
      .replace(' hora', ' h')
      .replace(' horas', ' h')
      .replace(' dia', ' d')
      .replace(' dias', ' d')
      .replace('mês', 'm')
      .replace('meses', 'm')
      .replace(' ano', 'a')
      .replace(' anos', 'a');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  const handleReporterClick = () => {
    setSelectedUserProfile({
      id: alert.id, // Usando o ID do alerta como ID do perfil (simulação)
      name: alert.userNameReportedBy,
      avatarUrl: alert.userAvatarUrl,
      dataAIAvatarHint: alert.dataAIAvatarHint,
      location: alert.userLocation,
      bio: alert.bio || "Usuário da comunidade Rota Segura.",
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <Card className="w-full shadow-md rounded-lg overflow-hidden bg-white dark:bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <CardTitle className="text-lg font-headline">{alert.type}</CardTitle>
              </div>
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

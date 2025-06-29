
'use client';

import { useState } from 'react';
import type { StaticImageData } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Construction, Car, Ambulance, Flame, CloudFog, Clock, UserCircle, MapPin, Crane, Droplets, MountainSnow, Siren, Users } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface HomeAlertCardData {
  id: string;
  type: string;
  description: string; // Location should be part of this
  timestamp: string; // ISO 8601 string
  userNameReportedBy: string;
  userAvatarUrl?: string | StaticImageData;
  dataAIAvatarHint?: string;
  bio?: string;
  instagramUsername?: string;
  userLocation?: string;
}

interface HomeAlertCardProps {
  alert: HomeAlertCardData;
}

const AlertTypeIcon = ({ type, className }: { type: string, className?: string }) => {
  const iconProps = { className: cn("h-5 w-5", className) };
  switch (type) {
    case 'Acidente':
      return <Ambulance {...iconProps} className={cn(iconProps.className, "text-red-500")} />;
    case 'Obras na Pista':
    case 'Obras':
      return <Construction {...iconProps} className={cn(iconProps.className, "text-yellow-500")} />;
    case 'Congestionamento':
      return <Car {...iconProps} className={cn(iconProps.className, "text-orange-500")} />;
    case 'Neblina/Cond. Climática':
      return <CloudFog {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
    case 'Remoção/Veículo Acidentado':
        return <Crane {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
    case 'Óleo na Pista':
        return <Droplets {...iconProps} className={cn(iconProps.className, "text-slate-600")} />;
    case 'Queda de Barreira':
        return <MountainSnow {...iconProps} className={cn(iconProps.className, "text-gray-500")} />;
    case 'Animal na Pista':
      return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(iconProps.className, "text-yellow-600")}><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M18 10V7a2 2 0 0 0-2-2h-1"/><path d="M14 12a2 2 0 1 1 0-4h4v4a2 2 0 0 1-2 2h-2Z"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m18 18-3-10-1 2-1.5-1-1.5 1-1-2-3 10"/></svg>;
    case 'Queimada/Fumaça':
      return <Flame {...iconProps} className={cn(iconProps.className, "text-orange-600")} />;
    case 'Ocorrência Policial':
        return <Siren {...iconProps} className={cn(iconProps.className, "text-red-600")} />;
    case 'Manifestação Popular':
        return <Users {...iconProps} className={cn(iconProps.className, "text-blue-600")} />;
    default:
      return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-primary")} />;
  }
};


export default function HomeAlertCard({ alert }: HomeAlertCardProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

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

  const handleReporterClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if card is wrapped in Link
    e.stopPropagation(); // Prevent navigation
    setSelectedUserProfile({
      id: alert.id, 
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
      <Card className="w-[calc(100vw-4rem)] sm:w-[350px] flex flex-col h-full rounded-xl shadow-lg overflow-hidden bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
        <CardHeader className="p-3 pb-1.5">
          <div className="flex items-center gap-2">
            <AlertTypeIcon type={alert.type} />
            <CardTitle className="text-base font-headline truncate">{alert.type}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 flex-grow">
          <CardDescription className="text-sm text-foreground/80 line-clamp-4">
            {alert.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-3 pt-1.5 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
          <button
            onClick={handleReporterClick}
            className="flex items-center cursor-pointer hover:underline focus:outline-none group min-w-0" // Added min-w-0 for flex truncation
            aria-label={`Ver perfil de ${alert.userNameReportedBy}`}
          >
            <Avatar className="h-5 w-5 mr-1.5 border border-primary/20 group-hover:border-primary/40 transition-all flex-shrink-0">
              {alert.userAvatarUrl ? <AvatarImage src={alert.userAvatarUrl as string} alt={alert.userNameReportedBy} data-ai-hint={alert.dataAIAvatarHint} /> : null}
              <AvatarFallback className="text-[10px]">
                {alert.userNameReportedBy ? alert.userNameReportedBy.substring(0,1).toUpperCase() : <UserCircle className="h-3 w-3"/>}
              </AvatarFallback>
            </Avatar>
            <span className="group-hover:text-primary transition-colors truncate"> {/* Added truncate here */}
              {alert.userNameReportedBy}
            </span>
          </button>
          <div className="flex items-center flex-shrink-0 ml-2"> {/* Added ml-2 for spacing */}
            <Clock className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">{timeAgo}</span> {/* Added whitespace-nowrap */}
          </div>
        </CardFooter>
      </Card>
      {selectedUserProfile && (
        <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={selectedUserProfile}
        />
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import type { StaticImageData } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Construction, Car, Ambulance, Flame, CloudFog, Clock, UserCircle, MapPin, Wrench, Droplets, Mountain, Siren, Users, Dog } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

const iconMap: Record<string, React.ElementType> = {
  'Acidente': Ambulance,
  'Obras na Pista': Construction,
  'Obras': Construction,
  'Congestionamento': Car,
  'Neblina/Cond. Climática': CloudFog,
  'Remoção/Veículo Acidentado': Wrench,
  'Óleo na Pista': Droplets,
  'Queda de Barreira': Mountain,
  'Animal na Pista': Dog,
  'Queimada/Fumaça': Flame,
  'Ocorrência Policial': Siren,
  'Manifestação Popular': Users,
};

const colorMap: Record<string, string> = {
    'Acidente': "text-red-500",
    'Obras na Pista': "text-yellow-500",
    'Obras': "text-yellow-500",
    'Congestionamento': "text-orange-500",
    'Neblina/Cond. Climática': "text-blue-500",
    'Remoção/Veículo Acidentado': "text-blue-500",
    'Óleo na Pista': "text-slate-600",
    'Queda de Barreira': "text-gray-500",
    'Animal na Pista': "text-yellow-600",
    'Queimada/Fumaça': "text-orange-600",
    'Ocorrência Policial': "text-red-600",
    'Manifestação Popular': "text-blue-600"
};

const AlertTypeIcon = ({ type, className }: { type: string, className?: string }) => {
  const IconComponent = iconMap[type] || AlertTriangle;
  const colorClass = colorMap[type] || "text-primary";
  const finalClassName = cn("h-5 w-5", className, colorClass);

  return <IconComponent className={finalClassName} />;
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
      bio: alert.bio || "Usuário da comunidade GRUPO BR277.",
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <Card className="w-[150px] h-[250px] flex flex-col rounded-xl shadow-lg overflow-hidden bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
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
               <div className="relative w-full h-full">
                {alert.userAvatarUrl ? (
                  <Image
                    src={alert.userAvatarUrl as string}
                    alt={alert.userNameReportedBy}
                    fill
                    sizes="20px"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={alert.dataAIAvatarHint}
                  />
                ) : (
                  <AvatarFallback className="text-[10px]">
                    {alert.userNameReportedBy ? alert.userNameReportedBy.substring(0,1).toUpperCase() : <UserCircle className="h-3 w-3"/>}
                  </AvatarFallback>
                )}
              </div>
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

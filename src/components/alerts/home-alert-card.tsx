
'use client';

import { useState } from 'react';
import type { StaticImageData } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Construction, TrafficConeIcon as TrafficCone, Flame, CloudFog, Clock, UserCircle, MapPin } from "lucide-react";
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
}

interface HomeAlertCardProps {
  alert: HomeAlertCardData;
}

const AlertTypeIcon = ({ type, className }: { type: string, className?: string }) => {
  const iconProps = { className: cn("h-5 w-5", className) };
  switch (type) {
    case 'Acidente':
      return <AlertTriangle {...iconProps} color="hsl(var(--destructive))" />;
    case 'Obras na Pista':
    case 'Obras':
      return <Construction {...iconProps} color="hsl(var(--primary))" />;
    case 'Congestionamento':
      return <TrafficCone {...iconProps} color="hsl(var(--accent))" />;
    case 'Condição Climática Adversa':
    case 'Neblina':
      return <CloudFog {...iconProps} color="hsl(var(--muted-foreground))" />;
    case 'Queimada':
      return <Flame {...iconProps} color="hsl(var(--destructive))" />;
    default:
      return <AlertTriangle {...iconProps} color="hsl(var(--primary))" />;
  }
};


export default function HomeAlertCard({ alert }: HomeAlertCardProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR });

  const handleReporterClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if card is wrapped in Link
    e.stopPropagation(); // Prevent navigation
    setSelectedUserProfile({
      id: alert.id, 
      name: alert.userNameReportedBy,
      avatarUrl: alert.userAvatarUrl,
      dataAIAvatarHint: alert.dataAIAvatarHint,
      location: "Localização do Usuário", // Placeholder as actual location isn't in alert card data
      bio: alert.bio || "Usuário da comunidade Rota Segura.",
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <Card className="w-[260px] h-full flex flex-col rounded-xl shadow-lg overflow-hidden bg-card hover:bg-card/95 dark:hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
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

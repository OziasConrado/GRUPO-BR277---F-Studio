
'use client';

import type { StaticImageData } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertTriangle, Construction, Car, Ambulance, Flame, CloudFog, Clock, Wrench, Droplets, Mountain, Siren, Users, Dog } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import UserProfileModal, { type UserProfileData } from '../profile/UserProfileModal';
import { useToast } from '@/hooks/use-toast';

export interface HomeAlertCardData {
  id: string;
  type: string;
  description: string;
  timestamp: string; // ISO 8601 string
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userLocation?: string;
  bio?: string;
  instagramUsername?: string;
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
  'Veículo Quebrado/Acidentado': Wrench,
  'Manifestação': Users,
  'Outro': AlertTriangle,
};

const colorMap: Record<string, string> = {
    'Acidente': "text-red-500",
    'Obras na Pista': "text-yellow-500",
    'Congestionamento': "text-orange-500",
    'Neblina/Cond. Climática': "text-blue-500",
    'Veículo Quebrado/Acidentado': "text-blue-500",
    'Queda de Barreira': "text-gray-500",
    'Animal na Pista': "text-yellow-600",
    'Queimada/Fumaça': "text-orange-600",
    'Ocorrência Policial': "text-red-600",
    'Manifestação': "text-blue-600",
    'Outro': "text-slate-500",
};

const AlertTypeIcon = ({ type, className }: { type: string, className?: string }) => {
  const IconComponent = iconMap[type] || AlertTriangle;
  const colorClass = colorMap[type] || "text-primary";
  const finalClassName = cn("h-5 w-5", className, colorClass);

  return <IconComponent className={finalClassName} />;
};

const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/grupobr277-v2-d85f5.appspot.com/o/images%2FImagem%20Gen%C3%A9rica%20-%20Foto%20de%20Perfil%20Feed%20BR277.png?alt=media&token=e25d36e2-2a29-45aa-872f-c57317589d31';

export default function HomeAlertCard({ alert }: HomeAlertCardProps) {
  const { firestore } = useAuth();
  const { toast } = useToast();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '')
      .replace(' minuto', ' min')
      .replace(' minutos', ' min')
      .replace(' hora', ' h')
      .replace(' horas', ' h');

  const handleAuthorClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique navegue para a página de alertas
    e.preventDefault();

    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de banco de dados indisponível.' });
      return;
    }
    
    setSelectedUserProfile({
      id: alert.userId,
      name: alert.userName,
      avatarUrl: alert.userAvatarUrl,
      location: alert.userLocation,
      bio: alert.bio,
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };
  
  return (
    <>
        <Card className="w-full h-full flex flex-col rounded-xl shadow-md overflow-hidden bg-card hover:bg-muted/30 transition-colors duration-150 group">
          <Link href={`/alertas#${alert.id}`} passHref className="flex-grow flex flex-col">
            <CardHeader className="p-3 pb-1.5 flex-row items-center gap-2">
              <AlertTypeIcon type={alert.type} className="h-6 w-6" />
              <CardTitle className="text-base font-headline truncate group-hover:text-primary">{alert.type}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow">
              <p className="text-sm text-foreground/80 line-clamp-3">
                  {alert.description}
              </p>
            </CardContent>
          </Link>
          <CardFooter className="p-3 pt-1.5 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
             <button
              onClick={handleAuthorClick}
              className="flex items-center gap-1.5 cursor-pointer hover:underline focus:outline-none"
              aria-label={`Ver perfil de ${alert.userName}`}
            >
                <Avatar className="h-5 w-5 border">
                    <AvatarImage src={alert.userAvatarUrl || defaultAvatar} alt={alert.userName}/>
                    <AvatarFallback className="text-[10px]"><UserCircle /></AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{alert.userName}</span>
            </button>
            <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{timeAgo}</span>
            </div>
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


'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';
import { AlertTriangle, Car, Ambulance, Construction, CloudFog, Clock, UserCircle, Flame, Wrench, Droplets, Mountain, Siren, Users, Dog, Trash2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface AlertProps {
  id: string;
  userId: string;
  type: string;
  location: string;
  description: string;
  timestamp: string; // ISO 8601 string
  userName: string;
  userAvatarUrl?: string;
  bio?: string;
  instagramUsername?: string;
  userLocation?: string;
}

interface AlertCardProps {
  alert: AlertProps;
  onDelete: (alertId: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
    'Acidente': Ambulance,
    'Obras na Pista': Construction,
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

const getAlertIcon = (type: AlertProps['type']) => {
  const IconComponent = iconMap[type] || AlertTriangle;
  const colorClass = colorMap[type] || "text-primary";
  const finalClassName = cn("h-5 w-5", colorClass);

  return <IconComponent className={finalClassName} />;
};

export default function AlertCard({ alert, onDelete }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const { currentUser } = useAuth();
  
  const isAuthor = currentUser?.uid === alert.userId;

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

  const handleReporterClick = () => {
    setSelectedUserProfile({
      id: alert.userId,
      name: alert.userName,
      avatarUrl: alert.userAvatarUrl,
      location: alert.userLocation,
      bio: alert.bio || "Usuário da comunidade Rota Segura.",
      instagramUsername: alert.instagramUsername,
    });
    setIsProfileModalOpen(true);
  };

  const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/grupobr277-v2-d85f5.appspot.com/o/images%2FImagem%20Gen%C3%A9rica%20-%20Foto%20de%20Perfil%20Feed%20BR277.png?alt=media&token=e25d36e2-2a29-45aa-872f-c57317589d31';
  
  const MAX_CHARS = 300;
  const needsTruncation = alert.description.length > MAX_CHARS;

  return (
    <>
      <Card id={alert.id} className="w-full shadow-md rounded-lg overflow-hidden bg-card relative scroll-mt-20">
        {isAuthor && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive z-10">
                  <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir seu alerta? Esta ação é permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(alert.id)} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {needsTruncation && !isExpanded ? `${alert.description.substring(0, MAX_CHARS)}...` : alert.description}
            {needsTruncation && (
              <Button variant="link" size="sm" className="p-0 h-auto ml-1" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Ver menos' : 'Ler mais'}
              </Button>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 pb-3">
          {alert.userName && (
            <button
              onClick={handleReporterClick}
              className="flex items-center cursor-pointer hover:underline focus:outline-none"
              aria-label={`Ver perfil de ${alert.userName}`}
            >
              <Avatar className="h-6 w-6 mr-1.5 border-2 border-primary/30">
                <AvatarImage src={alert.userAvatarUrl || defaultAvatar} alt={alert.userName}/>
                <AvatarFallback className="text-xs">
                  {alert.userName ? alert.userName.substring(0,1).toUpperCase() : <UserCircle className="h-4 w-4"/>}
                </AvatarFallback>
              </Avatar>
              <span>{alert.userName}</span>
            </button>
          )}
           <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
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

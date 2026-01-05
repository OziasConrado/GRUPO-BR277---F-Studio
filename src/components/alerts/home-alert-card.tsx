
'use client';

import type { StaticImageData } from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Construction, Car, Ambulance, Flame, CloudFog, Clock, Wrench, Droplets, Mountain, Siren, Users, Dog } from "lucide-react";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

export interface HomeAlertCardData {
  id: string;
  type: string;
  description: string;
  timestamp: string; // ISO 8601 string
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
  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '')
      .replace(' minuto', ' min')
      .replace(' minutos', ' min')
      .replace(' hora', ' h')
      .replace(' horas', ' h');

  const MAX_CHARS = 300;
  const needsTruncation = alert.description.length > MAX_CHARS;

  return (
    <Card className="w-full flex flex-col rounded-xl shadow-md overflow-hidden bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
      <CardHeader className="p-3 pb-1.5 flex-row items-center gap-2">
        <AlertTypeIcon type={alert.type} className="h-6 w-6" />
        <CardTitle className="text-base font-headline truncate">{alert.type}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1 flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-4">
            {needsTruncation ? `${alert.description.substring(0, MAX_CHARS)}...` : alert.description}
            {needsTruncation && (
              <Button asChild variant="link" size="sm" className="p-0 h-auto ml-1 text-primary">
                <Link href={`/alertas`}>
                  Ler mais
                </Link>
              </Button>
            )}
        </p>
      </CardContent>
      <div className="p-3 pt-1.5 border-t border-border/50 flex justify-end items-center text-xs text-muted-foreground">
        <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{timeAgo}</span>
        </div>
      </div>
    </Card>
  );
}

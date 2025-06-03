
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Car, Construction, CloudFog, Clock, UserCircle, TrafficCone, Waves, MountainSnow, Wind } from "lucide-react"; // Alterado CarCrash para Car
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AlertProps {
  id: string;
  type: 'Acidente' | 'Obras na Pista' | 'Congestionamento' | 'Condição Climática Adversa' | 'Animal na Pista' | 'Alagamento' | 'Neve/Gelo' | 'Vento Forte' | string; // string para tipos customizados
  location: string;
  description: string;
  timestamp: string; // ISO 8601 string
  severity: 'Baixa' | 'Média' | 'Alta';
  reportedBy?: string;
}

interface AlertCardProps {
  alert: AlertProps;
}

const getAlertIcon = (type: AlertProps['type']) => {
  switch (type) {
    case 'Acidente':
      return <Car className="h-5 w-5 text-red-500" />; // Alterado CarCrash para Car
    case 'Obras na Pista':
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
    default:
      return <AlertTriangle className="h-5 w-5 text-primary" />;
  }
};

const getSeverityBadgeVariant = (severity: AlertProps['severity']): "default" | "secondary" | "destructive" => {
  switch (severity) {
    case 'Alta':
      return 'destructive';
    case 'Média':
      return 'default'; 
    case 'Baixa':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export default function AlertCard({ alert }: AlertCardProps) {
  const timeAgo = formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true, locale: ptBR });

  return (
    <Card className="w-full shadow-md rounded-lg overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-white/10 dark:border-slate-700/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
                {getAlertIcon(alert.type)}
                <CardTitle className="text-lg font-headline">{alert.type}</CardTitle>
            </div>
            <Badge variant={getSeverityBadgeVariant(alert.severity)}>{alert.severity}</Badge>
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
        {alert.reportedBy && (
          <div className="flex items-center">
            <UserCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>Reportado por: {alert.reportedBy}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

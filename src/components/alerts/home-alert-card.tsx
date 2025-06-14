
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon }  from "lucide-react";
import { AlertTriangle, Construction, TrafficConeIcon as TrafficCone, Flame, CloudFog } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeAlertCardProps {
  alert: {
    id: string;
    type: string;
    description: string;
    location: string;
  };
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
  return (
    <Card className="w-[260px] flex-shrink-0 rounded-xl shadow-lg overflow-hidden h-full flex flex-col bg-card hover:bg-card/95 dark:hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <AlertTypeIcon type={alert.type} />
          <CardTitle className="text-base font-headline truncate">{alert.type}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 flex-grow flex flex-col justify-between">
        <div>
          <CardDescription className="text-sm text-foreground/80 line-clamp-3 mb-1.5">
            {alert.description}
          </CardDescription>
        </div>
        <p className="text-xs text-muted-foreground truncate pt-1 border-t border-border/50 mt-auto">
          {alert.location}
        </p>
      </CardContent>
    </Card>
  );
}

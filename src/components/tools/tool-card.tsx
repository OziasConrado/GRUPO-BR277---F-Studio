import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export interface ToolCardProps {
  title: string;
  Icon: LucideIcon;
  href: string;
  description: string;
}

export default function ToolCard({ title, Icon, href, description }: ToolCardProps) {
  return (
    <Link href={href} passHref>
      <Card className="group rounded-xl overflow-hidden h-full flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-1 font-headline">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}


'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  Icon: LucideIcon;
  href: string;
  className?: string;
  iconClassName?: string;
}

export default function FeatureCard({ title, Icon, href, className, iconClassName }: FeatureCardProps) {
  return (
    <Link href={href} passHref className="block group">
      <Card className={cn("rounded-xl overflow-hidden h-full hover:shadow-lg transition-shadow duration-200 bg-card hover:bg-card/90", className)}>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
          <div className={cn("p-3 mb-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors", iconClassName)}>
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{title}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

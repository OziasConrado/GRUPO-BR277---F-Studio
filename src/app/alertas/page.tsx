
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Keep Button for consistency if needed for Link
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Keep Card for basic structure

export default function AlertasPage() {
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alertas da Comunidade (Versão Simplificada)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta é uma versão de teste simplificada da página de alertas. Se você está vendo isso,
            o problema que impedia o aplicativo de abrir pode estar relacionado ao conteúdo original
            desta página ou a um de seus componentes.
          </p>
          <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
          </div>
          <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o Feed
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GuiaComercialPage() {
  return (
    <div className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2 font-headline">Guia Comercial</h1>
        <p className="text-muted-foreground">Encontre os melhores estabelecimentos na sua rota.</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <Card className="w-full max-w-md p-6 sm:p-8 border-dashed rounded-2xl bg-muted/30">
          <CardContent className="p-0">
            <Construction className="h-16 w-16 mx-auto text-primary/70 mb-5" />
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">Em Desenvolvimento</h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Nosso Guia Comercial está sendo preparado com os melhores parceiros para você. Em breve, esta seção estará cheia de novidades!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

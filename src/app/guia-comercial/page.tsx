
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat } from "lucide-react";

export default function GuiaComercialPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center pb-4">
          <div className="p-4 bg-primary/10 rounded-full mb-3">
             <HardHat className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Guia Comercial em Obras!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed">
            Estamos preparando uma plataforma incrível com novas parcerias e um sistema de pagamentos seguro para você encontrar os melhores serviços na sua rota.
          </CardDescription>
          <p className="mt-4 text-sm text-muted-foreground">Agradecemos a paciência e volte em breve para conferir!</p>
        </CardContent>
      </Card>
    </div>
  );
}

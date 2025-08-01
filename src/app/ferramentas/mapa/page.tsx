import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MapaPage() {
  return (
    <div className="w-full">
       <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Mapa Interativo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta ferramenta está em desenvolvimento.</p>
          <p className="mt-2">Em breve você poderá navegar em nosso mapa interativo!</p>
           <div className="mt-4 h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-foreground">Simulação de Mapa Aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

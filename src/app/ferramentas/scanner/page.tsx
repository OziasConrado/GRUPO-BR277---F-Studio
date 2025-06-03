import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

export default function ScannerPage() {
  return (
    <div className="w-full">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Scanner de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Esta ferramenta está em desenvolvimento.</p>
          <p className="mt-2 mb-4">Em breve você poderá escanear seus documentos aqui!</p>
          <div className="mt-4 h-64 border-2 border-dashed border-muted-foreground/50 rounded-lg flex flex-col items-center justify-center bg-muted/20">
            <Camera className="w-16 h-16 text-muted-foreground mb-2"/>
            <p className="text-muted-foreground">Toque para escanear</p>
          </div>
           <Button className="mt-6 w-full rounded-lg" disabled>Iniciar Scanner</Button>
        </CardContent>
      </Card>
    </div>
  );
}
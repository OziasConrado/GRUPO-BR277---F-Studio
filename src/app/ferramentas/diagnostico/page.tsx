
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

export default function DiagnosticoPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="rounded-xl shadow-md">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Wrench className="w-7 h-7 text-primary"/>
                <CardTitle className="font-headline text-xl sm:text-2xl">Diagnóstico Básico de Problemas</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">Esta ferramenta não está mais ativa.</p>
        </CardContent>
      </Card>
    </div>
  );
}

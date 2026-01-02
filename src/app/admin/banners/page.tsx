'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield } from "lucide-react";

export default function AdminBannersPage() {

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold font-headline">Gerenciar Banners</h1>
                <p className="text-muted-foreground text-sm">Adicione, edite ou remova os banners do site.</p>
            </div>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banners Atuais</CardTitle>
          <CardDescription>Lista de todos os banners cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>A interface de gerenciamento de banners será implementada aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

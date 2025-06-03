import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CalculadoraCombustivelPage() {
  return (
    <div className="w-full">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Calculadora de Combustível</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Calcule o consumo e custo de combustível para sua viagem.</p>
          <form className="space-y-4">
            <div>
              <Label htmlFor="distancia">Distância da Viagem (km)</Label>
              <Input type="number" id="distancia" placeholder="Ex: 500" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="consumo_medio">Consumo Médio do Veículo (km/l)</Label>
              <Input type="number" id="consumo_medio" placeholder="Ex: 10" className="rounded-lg mt-1"/>
            </div>
            <div>
              <Label htmlFor="preco_combustivel">Preço do Combustível (R$/litro)</Label>
              <Input type="number" id="preco_combustivel" placeholder="Ex: 5.50" className="rounded-lg mt-1"/>
            </div>
            <Button type="submit" className="w-full rounded-lg">Calcular</Button>
          </form>
          <div className="mt-6 p-4 bg-background/50 rounded-lg">
            <h4 className="font-semibold mb-2">Resultado:</h4>
            <p>Litros necessários: <span className="font-bold">-</span></p>
            <p>Custo total: <span className="font-bold">R$ -</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
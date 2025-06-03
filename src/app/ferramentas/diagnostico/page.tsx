import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";

export default function DiagnosticoPage() {
  return (
    <div className="w-full">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="glassmorphic rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Diagnóstico Básico de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Selecione o sintoma para ver possíveis causas e soluções.</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sintoma">Selecione o Sintoma</Label>
              <Select>
                <SelectTrigger id="sintoma" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder="Escolha um sintoma..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor_nao_liga">Motor não liga</SelectItem>
                  <SelectItem value="superaquecimento">Superaquecimento</SelectItem>
                  <SelectItem value="fumaca_escapamento">Fumaça no escapamento</SelectItem>
                  <SelectItem value="barulho_estranho">Barulho estranho</SelectItem>
                  <SelectItem value="perda_potencia">Perda de potência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full rounded-lg">Ver Diagnóstico</Button>
          </div>

          <div className="mt-6 p-4 bg-background/50 rounded-lg min-h-[100px]">
            <h4 className="font-semibold mb-2 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-primary"/>Possíveis Causas e Soluções:</h4>
            <p className="text-sm text-muted-foreground">Selecione um sintoma para ver as informações.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const checklistItems = [
  { id: "doc_veiculo", label: "Documentos do veículo (CRLV)" },
  { id: "cnh", label: "CNH válida" },
  { id: "oleo", label: "Verificar nível do óleo" },
  { id: "pneus", label: "Calibrar pneus" },
  { id: "agua", label: "Verificar água do radiador" },
  { id: "ferramentas_basicas", label: "Kit de ferramentas básicas" },
  { id: "estepe", label: "Estepe em bom estado" },
];


export default function ChecklistPage() {
  return (
    <div className="w-full">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Checklist de Viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Marque os itens verificados para sua viagem.</p>
          <div className="space-y-3">
            {checklistItems.map(item => (
              <div key={item.id} className="flex items-center space-x-2 p-2 bg-background/50 rounded-md">
                <Checkbox id={item.id} />
                <Label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
           <Button className="mt-6 w-full">Salvar Checklist</Button>
        </CardContent>
      </Card>
    </div>
  );
}

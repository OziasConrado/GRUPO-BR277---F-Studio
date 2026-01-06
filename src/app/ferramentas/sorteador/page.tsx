
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Dices, Share2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

export default function SorteadorPage() {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [names, setNames] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);

  const animateResult = (res: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setResult(res);
      setIsAnimating(false);
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  };

  const handleSortearNumero = () => {
    setResult(null);
    const minNum = parseInt(min);
    const maxNum = parseInt(max);

    if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) {
      toast({
        variant: 'destructive',
        title: 'Valores Inválidos',
        description: 'Por favor, insira um valor mínimo e máximo válidos, com o mínimo sendo menor que o máximo.',
      });
      return;
    }

    const sorteado = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    animateResult(sorteado.toString());
  };

  const handleSortearNome = () => {
    setResult(null);
    const nameList = names.split(',').map(name => name.trim()).filter(name => name);

    if (nameList.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Nomes Insuficientes',
        description: 'Por favor, insira pelo menos dois nomes separados por vírgula.',
      });
      return;
    }

    const sorteado = nameList[Math.floor(Math.random() * nameList.length)];
    animateResult(sorteado);
  };

  const handleLimpar = (tab: 'numeros' | 'nomes') => {
    setResult(null);
    if (tab === 'numeros') {
      setMin('');
      setMax('');
    } else {
      setNames('');
    }
    toast({ title: 'Campos Limpos' });
  };
  
  const handleShare = () => {
    if (!result) return;
    const text = `🍀 O resultado do sorteio no Grupo BR-277 foi: *${result}*`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dices className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Sorteador Dinâmico</CardTitle>
          </div>
          <CardDescription>Sorteie números ou nomes de forma fácil e rápida.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <Tabs defaultValue="numeros" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="numeros">Sortear Números</TabsTrigger>
              <TabsTrigger value="nomes">Sortear Nomes</TabsTrigger>
            </TabsList>
            <TabsContent value="numeros" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min">Número Mínimo</Label>
                  <Input id="min" type="number" value={min} onChange={e => setMin(e.target.value)} placeholder="Ex: 1" className="rounded-lg mt-1" />
                </div>
                <div>
                  <Label htmlFor="max">Número Máximo</Label>
                  <Input id="max" type="number" value={max} onChange={e => setMax(e.target.value)} placeholder="Ex: 100" className="rounded-lg mt-1" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                 <Button type="button" variant="outline" onClick={() => handleLimpar('numeros')} className="w-full sm:w-auto rounded-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Limpar
                </Button>
                <Button onClick={handleSortearNumero} className="w-full sm:flex-1 rounded-full py-3 text-base">
                  <Dices className="mr-2 h-5 w-5" /> Sortear Número
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="nomes" className="mt-6 space-y-4">
              <div>
                <Label htmlFor="names">Nomes (separados por vírgula)</Label>
                <Textarea id="names" value={names} onChange={e => setNames(e.target.value)} placeholder="Ex: João, Maria, José, Ana" className="rounded-lg mt-1 min-h-[100px]" />
              </div>
               <div className="flex flex-col sm:flex-row gap-2 pt-3">
                 <Button type="button" variant="outline" onClick={() => handleLimpar('nomes')} className="w-full sm:w-auto rounded-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Limpar
                </Button>
                <Button onClick={handleSortearNome} className="w-full sm:flex-1 rounded-full py-3 text-base">
                  <Dices className="mr-2 h-5 w-5" /> Sortear Nome
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {result && (
            <div ref={resultRef} className="mt-8 pt-6 border-t text-center">
              <AdPlaceholder />
              <h3 className="text-lg font-semibold mb-2">O resultado é...</h3>
              <div
                className={cn(
                  "p-8 rounded-lg bg-primary/10 border-2 border-primary/20 transition-all duration-300",
                  isAnimating ? 'scale-90 opacity-50' : 'scale-100 opacity-100'
                )}
              >
                <p className="text-5xl font-bold text-primary break-words">{result}</p>
              </div>
              <Button onClick={handleShare} variant="secondary" className="w-full max-w-xs mx-auto mt-6 rounded-full text-green-600 border-green-500 hover:bg-green-500/10 hover:text-green-700">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar no WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, Star, Frown, HeartPulse, Truck, ClipboardCopy, Flame, Droplets, Scale, Dumbbell, ActivitySquare, Bed, Fuel, ClipboardCheck, ClipboardSignature, Cloud, Route, UserSquare, Send, QrCode, Clock, Camera, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toggleToolFavoriteServer, sendFeedbackServer } from '@/app/actions/firestore';
import FeatureCard from '@/components/common/FeatureCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Tool {
  id: string;
  title: string;
  Icon: LucideIcon;
  href: string;
  description: string;
  category: 'Saúde e Bem Estar' | 'Logística e Trânsito' | 'Geradores e Úteis';
}

const allTools: Tool[] = [
  { id: 'calculadora-calorias', title: 'Calculadora de Calorias', Icon: Flame, href: '/ferramentas/calculadora-calorias', description: 'Estime sua necessidade diária.', category: 'Saúde e Bem Estar' },
  { id: 'calculadora-hidratacao', title: 'Calculadora de Hidratação', Icon: Droplets, href: '/ferramentas/calculadora-hidratacao', description: 'Estime seu consumo de água.', category: 'Saúde e Bem Estar' },
  { id: 'calculadora-imc', title: 'Calculadora de IMC', Icon: Scale, href: '/ferramentas/calculadora-imc', description: 'Calcule seu Índice de Massa Corporal.', category: 'Saúde e Bem Estar' },
  { id: 'exercicios-laborais', title: 'Exercícios Laborais', Icon: Dumbbell, href: '/ferramentas/exercicios-laborais', description: 'Exercícios para suas paradas.', category: 'Saúde e Bem Estar' },
  { id: 'monitoramento-glicemia', title: 'Monitoramento de Glicemia', Icon: HeartPulse, href: '/ferramentas/monitoramento-glicemia', description: 'Acompanhe seus níveis de glicose.', category: 'Saúde e Bem Estar' },
  { id: 'monitoramento-pressao', title: 'Monitorar Pressão Arterial', Icon: ActivitySquare, href: '/ferramentas/monitoramento-pressao', description: 'Registre sua pressão arterial.', category: 'Saúde e Bem Estar' },
  { id: 'qualidade-sono', title: 'Qualidade do Sono', Icon: Bed, href: '/ferramentas/qualidade-sono', description: 'Monitore e analise seu sono.', category: 'Saúde e Bem Estar' },
  { id: 'zonas-frequencia-cardiaca', title: 'Zonas de Frequência Cardíaca', Icon: HeartPulse, href: '/ferramentas/zonas-frequencia-cardiaca', description: 'Calcule suas zonas de treino.', category: 'Saúde e Bem Estar' },
  
  { id: 'etanol-gasolina', title: 'Álcool ou Gasolina?', Icon: Fuel, href: '/ferramentas/etanol-gasolina', description: 'Descubra qual vale mais.', category: 'Logística e Trânsito' },
  { id: 'calculadora-frete', title: 'Calculadora de Frete', Icon: Truck, href: '/ferramentas/calculadora-frete', description: 'Estime os custos do seu frete.', category: 'Logística e Trânsito' },
  { id: 'checklist', title: 'Checklist de Viagem', Icon: ClipboardCheck, href: '/ferramentas/checklist', description: 'Não esqueça nada importante.', category: 'Logística e Trânsito' },
  { id: 'custo-viagem', title: 'Custo de Viagem', Icon: Fuel, href: '/ferramentas/custo-viagem', description: 'Calcule diesel, Arla32 e mais.', category: 'Logística e Trânsito' },
  { id: 'declaracao-transporte', title: 'Declaração de Transporte', Icon: ClipboardSignature, href: '/ferramentas/declaracao-transporte', description: 'Gere uma declaração rápida.', category: 'Logística e Trânsito' },
  { id: 'emissao-carbono', title: 'Emissão de Carbono', Icon: Cloud, href: '/ferramentas/emissao-carbono', description: 'Estime a pegada da sua viagem.', category: 'Logística e Trânsito' },
  { id: 'planejamento-viagem', title: 'Planejamento de Viagem', Icon: Route, href: '/ferramentas/planejamento-viagem', description: 'Calcule paradas e horários.', category: 'Logística e Trânsito' },

  { id: 'gerador-curriculo', title: 'Gerador de Currículo', Icon: UserSquare, href: '/ferramentas/gerador-curriculo', description: 'Crie um currículo profissional.', category: 'Geradores e Úteis' },
  { id: 'gerador-pix', title: 'Gerador de Link Pix', Icon: ClipboardCopy, href: '/ferramentas/gerador-pix', description: 'Crie Pix Copia e Cola.', category: 'Geradores e Úteis' },
  { id: 'gerador-link-whatsapp', title: 'Gerador de Link WhatsApp', Icon: Send, href: '/ferramentas/gerador-link-whatsapp', description: 'Crie links para WhatsApp.', category: 'Geradores e Úteis' },
  { id: 'gerador-qr-code', title: 'Gerador de QR Code', Icon: QrCode, href: '/ferramentas/gerador-qr-code', description: 'Transforme links em QR Codes.', category: 'Geradores e Úteis' },
  { id: 'gestao-tempo', title: 'Gestão do Tempo', Icon: Clock, href: '/ferramentas/gestao-tempo', description: 'Matriz de Eisenhower.', category: 'Geradores e Úteis' },
  { id: 'scanner', title: 'Scanner de Documentos', Icon: Camera, href: '/ferramentas/scanner', description: 'Digitalize docs com a câmera.', category: 'Geradores e Úteis' },
];

const categoryInfo = {
    'Saúde e Bem Estar': { Icon: HeartPulse, className: 'bg-green-100 text-green-800' },
    'Logística e Trânsito': { Icon: Truck, className: 'bg-blue-100 text-blue-800' },
    'Geradores e Úteis': { Icon: ClipboardCopy, className: 'bg-slate-100 text-slate-800' },
};

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

export default function FerramentasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Tool['category'] | 'Todas'>('Todas');
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const { toast } = useToast();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (activeCategory !== 'Todas' && categoryRefs.current[activeCategory]) {
      categoryRefs.current[activeCategory]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory]);
  
  const favoriteTools = useMemo(() => userProfile?.favoriteTools || [], [userProfile]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Login Necessário', description: 'Você precisa estar logado para favoritar ferramentas.' });
      return;
    }

    const currentFavorites = userProfile?.favoriteTools || [];
    const isFavorite = currentFavorites.includes(toolId);
    
    if (!isFavorite && currentFavorites.length >= 4) {
      toast({ variant: 'destructive', title: 'Limite Atingido', description: 'Você pode favoritar no máximo 4 ferramentas.' });
      return;
    }

    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== toolId)
      : [...currentFavorites, toolId];

    setUserProfile(prev => prev ? { ...prev, favoriteTools: newFavorites } : null);

    const result = await toggleToolFavoriteServer(currentUser.uid, toolId, currentFavorites);
    
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Não foi possível atualizar seus favoritos.' });
      setUserProfile(prev => prev ? { ...prev, favoriteTools: currentFavorites } : null);
    }
  }, [currentUser, userProfile, toast, setUserProfile]);

  const filteredToolsByCategory = useMemo(() => {
    const filtered = allTools.filter(tool =>
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped: Record<Tool['category'], Tool[]> = {
      'Saúde e Bem Estar': [],
      'Logística e Trânsito': [],
      'Geradores e Úteis': [],
    };
    
    filtered.forEach(tool => {
        if (grouped[tool.category]) {
            grouped[tool.category].push(tool);
        }
    });

    return grouped;
  }, [searchTerm]);

  const favoriteToolsList = useMemo(() => {
    return allTools.filter(tool => favoriteTools.includes(tool.id));
  }, [favoriteTools]);

  const handleFeedbackSubmit = async (tipo: 'opiniao_ferramentas', valor: string) => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Login Necessário', description: 'Você precisa estar logado para enviar feedback.' });
      return;
    }
    
    const result = await sendFeedbackServer({
      tipo,
      valor,
      autorUid: currentUser.uid,
      autorNome: currentUser.displayName || 'Anônimo',
    });

    if (result.success) {
      toast({ title: 'Obrigado!', description: 'Seu feedback foi enviado com sucesso.' });
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar seu feedback.' });
    }
  };

  const handleSuggestionSubmit = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Login Necessário' });
      return;
    }
    if (!feedbackText.trim()) {
        toast({ variant: 'destructive', title: 'Campo Vazio', description: 'Escreva sua ideia ou sugestão.' });
        return;
    }
    setIsSubmittingFeedback(true);
    const result = await sendFeedbackServer({
      tipo: 'sugestao_ferramentas',
      valor: feedbackText,
      autorUid: currentUser.uid,
      autorNome: currentUser.displayName || 'Anônimo',
    });
    if (result.success) {
      toast({ title: 'Obrigado!', description: 'Sua sugestão foi enviada com sucesso.' });
      setIsFeedbackModalOpen(false);
      setFeedbackText('');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar sua sugestão.' });
    }
    setIsSubmittingFeedback(false);
  };


  return (
    <div className="w-full space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2 font-headline">Galeria de Ferramentas</h1>
        <p className="text-muted-foreground">Explore nossas utilidades para o seu dia a dia.</p>
      </div>

      <Card className="rounded-xl shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar ferramenta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-full h-11 bg-background/70"
          />
        </div>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 pl-10">
                <Button key="Todas" variant={activeCategory === 'Todas' ? "default" : "outline"} size="sm" onClick={() => setActiveCategory('Todas')} className="rounded-full text-xs px-3 py-1 h-auto">Todas</Button>
                {Object.keys(categoryInfo).map((category) => (
                    <Button key={category} variant={activeCategory === category ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(category as Tool['category'])} className="rounded-full text-xs px-3 py-1 h-auto">{category}</Button>
                ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-0" />
            </ScrollArea>
        </div>
      </Card>
      
      <AdPlaceholder />

      {favoriteToolsList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold font-headline">Minhas Preferidas</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {favoriteToolsList.map(tool => (
              <FeatureCard key={tool.id} tool={tool} isFavorite={true} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {Object.keys(categoryInfo).map(category => {
        const IconComponent = categoryInfo[category as Tool['category']].Icon;
        return (activeCategory === 'Todas' || activeCategory === category) && filteredToolsByCategory[category as Tool['category']].length > 0 && (
          <section key={category} ref={el => categoryRefs.current[category] = el} className="scroll-mt-4">
            <div className="flex items-center gap-2 mb-4">
                <div className={cn("p-1.5 rounded-full", categoryInfo[category as Tool['category']].className)}>
                    <IconComponent className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold font-headline">{category}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredToolsByCategory[category as Tool['category']].map(tool => (
                <FeatureCard key={tool.id} tool={tool} isFavorite={favoriteTools.includes(tool.id)} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          </section>
        )
      })}

      {searchTerm && useMemo(() => Object.values(filteredToolsByCategory).flat().length === 0, [filteredToolsByCategory]) && (
         <div className="text-center py-10 px-4 rounded-lg bg-muted/30 border border-dashed">
            <Frown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">Nenhuma Ferramenta Encontrada</h3>
            <p className="text-muted-foreground text-sm mt-1">
                Não encontramos ferramentas correspondendo a "{searchTerm}".
            </p>
        </div>
      )}
      
       <Card className="rounded-xl bg-card border-primary/20 shadow-md mt-12">
            <CardHeader>
                <CardTitle className="font-headline text-lg text-center">Sua opinião é importante!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground text-sm mb-4">
                    O que você achou da nossa galeria de ferramentas?
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-2 flex-col" onClick={() => handleFeedbackSubmit('opiniao_ferramentas', 'sim')}>
                        <ThumbsUp className="h-6 w-6 mb-1 text-green-500"/>
                        <span className="text-xs">Sim, está ótima!</span>
                    </Button>
                     <Button variant="outline" className="h-auto py-2 flex-col" onClick={() => handleFeedbackSubmit('opiniao_ferramentas', 'nao')}>
                        <ThumbsDown className="h-6 w-6 mb-1 text-red-500"/>
                        <span className="text-xs">Não, pode melhorar</span>
                    </Button>
                </div>
                 <Button variant="secondary" className="w-full mt-3" onClick={() => setIsFeedbackModalOpen(true)}>
                    <MessageCircle className="h-4 w-4 mr-2"/>
                    Enviar Ideias ou Sugestões
                </Button>
            </CardContent>
       </Card>

        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Ideias ou Sugestões</DialogTitle>
                    <DialogDescription>
                        Tem alguma ferramenta que gostaria de ver aqui? Ou alguma sugestão de melhoria? Conte para nós!
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="feedback-text">Sua mensagem</Label>
                        <Textarea
                            id="feedback-text"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Descreva sua sugestão aqui..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSuggestionSubmit} disabled={isSubmittingFeedback}>
                        {isSubmittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

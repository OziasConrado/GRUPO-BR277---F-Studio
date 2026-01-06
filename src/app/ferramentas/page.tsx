
'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, Star, Frown, HeartPulse, Bus, ClipboardCopy } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toggleToolFavoriteServer } from '@/app/actions/firestore';

interface Tool {
  id: string;
  title: string;
  Icon: LucideIcon;
  href: string;
  description: string;
  category: 'Saúde e Bem Estar' | 'Logística e Trânsito' | 'Geradores e Úteis';
}

const allTools: Tool[] = [
  { id: 'planejamento-viagem', title: 'Planejamento de Viagem', Icon: Bus, href: '/ferramentas/planejamento-viagem', description: 'Calcule paradas e horários.', category: 'Logística e Trânsito' },
  { id: 'etanol-gasolina', title: 'Álcool ou Gasolina?', Icon: Bus, href: '/ferramentas/etanol-gasolina', description: 'Descubra qual vale mais.', category: 'Logística e Trânsito' },
  { id: 'calculadora-calorias', title: 'Calculadora de Calorias', Icon: HeartPulse, href: '/ferramentas/calculadora-calorias', description: 'Estime sua necessidade diária.', category: 'Saúde e Bem Estar' },
  { id: 'calculadora-hidratacao', title: 'Calculadora de Hidratação', Icon: HeartPulse, href: '/ferramentas/calculadora-hidratacao', description: 'Estime seu consumo de água.', category: 'Saúde e Bem Estar' },
  { id: 'calculadora-frete', title: 'Calculadora de Frete', Icon: Bus, href: '/ferramentas/calculadora-frete', description: 'Estime os custos do seu frete.', category: 'Logística e Trânsito' },
  { id: 'calculadora-imc', title: 'Calculadora de IMC', Icon: HeartPulse, href: '/ferramentas/calculadora-imc', description: 'Calcule seu Índice de Massa Corporal.', category: 'Saúde e Bem Estar' },
  { id: 'checklist', title: 'Checklist de Viagem', Icon: Bus, href: '/ferramentas/checklist', description: 'Não esqueça nada importante.', category: 'Logística e Trânsito' },
  { id: 'custo-viagem', title: 'Custo de Viagem', Icon: Bus, href: '/ferramentas/custo-viagem', description: 'Calcule diesel, Arla32 e mais.', category: 'Logística e Trânsito' },
  { id: 'declaracao-transporte', title: 'Declaração de Transporte', Icon: Bus, href: '/ferramentas/declaracao-transporte', description: 'Gere uma declaração rápida.', category: 'Logística e Trânsito' },
  { id: 'emissao-carbono', title: 'Emissão de Carbono', Icon: Bus, href: '/ferramentas/emissao-carbono', description: 'Estime a pegada da sua viagem.', category: 'Logística e Trânsito' },
  { id: 'exercicios-laborais', title: 'Exercícios Laborais', Icon: HeartPulse, href: '/ferramentas/exercicios-laborais', description: 'Exercícios para suas paradas.', category: 'Saúde e Bem Estar' },
  { id: 'gerador-curriculo', title: 'Gerador de Currículo', Icon: ClipboardCopy, href: '/ferramentas/gerador-curriculo', description: 'Crie um currículo profissional.', category: 'Geradores e Úteis' },
  { id: 'gerador-pix', title: 'Gerador de Link Pix', Icon: ClipboardCopy, href: '/ferramentas/gerador-pix', description: 'Crie Pix Copia e Cola.', category: 'Geradores e Úteis' },
  { id: 'gerador-link-whatsapp', title: 'Gerador de Link WhatsApp', Icon: ClipboardCopy, href: '/ferramentas/gerador-link-whatsapp', description: 'Crie links para WhatsApp.', category: 'Geradores e Úteis' },
  { id: 'gerador-qr-code', title: 'Gerador de QR Code', Icon: ClipboardCopy, href: '/ferramentas/gerador-qr-code', description: 'Transforme links em QR Codes.', category: 'Geradores e Úteis' },
  { id: 'gestao-tempo', title: 'Gestão do Tempo', Icon: ClipboardCopy, href: '/ferramentas/gestao-tempo', description: 'Matriz de Eisenhower.', category: 'Geradores e Úteis' },
  { id: 'monitoramento-pressao', title: 'Monitorar Pressão Arterial', Icon: HeartPulse, href: '/ferramentas/monitoramento-pressao', description: 'Registre sua pressão arterial.', category: 'Saúde e Bem Estar' },
  { id: 'monitoramento-glicemia', title: 'Monitoramento de Glicemia', Icon: HeartPulse, href: '/ferramentas/monitoramento-glicemia', description: 'Acompanhe seus níveis de glicose.', category: 'Saúde e Bem Estar' },
  { id: 'zonas-frequencia-cardiaca', title: 'Zonas de Frequência Cardíaca', Icon: HeartPulse, href: '/ferramentas/zonas-frequencia-cardiaca', description: 'Calcule suas zonas de treino.', category: 'Saúde e Bem Estar' },
  { id: 'qualidade-sono', title: 'Qualidade do Sono', Icon: HeartPulse, href: '/ferramentas/qualidade-sono', description: 'Monitore e analise seu sono.', category: 'Saúde e Bem Estar' },
  { id: 'scanner', title: 'Scanner de Documentos', Icon: ClipboardCopy, href: '/ferramentas/scanner', description: 'Digitalize documentos com a câmera.', category: 'Geradores e Úteis' },
];

const categories: Tool['category'][] = ['Saúde e Bem Estar', 'Logística e Trânsito', 'Geradores e Úteis'];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

const ToolCard = ({ tool, isFavorite, onToggleFavorite }: { tool: Tool; isFavorite: boolean; onToggleFavorite: (e: React.MouseEvent, toolId: string) => void; }) => (
    <div className="relative group">
        <Link href={tool.href} passHref className="block h-full">
            <Card className="rounded-xl overflow-hidden h-full hover:shadow-lg transition-shadow duration-200 bg-card hover:bg-card/90">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="p-3 mb-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <tool.Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </CardContent>
            </Card>
        </Link>
        <button
            onClick={(e) => onToggleFavorite(e, tool.id)}
            className="absolute top-2 right-2 z-10 p-2 text-white"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Star className={cn("h-5 w-5 transition-colors", isFavorite ? "text-amber-400 fill-amber-400" : "text-white/70 hover:text-amber-400")} />
        </button>
    </div>
);


export default function FerramentasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Tool['category'] | 'Todas'>('Todas');
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const { toast } = useToast();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
                {categories.map((category) => (
                    <Button key={category} variant={activeCategory === category ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(category)} className="rounded-full text-xs px-3 py-1 h-auto">{category}</Button>
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
            <h2 className="text-xl font-bold font-headline">Favoritos</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {favoriteToolsList.map(tool => (
              <ToolCard key={tool.id} tool={tool} isFavorite={true} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {categories.map(category => (
        (activeCategory === 'Todas' || activeCategory === category) && filteredToolsByCategory[category].length > 0 && (
          <section key={category} ref={el => categoryRefs.current[category] = el} className="scroll-mt-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold font-headline">{category}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredToolsByCategory[category].map(tool => (
                <ToolCard key={tool.id} tool={tool} isFavorite={favoriteTools.includes(tool.id)} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          </section>
        )
      ))}

      {searchTerm && useMemo(() => Object.values(filteredToolsByCategory).flat().length === 0, [filteredToolsByCategory]) && (
         <div className="text-center py-10 px-4 rounded-lg bg-muted/30 border border-dashed">
            <Frown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">Nenhuma Ferramenta Encontrada</h3>
            <p className="text-muted-foreground text-sm mt-1">
                Não encontramos ferramentas correspondendo a "{searchTerm}".
            </p>
        </div>
      )}
    </div>
  );
}

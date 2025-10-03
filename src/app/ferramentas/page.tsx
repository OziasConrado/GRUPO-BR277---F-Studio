'use client';

import { useState, useMemo } from 'react';
import ToolCard, { type ToolCardProps } from '@/components/tools/tool-card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Mail, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb,
  Droplets,
  Flame,
  Calculator,
  Scale,
  ListChecks,
  ClipboardList,
  ClipboardSignature,
  UserSquare,
  ClipboardCopy,
  Send,
  QrCode,
  Clock,
  ActivitySquare,
  HeartPulse,
  Bed,
  ScanLine,
  Cloud,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Extend ToolCardProps to include category for local use
interface CategorizedTool extends ToolCardProps {
  category: 'Trânsito e Veículos' | 'Saúde e Bem Estar' | 'Empreendedorismo' | 'Outros';
}

const tools: CategorizedTool[] = [
  {
    title: 'Álcool ou Gasolina?',
    Icon: Droplets,
    href: '/ferramentas/etanol-gasolina',
    description: 'Descubra qual combustível vale mais a pena.',
    category: 'Trânsito e Veículos',
  },
  {
    title: 'Calculadora de Calorias',
    Icon: Flame,
    href: '/ferramentas/calculadora-calorias',
    description: 'Estime sua TMB e necessidade calórica diária.',
    category: 'Saúde e Bem Estar',
  },
  {
    title: 'Calculadora de Frete',
    Icon: Calculator,
    href: '/ferramentas/calculadora-frete',
    description: 'Estime os custos do seu frete com precisão.',
    category: 'Empreendedorismo',
  },
  {
    title: 'Calculadora de IMC',
    Icon: Scale,
    href: '/ferramentas/calculadora-imc',
    description: 'Calcule seu Índice de Massa Corporal.',
    category: 'Saúde e Bem Estar',
  },
  {
    title: 'Checklist de Viagem',
    Icon: ListChecks,
    href: '/ferramentas/checklist',
    description: 'Não esqueça nada importante para sua jornada.',
    category: 'Trânsito e Veículos',
  },
  {
    title: 'Custo de Viagem (Diesel + Arla)',
    Icon: ClipboardList, // Consider changing to Fuel if consistent with custo-viagem page
    href: '/ferramentas/custo-viagem',
    description: 'Calcule diesel, Arla32 e custo total.',
    category: 'Trânsito e Veículos',
  },
  {
    title: 'Declaração de Transporte',
    Icon: ClipboardSignature,
    href: '/ferramentas/declaracao-transporte',
    description: 'Gere uma declaração de transporte rapidamente.',
    category: 'Empreendedorismo',
  },
    {
    title: 'Emissão de Carbono Veicular',
    Icon: Cloud,
    href: '/ferramentas/emissao-carbono',
    description: 'Estime a pegada de carbono da sua viagem.',
    category: 'Trânsito e Veículos',
  },
  {
    title: 'Gerador de Currículo',
    Icon: UserSquare,
    href: '/ferramentas/gerador-curriculo',
    description: 'Crie um currículo profissional rapidamente.',
    category: 'Empreendedorismo',
  },
  {
    title: 'Gerador de Link Pix',
    Icon: ClipboardCopy,
    href: '/ferramentas/gerador-pix',
    description: 'Crie códigos Pix Copia e Cola facilmente.',
    category: 'Empreendedorismo',
  },
  {
    title: 'Gerador de Link WhatsApp',
    Icon: Send,
    href: '/ferramentas/gerador-link-whatsapp',
    description: 'Crie links diretos para conversas no WhatsApp.',
    category: 'Empreendedorismo',
  },
  {
    title: 'Gerador de QR Code',
    Icon: QrCode,
    href: '/ferramentas/gerador-qr-code',
    description: 'Transforme links ou textos em QR Codes.',
    category: 'Outros',
  },
  {
    title: 'Gestão do Tempo',
    Icon: Clock,
    href: '/ferramentas/gestao-tempo',
    description: 'Gerencie suas tarefas com a Matriz de Eisenhower.',
    category: 'Saúde e Bem Estar',
  },
  {
    title: 'Monitorar Pressão Arterial',
    Icon: ActivitySquare,
    href: '/ferramentas/monitoramento-pressao',
    description: 'Registre e acompanhe sua pressão arterial.',
    category: 'Saúde e Bem Estar',
  },
  {
    title: 'Monitoramento de Glicemia',
    Icon: HeartPulse,
    href: '/ferramentas/monitoramento-glicemia',
    description: 'Registre e acompanhe seus níveis de glicose.',
    category: 'Saúde e Bem Estar',
  },
   {
    title: 'Qualidade do Sono',
    Icon: Bed,
    href: '/ferramentas/qualidade-sono',
    description: 'Monitore e analise a qualidade do seu sono.',
    category: 'Saúde e Bem Estar',
  },
  {
    title: 'Scanner de Documentos',
    Icon: ScanLine,
    href: '/ferramentas/scanner',
    description: 'Digitalize documentos de forma rápida e fácil.',
    category: 'Outros',
  },
];

const categories: CategorizedTool['category'][] = ['Trânsito e Veículos', 'Saúde e Bem Estar', 'Empreendedorismo', 'Outros'];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function FerramentasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategorizedTool['category'] | 'Todas'>('Todas');

  const filteredTools = useMemo(() => {
    return tools
      .filter(tool =>
        activeCategory === 'Todas' || tool.category === activeCategory
      )
      .filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [searchTerm, activeCategory]);

  const handleFeedbackClick = (isPositive: boolean) => {
    const subject = isPositive
      ? "Feedback Positivo: Galeria de Ferramentas GRUPO BR277"
      : "Feedback Construtivo: Galeria de Ferramentas GRUPO BR277";
    const body = encodeURIComponent("Olá,\n\n[Descreva sua experiência ou sugestão aqui]\n\nObrigado!");
    window.location.href = `mailto:oziasconrado@opaatec.com.br?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  const handleSendIdeaClick = () => {
    const subject = "Sugestão de Melhoria/Nova Ferramenta: GRUPO BR277";
    const body = encodeURIComponent("Olá,\n\Tenho uma ideia para o GRUPO BR277:\n\n[Descreva sua ideia aqui]\n\nObrigado!");
    window.location.href = `mailto:oziasconrado@opaatec.com.br?subject=${encodeURIComponent(subject)}&body=${body}`;
  };


  return (
    <div className="w-full space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2 font-headline">Galeria de Ferramentas</h1>
        <p className="text-muted-foreground">Explore nossas utilidades e envie seu feedback!</p>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4 space-y-4">
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
          <div className="flex items-center mb-2 pt-2">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Filtrar por categoria:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              key="Todas"
              variant={activeCategory === 'Todas' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('Todas')}
              className="rounded-full text-xs px-3 py-1 h-auto"
            >
              Todas
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full text-xs px-3 py-1 h-auto"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AdPlaceholder />

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma ferramenta encontrada para "{searchTerm}" na categoria "{activeCategory}".
        </p>
      )}

      <Card className="rounded-xl shadow-sm mt-10">
        <CardHeader className="pb-3 text-center sm:text-left">
          <CardTitle className="font-headline text-lg">Sua Opinião é Importante!</CardTitle>
          <CardDescription>Ajude nosso time de desenvolvimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center sm:text-left">
            <p className="mb-2 text-sm">Esta galeria de ferramentas está sendo útil para você?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              <Button variant="outline" onClick={() => handleFeedbackClick(true)} className="rounded-full">
                <ThumbsUp className="mr-2 h-4 w-4 text-green-500"/> Sim, está ótima!
              </Button>
              <Button variant="outline" onClick={() => handleFeedbackClick(false)} className="rounded-full">
                <ThumbsDown className="mr-2 h-4 w-4 text-red-500"/> Não, pode melhorar.
              </Button>
            </div>
          </div>
          <div className="text-center sm:text-left pt-3">
            <Button onClick={handleSendIdeaClick} className="rounded-full w-full sm:w-auto">
              <Lightbulb className="mr-2 h-4 w-4" /> Enviar Ideias para Melhorias
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

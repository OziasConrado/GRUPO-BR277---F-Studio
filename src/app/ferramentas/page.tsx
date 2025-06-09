
import ToolCard, { type ToolCardProps } from '@/components/tools/tool-card';
import { Calculator, MapPinned, ListChecks, ScanLine, Fuel, Wrench, Droplets, Truck, ClipboardList, ClipboardSignature, ClipboardCopy, Send, QrCode, UserSquare, HeartPulse, Scale, ActivitySquare, Bed, Flame } from 'lucide-react';

const tools: ToolCardProps[] = [
  {
    title: 'Calculadora de Frete',
    Icon: Calculator,
    href: '/ferramentas/calculadora-frete',
    description: 'Estime os custos do seu frete com precisão.',
  },
  {
    title: 'Mapa Interativo',
    Icon: MapPinned,
    href: '/ferramentas/mapa',
    description: 'Navegue e encontre pontos de interesse.',
  },
  {
    title: 'Checklist de Viagem',
    Icon: ListChecks,
    href: '/ferramentas/checklist',
    description: 'Não esqueça nada importante para sua jornada.',
  },
  {
    title: 'Scanner de Documentos',
    Icon: ScanLine,
    href: '/ferramentas/scanner',
    description: 'Digitalize documentos de forma rápida e fácil.',
  },
  {
    title: 'Calculadora de Combustível Simples',
    Icon: Fuel,
    href: '/ferramentas/calculadora-combustivel',
    description: 'Planeje seus gastos com combustível (sem Arla).',
  },
   {
    title: 'Custo de Viagem (Diesel + Arla)',
    Icon: ClipboardList, 
    href: '/ferramentas/custo-viagem',
    description: 'Calcule diesel, Arla32 e custo total.',
  },
  {
    title: 'Declaração de Transporte',
    Icon: ClipboardSignature,
    href: '/ferramentas/declaracao-transporte',
    description: 'Gere uma declaração de transporte rapidamente.',
  },
  {
    title: 'Gerador de Link Pix',
    Icon: ClipboardCopy,
    href: '/ferramentas/gerador-pix',
    description: 'Crie códigos Pix Copia e Cola facilmente.',
  },
  {
    title: 'Gerador de Link WhatsApp',
    Icon: Send,
    href: '/ferramentas/gerador-link-whatsapp',
    description: 'Crie links diretos para conversas no WhatsApp.',
  },
  {
    title: 'Gerador de QR Code',
    Icon: QrCode,
    href: '/ferramentas/gerador-qr-code',
    description: 'Transforme links ou textos em QR Codes.',
  },
  {
    title: 'Gerador de Currículo',
    Icon: UserSquare, 
    href: '/ferramentas/gerador-curriculo',
    description: 'Crie um currículo profissional rapidamente.',
  },
  {
    title: 'Diagnóstico Básico',
    Icon: Wrench,
    href: '/ferramentas/diagnostico',
    description: 'Verifique problemas comuns do veículo.',
  },
  {
    title: 'Álcool ou Gasolina?',
    Icon: Droplets,
    href: '/ferramentas/etanol-gasolina',
    description: 'Descubra qual combustível vale mais a pena.',
  },
  {
    title: 'Monitoramento de Glicemia',
    Icon: HeartPulse,
    href: '/ferramentas/monitoramento-glicemia',
    description: 'Registre e acompanhe seus níveis de glicose.',
  },
  {
    title: 'Calculadora de IMC',
    Icon: Scale,
    href: '/ferramentas/calculadora-imc',
    description: 'Calcule seu Índice de Massa Corporal.',
  },
  {
    title: 'Monitorar Pressão Arterial',
    Icon: ActivitySquare,
    href: '/ferramentas/monitoramento-pressao',
    description: 'Registre e acompanhe sua pressão arterial.',
  },
  {
    title: 'Qualidade do Sono',
    Icon: Bed,
    href: '/ferramentas/qualidade-sono',
    description: 'Monitore e analise a qualidade do seu sono.',
  },
  {
    title: 'Calculadora de Calorias',
    Icon: Flame,
    href: '/ferramentas/calculadora-calorias',
    description: 'Estime sua TMB e necessidade calórica diária.',
  },
];

export default function FerramentasPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 font-headline text-center sm:text-left">Galeria de Ferramentas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.sort((a,b) => a.title.localeCompare(b.title)).map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}
    

    

    

    

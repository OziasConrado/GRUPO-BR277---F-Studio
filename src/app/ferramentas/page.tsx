
import ToolCard, { type ToolCardProps } from '@/components/tools/tool-card';
import { Calculator, MapPinned, ListChecks, ScanLine, Fuel, Wrench, Droplets, Truck, ClipboardList, ClipboardSignature, ClipboardCopy } from 'lucide-react'; // Added ClipboardCopy

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
    Icon: Truck, // Mantido, ou poderia ser ClipboardList se preferir
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
];

export default function FerramentasPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 font-headline text-center sm:text-left">Galeria de Ferramentas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}

    
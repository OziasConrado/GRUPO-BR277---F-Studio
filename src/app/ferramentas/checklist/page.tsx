
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckSquare, FileText, Share2, Car, Truck, Bus, CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import Script from 'next/script';
import { cn } from '@/lib/utils';

type VehicleType = 'passeio' | 'caminhao' | 'onibus';

interface ChecklistItem {
  id: string;
  label: string;
}

const checklistItemsPasseio: ChecklistItem[] = [
  { id: "pas_oleo", label: "Nível do óleo do motor" },
  { id: "pas_agua", label: "Água do radiador / Líquido de arrefecimento" },
  { id: "pas_pneus_calibragem", label: "Calibragem dos pneus (incluindo estepe)" },
  { id: "pas_estepe_estado", label: "Estado do estepe" },
  { id: "pas_luzes", label: "Luzes (faróis, lanternas, setas, freio, ré, neblina)" },
  { id: "pas_limpadores", label: "Limpadores de para-brisa e água do reservatório" },
  { id: "pas_freios", label: "Freios (pedal e de mão)" },
  { id: "pas_fluido_freio", label: "Nível do fluido de freio" },
  { id: "pas_buzina", label: "Buzina" },
  { id: "pas_cintos", label: "Cintos de segurança (todos)" },
  { id: "pas_documentos", label: "Documentos (CNH, CRLV)" },
  { id: "pas_kit_emergencia", label: "Triângulo, Macaco, Chave de roda" },
  { id: "pas_extintor", label: "Extintor de incêndio (validade e carga)" },
  { id: "pas_palhetas", label: "Palhetas do limpador (estado)" },
  { id: "pas_bateria", label: "Bateria (sinais de corrosão)" },
];

const checklistItemsCaminhao: ChecklistItem[] = [
  { id: "cam_oleo", label: "Nível do óleo do motor e vazamentos" },
  { id: "cam_agua", label: "Água do radiador / Líquido de arrefecimento" },
  { id: "cam_arla", label: "Nível de Arla 32 (se aplicável)" },
  { id: "cam_freios_sistema", label: "Sistema de freios (lonas/pastilhas, cuícas, válvulas, mangueiras, sangria de reservatórios)" },
  { id: "cam_tacografo", label: "Tacógrafo (disco/fita, aferição, lacres)" },
  { id: "cam_pneus", label: "Pneus (desgaste, sulcos, pressão, estepe)" },
  { id: "cam_sinal_refletiva", label: "Sinalização refletiva (faixas laterais e traseira)" },
  { id: "cam_amarracao_carga", label: "Cintas, catracas e cordas de amarração de carga" },
  { id: "cam_quinta_roda", label: "Quinta roda e pino rei (lubrificação, folgas, travas) - Cavalo" },
  { id: "cam_acoplamento", label: "Sistema de acoplamento e mangueiras (reboques/semirreboques)" },
  { id: "cam_suspensao", label: "Suspensão (molas, amortecedores, bolsas de ar, grampos)" },
  { id: "cam_luzes_especificas", label: "Luzes específicas (delimitadoras, laterais, teto)" },
  { id: "cam_combustivel_vazamentos", label: "Nível de combustível e possíveis vazamentos" },
  { id: "cam_vazamentos_gerais", label: "Vazamentos gerais (óleo, água, ar)" },
  { id: "cam_cabine", label: "Estado da cabine (limpeza, organização, cama)" },
  { id: "cam_epis", label: "EPIs (capacete, luvas, botas, óculos, se necessário)" },
  { id: "cam_navegacao", label: "Rotograma ou GPS/aplicativo de navegação" },
  { id: "cam_docs_carga", label: "Verificar carga, nota fiscal e manifesto (MDF-e)" },
  { id: "cam_extintores", label: "Extintores de incêndio (quantidade, tipo, validade, carga)" },
  { id: "cam_ferramentas_lanterna", label: "Lanternas e ferramentas básicas específicas" },
  { id: "cam_rodocalibrador", label: "Rodocalibrador (se houver)" },
  { id: "cam_sider_travas", label: "Roletes e travas do sider (se aplicável)" },
];

const checklistItemsOnibus: ChecklistItem[] = [
  { id: "oni_oleo", label: "Nível do óleo do motor e vazamentos" },
  { id: "oni_agua", label: "Água do radiador / Líquido de arrefecimento" },
  { id: "oni_freios_suspensao", label: "Sistema de freios e suspensão (similar caminhão)" },
  { id: "oni_pneus", label: "Pneus (desgaste, sulcos, pressão, estepe)" },
  { id: "oni_tacografo", label: "Tacógrafo (disco/fita, aferição, lacres)" },
  { id: "oni_portas_travas", label: "Portas de acesso e de emergência (funcionamento, borrachas, travas)" },
  { id: "oni_iluminacao_interna", label: "Iluminação interna do salão, degraus e letreiros" },
  { id: "oni_saidas_emergencia", label: "Saídas de emergência (desobstruídas, sinalizadas, martelos)" },
  { id: "oni_extintores", label: "Extintores (quantidade, tipo, validade, acesso fácil)" },
  { id: "oni_cintos_passageiros", label: "Cintos de segurança para todos os passageiros" },
  { id: "oni_bancos", label: "Bancos (fixação, estado, limpeza)" },
  { id: "oni_ar_condicionado", label: "Ar-condicionado / Ventilação / Aquecimento" },
  { id: "oni_sistema_som_video", label: "Sistema de som, vídeo e microfone (se houver)" },
  { id: "oni_limpeza", label: "Limpeza interna geral e externa" },
  { id: "oni_itinerario_info", label: "Itinerário, horários e informações aos passageiros" },
  { id: "oni_acessibilidade", label: "Dispositivos de acessibilidade (elevador, espaço cadeira rodas)" },
  { id: "oni_bagageiros", label: "Bagageiros (organização, travas)" },
  { id: "oni_primeiros_socorros", label: "Kit de primeiros socorros (validade e itens)" },
  { id: "oni_documentos_veiculo_motorista", label: "Documentos do veículo, motorista e da viagem" },
  { id: "oni_comunicacao_empresa", label: "Sistema de comunicação com a empresa" },
];

const allChecklists: Record<VehicleType, ChecklistItem[]> = {
  passeio: checklistItemsPasseio,
  caminhao: checklistItemsCaminhao,
  onibus: checklistItemsOnibus,
};


export default function ChecklistVeicularPage() {
  const [activeChecklist, setActiveChecklist] = useState<VehicleType>('passeio');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [driverName, setDriverName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [checklistDate, setChecklistDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const loadCheckedItems = () => {
      try {
        const stored = localStorage.getItem(`checklist_${activeChecklist}_items`);
        if (stored) {
          setCheckedItems(JSON.parse(stored));
        } else {
          setCheckedItems({});
        }
      } catch (error) {
        console.error("Erro ao carregar itens do localStorage:", error);
        setCheckedItems({});
      }
    };
    loadCheckedItems();
  }, [activeChecklist]);

  const handleCheckboxChange = (itemId: string) => {
    const newCheckedItems = {
      ...checkedItems,
      [itemId]: !checkedItems[itemId],
    };
    setCheckedItems(newCheckedItems);
    try {
      localStorage.setItem(`checklist_${activeChecklist}_items`, JSON.stringify(newCheckedItems));
    } catch (error) {
      console.error("Erro ao salvar itens no localStorage:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar suas marcações. O armazenamento pode estar cheio.",
      });
    }
  };

  const currentList = allChecklists[activeChecklist];

  const exportarChecklistPDF = () => {
    const checklistElement = document.getElementById(`checklist-content-${activeChecklist}`);
    if (!checklistElement || !(window as any).html2pdf) {
        toast({
            variant: "destructive",
            title: "Erro ao Exportar",
            description: "Não foi possível gerar o PDF. Tente novamente mais tarde."
        });
      return;
    }

    const opt = {
      margin:       1,
      filename:     `Checklist_${activeChecklist.charAt(0).toUpperCase() + activeChecklist.slice(1)}_${checklistDate ? format(checklistDate, "yyyy-MM-dd") : 'data'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    const contentToPrint = document.createElement('div');
    
    const titleElement = document.createElement('h2');
    titleElement.innerText = `Checklist Veicular - ${activeChecklist.charAt(0).toUpperCase() + activeChecklist.slice(1)}`;
    titleElement.style.textAlign = 'center';
    titleElement.style.marginBottom = '0.5cm';
    titleElement.style.fontSize = '16pt';
    contentToPrint.appendChild(titleElement);

    const infoDiv = document.createElement('div');
    infoDiv.style.marginBottom = '0.5cm';
    infoDiv.style.fontSize = '10pt';
    infoDiv.innerHTML = `
      <p><strong>Motorista:</strong> ${driverName || 'Não informado'}</p>
      <p><strong>Veículo:</strong> ${vehicleInfo || 'Não informado'}</p>
      <p><strong>Data:</strong> ${checklistDate ? format(checklistDate, "dd/MM/yyyy", { locale: ptBR }) : 'Não informada'}</p>
    `;
    contentToPrint.appendChild(infoDiv);
    
    contentToPrint.appendChild(checklistElement.cloneNode(true) as HTMLElement);
    
    (window as any).html2pdf().from(contentToPrint).set(opt).save();
  };

  const enviarChecklistWhatsApp = () => {
    let mensagem = `*Checklist Veicular - ${activeChecklist.charAt(0).toUpperCase() + activeChecklist.slice(1)}:*\n`;
    mensagem += `Motorista: ${driverName || 'N/A'}\n`;
    mensagem += `Veículo: ${vehicleInfo || 'N/A'}\n`;
    mensagem += `Data: ${checklistDate ? format(checklistDate, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}\n\n`;
    currentList.forEach(item => {
      mensagem += `${checkedItems[item.id] ? "✅" : "◻️"} ${item.label}\n`;
    });
    const link = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(link, '_blank');
  };
  
  const getVehicleIcon = (type: VehicleType) => {
    if (type === 'passeio') return <Car className="mr-2 h-5 w-5" />;
    if (type === 'caminhao') return <Truck className="mr-2 h-5 w-5" />;
    if (type === 'onibus') return <Bus className="mr-2 h-5 w-5" />;
    return null;
  };


  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <div className="w-full space-y-6">
        <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Ferramentas
        </Link>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
                <CheckSquare className="w-7 h-7 text-primary"/>
                <CardTitle className="font-headline text-xl sm:text-2xl">Checklist Veicular Completo</CardTitle>
            </div>
            <CardDescription>Selecione o tipo de veículo e verifique os itens essenciais para uma viagem segura.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/30">
              <h4 className="text-md font-semibold text-foreground">Informações do Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="driverName">Nome do Motorista</Label>
                  <Input id="driverName" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="rounded-lg mt-1 bg-background/70"/>
                </div>
                <div>
                  <Label htmlFor="vehicleInfo">Veículo (Placa/Modelo)</Label>
                  <Input id="vehicleInfo" value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} className="rounded-lg mt-1 bg-background/70"/>
                </div>
                <div>
                  <Label htmlFor="checklistDate">Data do Checklist</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-lg mt-1 bg-background/70",
                          !checklistDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checklistDate ? format(checklistDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checklistDate}
                        onSelect={setChecklistDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>


            <div className="mb-6 flex flex-wrap gap-2">
              {(['passeio', 'caminhao', 'onibus'] as VehicleType[]).map(type => (
                <Button
                  key={type}
                  variant={activeChecklist === type ? 'default' : 'outline'}
                  onClick={() => setActiveChecklist(type)}
                  className="rounded-full flex-grow sm:flex-grow-0"
                >
                  {getVehicleIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            
            <div id={`checklist-content-${activeChecklist}`} className="space-y-3">
              {currentList.map(item => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-background/50 dark:bg-card/50 rounded-lg border">
                  <Checkbox
                    id={item.id}
                    checked={!!checkedItems[item.id]}
                    onCheckedChange={() => handleCheckboxChange(item.id)}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn("text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                 checkedItems[item.id] ? "line-through text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={exportarChecklistPDF} variant="outline" className="rounded-full py-3">
                    <FileText className="mr-2 h-5 w-5"/> Exportar como PDF
                </Button>
                <Button onClick={enviarChecklistWhatsApp} variant="outline" className="rounded-full py-3 text-green-600 border-green-500 hover:bg-green-500/10 hover:text-green-700">
                    <Share2 className="mr-2 h-5 w-5"/> Enviar por WhatsApp
                </Button>
            </div>

             <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    

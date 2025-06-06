
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card"; // Import CardTitle and CardDescription
import { PlusCircle, ListFilter, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import AlertCard, { type AlertProps } from '@/components/alerts/alert-card';
import ReportAlertModal from '@/components/alerts/report-alert-modal';
import AlertFilters from '@/components/alerts/alert-filters';

const mockAlertsData: AlertProps[] = [
  {
    id: 'alert-1',
    type: 'Acidente',
    location: 'BR-116, Km 230, Próximo a Curitiba-PR',
    description: 'Colisão entre dois caminhões. Trânsito lento nos dois sentidos. Equipes de resgate no local.',
    timestamp: '2024-07-28T10:30:00Z',
    severity: 'Alta',
    reportedBy: 'Usuário_123',
  },
  {
    id: 'alert-2',
    type: 'Obras na Pista',
    location: 'Rodovia dos Bandeirantes, Km 55, Sentido Interior',
    description: 'Recapeamento da via. Faixa da direita interditada. Previsão de término: 18:00.',
    timestamp: '2024-07-28T08:15:00Z',
    severity: 'Média',
    reportedBy: 'Admin RotaSegura',
  },
  {
    id: 'alert-3',
    type: 'Congestionamento',
    location: 'Marginal Tietê, Próximo à Ponte das Bandeiras, São Paulo-SP',
    description: 'Trânsito intenso devido a excesso de veículos. Evite a região se possível.',
    timestamp: '2024-07-28T11:00:00Z',
    severity: 'Média',
    reportedBy: 'Usuário_AB',
  },
  {
    id: 'alert-4',
    type: 'Condição Climática Adversa',
    location: 'Serra Dona Francisca, SC-418',
    description: 'Neblina densa na serra. Visibilidade reduzida. Dirija com cautela.',
    timestamp: '2024-07-27T23:50:00Z',
    severity: 'Alta',
    reportedBy: 'Admin RotaSegura',
  },
  {
    id: 'alert-5',
    type: 'Animal na Pista',
    location: 'BR-040, Km 70, Perto de Paraopeba-MG',
    description: 'Cavalo solto na rodovia. Reduza a velocidade.',
    timestamp: '2024-07-28T12:05:00Z',
    severity: 'Média',
    reportedBy: 'Usuário_789',
  },
];


export default function AlertasPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertProps[]>(mockAlertsData);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertProps[]>(mockAlertsData);
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  useEffect(() => {
    if (activeFilter === 'Todos') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.type === activeFilter));
    }
  }, [activeFilter, alerts]);

  const handleNewAlertReported = (newAlert: Omit<AlertProps, 'id' | 'timestamp' | 'reportedBy'>) => {
    const fullNewAlert: AlertProps = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reportedBy: 'Você', // Simulação
    };
    setAlerts(prevAlerts => [fullNewAlert, ...prevAlerts]);
    // Poderia adicionar à filteredAlerts também ou apenas confiar no useEffect para refiltrar
    // Por simplicidade, vamos refiltrar todos
    if (activeFilter === 'Todos' || fullNewAlert.type === activeFilter) {
        setFilteredAlerts(prevFiltered => [fullNewAlert, ...prevFiltered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } else {
        // Se o novo alerta não corresponder ao filtro atual, apenas atualiza `alerts`
        // O useEffect cuidará da `filteredAlerts` se o filtro mudar
    }
  };
  
  // Ordenar alertas por data/hora mais recente
  useEffect(() => {
    const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAlerts(sortedAlerts);
    
    const sortedFilteredAlerts = [...filteredAlerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredAlerts(sortedFilteredAlerts);

  }, []); // Executa uma vez ao montar para ordenar os mocks iniciais

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className='w-full sm:w-auto'>
            <h1 className="text-3xl font-bold font-headline text-center sm:text-left">Alertas da Comunidade</h1>
            <p className="text-muted-foreground text-center sm:text-left text-sm">Informações em tempo real sobre as estradas.</p>
        </div>
        <Button onClick={() => setIsReportModalOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Reportar Novo Alerta
        </Button>
      </div>

      {/* Filtros diretamente na página, sem o Card envolvente */}
      <div className="p-4 rounded-xl bg-card border"> {/* Opcional: manter um container visual para filtros */}
        <CardTitle className="font-headline flex items-center text-lg mb-1"><ListFilter className="mr-2 h-5 w-5 text-primary"/> Filtros de Alertas</CardTitle>
        <CardDescription className="text-xs mb-4">Filtre por tipo ou veja todos os alertas recentes.</CardDescription>
        <AlertFilters
          currentFilter={activeFilter}
          onFilterChange={setActiveFilter}
          alertTypes={['Todos', ...new Set(mockAlertsData.map(a => a.type))]}
        />
      </div>
      
      {/* Lista de Alertas */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4"> {/* mt-6 removido, space-y-6 do pai deve cuidar disso */}
          {filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-4">Nenhum alerta encontrado para este filtro.</p>
      )}

      <ReportAlertModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAlertReported={handleNewAlertReported}
      />
       <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mt-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Feed
      </Link>
    </div>
  );
}

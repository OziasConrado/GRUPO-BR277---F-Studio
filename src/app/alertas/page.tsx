
'use client';

import Link from 'next/link';
import { ArrowLeft, BellRing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AlertCard, { type AlertProps } from '@/components/alerts/alert-card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import React from 'react'; // Import React for React.Fragment

// Mock data for alerts page - In a real app, this would come from a service or API
const generateTimestamp = () => {
  const hoursAgo = Math.floor(Math.random() * 23) + 1; // 1 to 23 hours ago
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
};

const initialAlertsOnPage: AlertProps[] = [
  {
    id: 'alert-pg-1',
    type: 'Acidente',
    description: 'Colisão grave na BR-277, Km 35 (sentido litoral). Trânsito totalmente parado. Recomenda-se utilizar desvios pela PR-407 ou aguardar a liberação da pista. Equipes de resgate no local.',
    location: 'BR-277, Km 35 (Litoral)',
    timestamp: generateTimestamp(),
    userNameReportedBy: 'Carlos Caminhoneiro',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    dataAIAvatarHint: 'truck driver concerned',
    bio: 'Na estrada há 20 anos, sempre alerta!',
    instagramUsername: 'carlos_alerta_rodovias'
  },
  {
    id: 'alert-pg-2',
    type: 'Obras na Pista',
    description: 'Pista interditada para obras de recapeamento na BR-116, entre os Kms 110-115 (região de Campina Grande). Siga pela marginal com atenção redobrada e velocidade reduzida. Previsão de término em 2 dias.',
    location: 'BR-116, Kms 110-115',
    timestamp: generateTimestamp(),
    userNameReportedBy: 'Ana Viajante',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    dataAIAvatarHint: 'woman traveler pointing',
    bio: 'Explorando o Brasil e compartilhando o que vejo.',
  },
  {
    id: 'alert-pg-3',
    type: 'Congestionamento',
    description: 'Fluxo intenso de veículos na região central de Curitiba, especialmente Av. Sete de Setembro e Marechal Deodoro. Evite o centro se possível durante o horário de pico. Rotas alternativas sugeridas via app de trânsito.',
    location: 'Curitiba, Centro',
    timestamp: generateTimestamp(),
    userNameReportedBy: 'Mariana Logística',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    dataAIAvatarHint: 'logistics manager serious',
    bio: 'Planejamento é tudo! Informação é chave.',
    instagramUsername: 'marilog_transporte'
  },
  {
    id: 'alert-pg-4',
    type: 'Condição Climática Adversa',
    description: 'Visibilidade reduzida na Serra do Mar (BR-277) devido à neblina densa. Acenda os faróis de neblina e dirija com cautela redobrada. Trecho muito perigoso, mantenha distância segura.',
    location: 'Serra do Mar, BR-277',
    timestamp: generateTimestamp(),
    userNameReportedBy: 'Pedro Estradeiro',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    dataAIAvatarHint: 'experienced driver focused',
    bio: 'Sempre de olho na segurança.',
  },
  {
    id: 'alert-pg-5',
    type: 'Queimada, fumaça densa sobre a pista',
    description: 'Fumaça densa sobre a pista na PR-407, Km 5, próximo a Paranaguá. Risco de baixa visibilidade e problemas respiratórios. Reduza a velocidade e feche as janelas do veículo.',
    location: 'PR-407, Km 5 (Paranaguá)',
    timestamp: generateTimestamp(),
    userNameReportedBy: 'Segurança Rodoviária',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    dataAIAvatarHint: 'official safety account',
    bio: 'Trabalhando pela sua segurança nas estradas.',
    instagramUsername: 'rodoviaria_segura'
  },
];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);


export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProps[]>(initialAlertsOnPage);
  // TODO: No futuro, buscar alertas de uma API ou estado global.
  // Para exibir alertas criados pelo usuário nesta página, seria necessário
  // um mecanismo para compartilhar o estado dos alertas entre a homepage e esta página.

  return (
    <div className="w-full space-y-6">
      <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-0">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Feed
      </Link>

      <Card className="shadow-xl rounded-xl">
        <CardHeader className="text-center pb-4">
          <BellRing className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold font-headline">Mural de Alertas</CardTitle>
          <CardDescription>
            Confira os últimos alertas reportados pela comunidade e mantenha-se informado sobre as condições das estradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <AdPlaceholder />
          
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <AlertCard alert={alert} />
                  {/* Insere um AdMob após o terceiro card, se houver mais de 3 alertas */}
                  {(index === 2 && alerts.length > 3) && <AdPlaceholder />}
                </React.Fragment>
              ))}
              {/* Insere um AdMob no final se houver poucos alertas e o anterior não foi mostrado, ou como um banner final */}
              {(alerts.length > 0 && alerts.length <= 3) && <AdPlaceholder />}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum alerta reportado no momento.
            </p>
          )}
          {/* Se não houver alertas, um banner final pode ser exibido */}
          {alerts.length === 0 && <AdPlaceholder />}
        </CardContent>
      </Card>
    </div>
  );
}

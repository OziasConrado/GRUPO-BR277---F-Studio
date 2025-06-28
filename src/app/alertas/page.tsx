
'use client';

import Link from 'next/link';
import { ArrowLeft, BellRing, Loader2 } from 'lucide-react';
import AlertCard, { type AlertProps } from '@/components/alerts/alert-card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import React from 'react';
import { firestore } from '@/lib/firebase/client';
import { collection, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);


export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados." });
      setLoading(false);
      return;
    }
    setLoading(true);

    const alertsCollection = collection(firestore, 'alerts');
    const q = query(alertsCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'Alerta',
          description: data.description || '',
          location: data.location || 'Localização não especificada',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          userNameReportedBy: data.userNameReportedBy || 'Usuário Anônimo',
          userAvatarUrl: data.userAvatarUrl || 'https://placehold.co/40x40.png',
          dataAIAvatarHint: data.dataAIAvatarHint || 'user avatar',
          bio: data.bio || 'Usuário da comunidade Rota Segura.',
          instagramUsername: data.instagramUsername,
          userLocation: data.userLocation || 'Localização Desconhecida',
        } as AlertProps;
      });
      setAlerts(fetchedAlerts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching alerts in real-time: ", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Alertas", description: "Não foi possível buscar os alertas." });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [toast]);


  return (
    <div className="w-full space-y-6">
      <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-0">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Feed
      </Link>

      <div className="text-center">
        <BellRing className="mx-auto h-10 w-10 text-primary mb-2" />
        <h1 className="text-3xl font-bold font-headline">Mural de Alertas</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Confira os últimos alertas reportados pela comunidade e mantenha-se informado sobre as condições das estradas.
        </p>
      </div>

      <div className="space-y-6 pt-2">
          <AdPlaceholder />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <AlertCard alert={alert} />
                  {(index === 2 && alerts.length > 3) && <AdPlaceholder />}
                </React.Fragment>
              ))}
              {(alerts.length > 0 && alerts.length <= 3) && <AdPlaceholder />}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum alerta reportado no momento.
            </p>
          )}
          {alerts.length === 0 && !loading && <AdPlaceholder />}
        </div>
    </div>
  );
}

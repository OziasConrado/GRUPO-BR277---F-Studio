
'use client';

import Link from 'next/link';
import { ArrowLeft, BellRing, Loader2 } from 'lucide-react';
import AlertCard, { type AlertProps } from '@/components/alerts/alert-card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import React from 'react';
import { collection, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdPlaceholder from '@/components/common/AdPlaceholder';

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { firestore } = useAuth();

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
          userName: data.userName || 'Usuário Anônimo',
          userAvatarUrl: data.userAvatarUrl,
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

    return () => unsubscribe();
  }, [firestore, toast]);


  return (
    <div className="w-full space-y-6">
      <Link href="/streaming" className="inline-flex items-center text-sm text-primary hover:underline mb-0">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Início
      </Link>

      <div className="text-center">
        <BellRing className="mx-auto h-10 w-10 text-primary mb-2" />
        <h1 className="text-3xl font-bold font-headline">Mural de Alertas</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Confira os últimos alertas reportados pela comunidade e mantenha-se informado sobre as condições das estradas.
        </p>
      </div>

      <div className="space-y-6 pt-2">
          <AdPlaceholder className="my-6" />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <AlertCard alert={alert} />
                  {(index === 2 && alerts.length > 3) && <AdPlaceholder className="my-6" />}
                </React.Fragment>
              ))}
              {(alerts.length > 0 && alerts.length <= 3) && <AdPlaceholder className="my-6" />}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum alerta reportado no momento.
            </p>
          )}
          {alerts.length === 0 && !loading && <AdPlaceholder className="my-6" />}
        </div>
    </div>
  );
}

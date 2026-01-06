
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchFeedbacksServer } from '@/app/actions/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareWarning, ThumbsUp, ThumbsDown, MessageCircle, FileText } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Feedback {
    id: string;
    tipo: 'opiniao_ferramentas' | 'sugestao_ferramentas';
    valor: string;
    autorNome: string;
    autorUid: string;
    timestamp: string;
}

export default function AdminFeedbacksPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const result = await fetchFeedbacksServer();
    if (result.success) {
      setFeedbacks(result.data);
    } else {
      toast({ variant: 'destructive', title: 'Erro ao buscar feedbacks', description: result.error });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const getFeedbackIcon = (feedback: Feedback) => {
    if (feedback.tipo === 'sugestao_ferramentas') {
        return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (feedback.valor === 'sim') {
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
    }
    if (feedback.valor === 'nao') {
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
    }
    return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getFeedbackText = (feedback: Feedback) => {
    if (feedback.tipo === 'sugestao_ferramentas') {
        return <span className="italic">"{feedback.valor}"</span>;
    }
    if (feedback.valor === 'sim') {
        return "Achou a galeria de ferramentas ótima.";
    }
    if (feedback.valor === 'nao') {
        return "Acha que a galeria de ferramentas pode melhorar.";
    }
    return feedback.valor;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedbacks dos Usuários</CardTitle>
        <CardDescription>Lista de todas as opiniões e sugestões enviadas pelos usuários.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map(feedback => (
              <div key={feedback.id} className="flex items-start gap-4 rounded-md border p-3">
                <div className="mt-1">{getFeedbackIcon(feedback)}</div>
                <div className="flex-grow">
                  <p className="text-sm">{getFeedbackText(feedback)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviado por <strong>{feedback.autorNome}</strong> em{' '}
                    {format(parseISO(feedback.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquareWarning className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50"/>
            <p>Nenhum feedback recebido ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

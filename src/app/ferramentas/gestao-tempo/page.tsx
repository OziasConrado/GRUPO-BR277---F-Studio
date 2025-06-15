
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Info, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"; // Added import for ScrollArea

interface Task {
  id: string;
  name: string;
  desc: string;
  urgent: boolean;
  important: boolean;
  quadrantId: QuadrantId;
}

type QuadrantId = 'q1' | 'q2' | 'q3' | 'q4';

interface QuadrantInfo {
  id: QuadrantId;
  title: string;
  explanation: string;
  className: string;
}

const quadrantDetails: QuadrantInfo[] = [
  {
    id: 'q1',
    title: 'Importante e Urgente',
    explanation: 'Faça Agora: Tarefas críticas com prazos imediatos ou consequências significativas. Ex: Crises, problemas urgentes, projetos com data final próxima.',
    className: 'bg-red-100/50 dark:bg-red-900/30 border-red-500/50',
  },
  {
    id: 'q2',
    title: 'Importante, Não Urgente',
    explanation: 'Agende: Tarefas essenciais para metas de longo prazo, desenvolvimento pessoal e prevenção de problemas. Ex: Planejamento, construção de relacionamentos, novas oportunidades, exercícios.',
    className: 'bg-blue-100/50 dark:bg-blue-900/30 border-blue-500/50',
  },
  {
    id: 'q3',
    title: 'Urgente, Não Importante',
    explanation: 'Delegue: Tarefas que demandam atenção imediata, mas não contribuem para suas metas. Ex: Interrupções, algumas reuniões, certas correspondências, atividades populares mas de baixo valor.',
    className: 'bg-yellow-100/50 dark:bg-yellow-900/30 border-yellow-500/50',
  },
  {
    id: 'q4',
    title: 'Nem Urgente nem Importante',
    explanation: 'Elimine: Distrações e atividades improdutivas. Ex: Perda de tempo, algumas redes sociais, tarefas triviais.',
    className: 'bg-green-100/50 dark:bg-green-900/30 border-green-500/50 ',
  },
];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function GestaoTempoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [urgency, setUrgency] = useState<string>('');
  const [importance, setImportance] = useState<string>('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; explanation: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorage.getItem('eisenhowerTasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        localStorage.removeItem('eisenhowerTasks');
      }
    }
  }, []);

  const saveTasksToLocalStorage = (updatedTasks: Task[]) => {
    localStorage.setItem('eisenhowerTasks', JSON.stringify(updatedTasks));
  };

  const getQuadrantId = (isUrgent: boolean, isImportant: boolean): QuadrantId => {
    if (isImportant && isUrgent) return 'q1';
    if (isImportant && !isUrgent) return 'q2';
    if (!isImportant && isUrgent) return 'q3';
    return 'q4';
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !urgency || !importance) {
      toast({ variant: 'destructive', title: 'Campos Obrigatórios', description: 'Nome da tarefa, urgência e importância são necessários.' });
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: taskName.trim(),
      desc: taskDesc.trim(),
      urgent: urgency === 'true',
      important: importance === 'true',
      quadrantId: getQuadrantId(urgency === 'true', importance === 'true'),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);

    setTaskName('');
    setTaskDesc('');
    setUrgency('');
    setImportance('');
    toast({ title: 'Tarefa Adicionada!', description: `"${newTask.name}" foi adicionada à matriz.` });
  };

  const removeTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
    toast({ title: 'Tarefa Removida' });
  };

  const handleQuadrantInfoClick = (quadrant: QuadrantInfo) => {
    setModalContent({ title: quadrant.title, explanation: quadrant.explanation });
    setIsInfoModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Gestão do Tempo - Matriz de Eisenhower</CardTitle>
          </div>
          <CardDescription>Organize suas tarefas pela urgência e importância para focar no que realmente importa.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdPlaceholder className="mb-6" />
          <form onSubmit={handleAddTask} className="space-y-4 p-4 border rounded-lg bg-muted/20 mb-8">
            <h3 className="text-lg font-semibold text-foreground">Adicionar Nova Tarefa</h3>
            <div>
              <Label htmlFor="task-name">Nome da Tarefa <span className="text-destructive">*</span></Label>
              <Input id="task-name" value={taskName} onChange={e => setTaskName(e.target.value)} className="rounded-lg mt-1 bg-background/70" />
            </div>
            <div>
              <Label htmlFor="task-desc">Descrição (Opcional)</Label>
              <Textarea id="task-desc" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="rounded-lg mt-1 min-h-[60px] bg-background/70" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency">É Urgente? <span className="text-destructive">*</span></Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency" className="w-full rounded-lg mt-1 bg-background/70"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Sim</SelectItem><SelectItem value="false">Não</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="importance">É Importante? <span className="text-destructive">*</span></Label>
                <Select value={importance} onValueChange={setImportance}>
                  <SelectTrigger id="importance" className="w-full rounded-lg mt-1 bg-background/70"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Sim</SelectItem><SelectItem value="false">Não</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full py-3 text-base">Adicionar Tarefa</Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrantDetails.map(quad => (
              <div key={quad.id} className={cn("p-4 border rounded-lg min-h-[200px] flex flex-col", quad.className)}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold font-headline">{quad.title}</h3>
                  <Button variant="ghost" size="icon" onClick={() => handleQuadrantInfoClick(quad)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-grow h-40"> {/* Added ScrollArea */}
                  <div className="space-y-2">
                    {tasks.filter(t => t.quadrantId === quad.id).map(task => (
                      <div key={task.id} className="p-2.5 border rounded-md bg-background/70 shadow-sm flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{task.name}</p>
                          {task.desc && <p className="text-xs text-muted-foreground mt-0.5">{task.desc}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeTask(task.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {tasks.filter(t => t.quadrantId === quad.id).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa aqui.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
          <AdPlaceholder className="mt-8" />
        </CardContent>
      </Card>

      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-lg">{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">{modalContent?.explanation}</p>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-2 w-full">Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

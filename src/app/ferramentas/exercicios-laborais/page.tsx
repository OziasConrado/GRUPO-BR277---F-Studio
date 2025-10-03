
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';
import { ArrowLeft, Dumbbell, Play, Pause, RotateCcw, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

interface Exercise {
  title: string;
  img: string;
  desc: string;
  dataAihint: string;
}

const exercises: Exercise[] = [
  { title: "Alongamento acima da cabeça", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_acima_da_cabec%CC%A7a.png?alt=media&token=c1a3b1a8-9d57-4b7f-8c3b-7a32d1e2e7b8", desc: "Em pé, ereto, cruze os dedos acima da cabeça e estenda os braços, esticando o corpo. Mantenha a posição e sinta o alongamento.", dataAihint: "alongamento bracos" },
  { title: "Alongamento do tríceps", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_do_tri%CC%81ceps.png?alt=media&token=1d3a6d71-9f9e-4e4b-9e4a-9c7f2f1a6c4c", desc: "Em pé, leve um braço atrás da cabeça, segure o cotovelo oposto e puxe suavemente. Sinta o alongamento na parte de trás do braço. Troque de lado.", dataAihint: "alongamento triceps" },
  { title: "Rotação de pescoço", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FRotac%CC%A7a%CC%83o_de_pescoc%CC%A7o.png?alt=media&token=3b5e4f4d-7a3d-4c3e-8c3b-9d4f2f1a6c4c", desc: "Sentado ou em pé, gire a cabeça lentamente até o queixo apontar para o ombro. Mantenha a posição por alguns segundos e repita para o outro lado, aliviando a tensão do pescoço.", dataAihint: "alongamento pescoco" },
  { title: "Alongamento total deitado", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_total_deitado.png?alt=media&token=e9d3a6d7-1f9e-4e4b-9e4a-9c7f2f1a6c4c", desc: "Deite-se no chão ou em uma superfície plana, estique os braços acima da cabeça e as pernas para baixo, alongando o corpo inteiro ao máximo como se estivesse acordando.", dataAihint: "alongamento corpo" },
  { title: "Inclinação lateral do pescoço", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FInclinac%CC%A7a%CC%83o_lateral_do_pescoc%CC%A7o.png?alt=media&token=c1a3b1a8-9d57-4b7f-8c3b-7a32d1e2e7b8", desc: "Com a mão do lado oposto, puxe a cabeça levemente para o lado, aproximando a orelha do ombro. Mantenha a posição e troque de lado, relaxando os músculos laterais do pescoço.", dataAihint: "alongamento pescoco lateral" },
  { title: "Alongamento de quadril", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_de_quadril.png?alt=media&token=1d3a6d71-9f9e-4e4b-9e4a-9c7f2f1a6c4c", desc: "Sente-se no chão, flexione uma perna e estenda a outra. Incline o tronco para frente, tentando alcançar a ponta do pé estendido. Sinta o alongamento na parte posterior da coxa e quadril. Troque as pernas.", dataAihint: "alongamento quadril" },
  { title: "Rotação de tronco", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FRotac%CC%A7a%CC%83o_de_tronco.png?alt=media&token=3b5e4f4d-7a3d-4c3e-8c3b-9d4f2f1a6c4c", desc: "Em pé ou sentado, gire a cintura o máximo possível para cada lado, olhando por cima do ombro. Segure por 5 a 10 segundos em cada lado para liberar a tensão na coluna.", dataAihint: "alongamento tronco" },
  { title: "Alongamento de mãos e dedos", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_de_ma%CC%83os_e_dedos.png?alt=media&token=e9d3a6d7-1f9e-4e4b-9e4a-9c7f2f1a6c4c", desc: "Estenda as mãos e os dedos, depois flexione-os. Faça movimentos circulares com os punhos e abra e feche as mãos repetidamente para melhorar a circulação e aliviar o cansaço.", dataAihint: "alongamento maos" },
  { title: "Alongamento de panturrilha", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_de_panturrilha.png?alt=media&token=c1a3b1a8-9d57-4b7f-8c3b-7a32d1e2e7b8", desc: "Apoie-se em uma parede ou no caminhão, leve uma perna à frente e flexione-a, mantendo o calcanhar da perna de trás firmemente no chão. Sinta o alongamento na panturrilha. Troque de perna.", dataAihint: "alongamento panturrilha" },
  { title: "Alongamento de peito", img: "https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/images%2Fexercise_images%2FAlongamento_de_peito.png?alt=media&token=1d3a6d71-9f9e-4e4b-9e4a-9c7f2f1a6c4c", desc: "Entrelaçe os dedos atrás das costas, estique os braços e empurre o peito para frente, elevando os braços suavemente. Abra o peito e respire profundamente, aliviando a postura curvada.", dataAihint: "alongamento peito" },
];

const AdPlaceholder = ({ className }: { className?: string }) => (
    <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
      <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
    </div>
);

export default function ExerciciosLaboraisPage() {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
    useEffect(() => {
      if (isTimerRunning && timer > 0) {
        intervalRef.current = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } else if (timer === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTimerRunning(false);
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [isTimerRunning, timer]);
  
    const handleOpenModal = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setTimer(30);
      setIsTimerRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  
    const toggleTimer = () => {
      if (timer === 0) { // If finished, treat as reset
        setTimer(30);
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(!isTimerRunning);
      }
    };
  
    const resetTimer = () => {
      setTimer(30);
      setIsTimerRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
  
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Ferramentas
        </Link>
  
        <Card className="rounded-xl shadow-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Dumbbell className="w-8 h-8 text-primary" />
                <CardTitle className="font-headline text-xl sm:text-2xl">Exercícios Laborais para a Estrada</CardTitle>
            </div>
            <CardDescription>Realize estes exercícios simples durante as paradas para evitar dores, lesões e ter uma viagem mais tranquila.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdPlaceholder />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {exercises.map((ex, index) => (
                <button key={index} onClick={() => handleOpenModal(ex)} className="group text-left">
                  <Card className="h-full rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-3 flex flex-col items-center text-center h-full">
                      <div className="relative w-full h-24 mb-3 rounded-md overflow-hidden bg-muted">
                        <Image src={ex.img} alt={ex.title} layout="fill" objectFit="contain" data-ai-hint={ex.dataAihint} />
                      </div>
                      <h3 className="text-xs font-semibold flex-grow">{index + 1}. {ex.title}</h3>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
            <AdPlaceholder />
          </CardContent>
        </Card>
        
        <Alert variant="default" className="border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400">
            <Info className="h-5 w-5 !text-sky-600" />
            <AlertTitle className="font-semibold !text-sky-700 dark:!text-sky-500">Dica Importante</AlertTitle>
            <ShadcnAlertDescription className="!text-sky-600/90 dark:!text-sky-400/90 text-sm">
                Lembre-se de respirar fundo e não forçar os alongamentos. Faça os movimentos de forma suave. Se sentir dor, pare imediatamente. Consulte um profissional de saúde.
            </ShadcnAlertDescription>
        </Alert>
  
        {selectedExercise && (
          <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-lg text-center">{selectedExercise.title}</DialogTitle>
              </DialogHeader>
              <div className="py-2 space-y-4 text-center">
                <div className="relative w-48 h-48 mx-auto bg-muted rounded-lg overflow-hidden border">
                    <Image src={selectedExercise.img} alt={selectedExercise.title} layout="fill" objectFit="contain" data-ai-hint={selectedExercise.dataAihint} />
                </div>
                <DialogDescription>{selectedExercise.desc}</DialogDescription>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-4xl font-mono font-bold text-primary tabular-nums">
                        {formatTime(timer)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {timer === 0 ? "Tempo concluído!" : "Segure a posição"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={toggleTimer} disabled={timer === 0 && !isTimerRunning}>
                        {isTimerRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isTimerRunning ? "Pausar" : (timer === 30 ? "Iniciar" : "Continuar")}
                    </Button>
                    <Button onClick={resetTimer} variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reiniciar
                    </Button>
                </div>
              </div>
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                    <Button type="button" className="w-full" variant="secondary">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

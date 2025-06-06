
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AlertProps } from './alert-card'; // Import AlertProps para o tipo de retorno

const alertTypes = [
  'Acidente', 'Obras na Pista', 'Congestionamento', 
  'Condição Climática Adversa', 'Animal na Pista', 'Alagamento', 
  'Neve/Gelo', 'Vento Forte', 'Outro'
];
const severities: AlertProps['severity'][] = ['Baixa', 'Média', 'Alta'];

const reportAlertSchema = z.object({
  type: z.string().min(1, "Tipo de alerta é obrigatório."),
  location: z.string().min(5, "Localização deve ter pelo menos 5 caracteres."),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres."),
  severity: z.enum(severities, { required_error: "Gravidade é obrigatória." }),
});

type ReportAlertFormValues = z.infer<typeof reportAlertSchema>;

interface ReportAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertReported: (alertData: Omit<AlertProps, 'id' | 'timestamp' | 'reportedBy'>) => void;
}

export default function ReportAlertModal({ isOpen, onClose, onAlertReported }: ReportAlertModalProps) {
  const { toast } = useToast();
  const form = useForm<ReportAlertFormValues>({
    resolver: zodResolver(reportAlertSchema),
    defaultValues: {
      type: "",
      location: "",
      description: "",
      severity: "Média",
    },
  });

  const onSubmit = (data: ReportAlertFormValues) => {
    onAlertReported(data);
    toast({
      title: "Alerta Reportado!",
      description: "Obrigado por sua contribuição para a comunidade.",
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) form.reset(); onClose(); }}>
      <DialogContent className="sm:max-w-[480px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Reportar Novo Alerta</DialogTitle>
          <DialogDescription>
            Ajude a comunidade informando sobre ocorrências na estrada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="type">Tipo de Alerta</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="type" className="w-full rounded-lg mt-1 bg-background/70">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              placeholder="Ex: BR-116, Km 230, Próximo a..."
              {...form.register("location")}
              className="rounded-lg mt-1 bg-background/70"
            />
            {form.formState.errors.location && <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o que está acontecendo..."
              {...form.register("description")}
              className="rounded-lg mt-1 min-h-[100px] bg-background/70"
            />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="severity">Gravidade</Label>
            <Controller
              name="severity"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="severity" className="w-full rounded-lg mt-1 bg-background/70">
                    <SelectValue placeholder="Selecione a gravidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map(sev => (
                      <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.severity && <p className="text-sm text-destructive mt-1">{form.formState.errors.severity.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Reportar Alerta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { touristCategories } from '@/types/turismo';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useState, type ChangeEvent, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const indicatePointSchema = z.object({
  name: z.string().min(3, "Nome do local é obrigatório (mín. 3 caracteres).").max(100),
  locationName: z.string().min(3, "Cidade/Localização é obrigatória.").max(100),
  category: z.enum(touristCategories, { required_error: "Categoria é obrigatória." }),
  description: z.string().min(20, "Descrição é obrigatória (mín. 20 caracteres).").max(500),
  imageFile: z.custom<File>(
      (val) => val instanceof File, { message: "Foto do local é obrigatória." }
    ).refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Tamanho máximo da imagem: ${MAX_FILE_SIZE_MB}MB.`
    ).refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Formato de imagem inválido (aceito: JPG, PNG, WebP)."
    ).optional(),
});

type IndicatePointFormValues = z.infer<typeof indicatePointSchema>;

export type IndicatePointSubmitData = IndicatePointFormValues;


interface IndicatePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IndicatePointSubmitData) => void;
  isSubmitting: boolean;
}

export default function IndicatePointModal({ isOpen, onClose, onSubmit, isSubmitting }: IndicatePointModalProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<IndicatePointFormValues>({
    resolver: zodResolver(indicatePointSchema),
    defaultValues: {
      name: "",
      locationName: "",
      description: "",
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo da imagem: ${MAX_FILE_SIZE_MB}MB.`});
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: "Formato de imagem inválido (aceito: JPG, PNG, WebP)."});
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      form.setValue("imageFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("imageFile", undefined, { shouldValidate: true });
      setImagePreview(null);
    }
  };
  
  const removeImage = () => {
    form.setValue("imageFile", undefined, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = (data: IndicatePointFormValues) => {
    onSubmit(data);
  };

  const handleCloseDialog = () => {
    form.reset();
    removeImage();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else form.reset(); }}>
      <DialogContent className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none bg-background !p-0 grid grid-rows-[auto_1fr_auto] !translate-x-0 !translate-y-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="font-headline text-xl">Indicar Ponto Turístico</DialogTitle>
          <DialogDescription>
            Ajude outros viajantes a descobrir lugares incríveis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col overflow-hidden">
          <ScrollArea className="flex-grow px-4 min-h-0">
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name-turismo">Nome do Local <span className="text-destructive">*</span></Label>
                <Input id="name-turismo" {...form.register("name")} className="mt-1" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="locationName-turismo">Cidade / Localização <span className="text-destructive">*</span></Label>
                <Input id="locationName-turismo" {...form.register("locationName")} className="mt-1" placeholder="Ex: Morretes, PR" />
                {form.formState.errors.locationName && <p className="text-sm text-destructive mt-1">{form.formState.errors.locationName.message}</p>}
              </div>
              <div>
                <Label htmlFor="category-turismo">Categoria <span className="text-destructive">*</span></Label>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger id="category-turismo" className="mt-1">
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {touristCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="imageFile-turismo">Foto do Local <span className="text-destructive">*</span></Label>
                 <Input 
                    id="imageFile-turismo"
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Clique para enviar ou alterar a foto"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
                    className="mt-1 flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed border-input hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-colors"
                  >
                      {imagePreview ? (
                          <div className="relative w-full h-full p-1">
                              <Image src={imagePreview} alt="Preview da foto" layout="fill" objectFit="contain" className="rounded"/>
                              <div
                                  role="button"
                                  tabIndex={0}
                                  aria-label="Remover foto"
                                  className="absolute -top-1 -right-1 h-6 w-6 z-10 bg-destructive text-destructive-foreground rounded-full p-1 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeImage(); }}}
                              >
                                  <X className="h-4 w-4"/>
                              </div>
                          </div>
                      ) : (
                          <>
                              <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground"/>
                              <span className="text-muted-foreground text-sm mt-1">Clique para enviar uma foto</span>
                              <span className="text-xs text-muted-foreground/80 mt-0.5">JPG, PNG, WebP (Máx {MAX_FILE_SIZE_MB}MB)</span>
                          </>
                      )}
                  </div>
                {form.formState.errors.imageFile && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message}</p>}
              </div>
              <div>
                <Label htmlFor="description-turismo">Descrição <span className="text-destructive">*</span></Label>
                <Textarea id="description-turismo" {...form.register("description")} className="mt-1 min-h-[80px]" placeholder="Fale sobre o local, por que ele é especial..."/>
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Indicação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

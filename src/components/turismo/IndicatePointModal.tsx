'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

const MAX_FILE_SIZE_MB = 2;
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
    ),
});

type IndicatePointFormValues = z.infer<typeof indicatePointSchema>;

// The data passed to the onSubmit function will not include the raw file
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Indicar Ponto Turístico</DialogTitle>
          <DialogDescription>
            Ajude outros viajantes a descobrir lugares incríveis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-3">
          <ScrollArea className="h-[65vh] pr-5">
            <div className="space-y-3 py-1">
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
                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-1 flex flex-col items-center justify-center h-32 border-dashed hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview da foto" layout="fill" objectFit="contain" className="rounded"/>
                            <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 z-10 opacity-70 hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className="mr-2 h-8 w-8 text-muted-foreground"/>
                            <span className="text-muted-foreground text-sm">Clique para enviar imagem</span>
                        </>
                    )}
                </Button>
                {form.formState.errors.imageFile && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message}</p>}
              </div>
              <div>
                <Label htmlFor="description-turismo">Descrição <span className="text-destructive">*</span></Label>
                <Textarea id="description-turismo" {...form.register("description")} className="mt-1 min-h-[80px]" placeholder="Fale sobre o local, por que ele é especial..."/>
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
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

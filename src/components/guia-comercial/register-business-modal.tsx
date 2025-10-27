'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { BusinessData, BusinessCategory, PlanType } from '@/types/guia-comercial';
import { businessCategories, planTypes } from '@/types/guia-comercial';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useState, type ChangeEvent, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const registerBusinessSchema = z.object({
  name: z.string().min(3, "Nome do comércio é obrigatório (mín. 3 caracteres).").max(100),
  category: z.enum(businessCategories, { required_error: "Categoria é obrigatória." }),
  address: z.string().min(10, "Endereço é obrigatório (mín. 10 caracteres).").max(200),
  phone: z.string().optional().refine(val => !val || /^\d{10,11}$/.test(val.replace(/\D/g, '')), {
    message: "Telefone inválido (use DDD + número)."
  }),
  whatsapp: z.string().optional().refine(val => !val || /^\d{10,15}$/.test(val.replace(/\D/g, '')), {
    message: "WhatsApp inválido (Ex: 5541999998888)."
  }),
  instagramUsername: z.string().optional().refine(val => !val || /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(val), {
    message: "Usuário do Instagram inválido."
  }),
  description: z.string().min(20, "Descrição é obrigatória (mín. 20 caracteres).").max(500),
  imageFile: z.custom<File>(
      (val) => val instanceof File, { message: "Foto principal é obrigatória." }
    ).refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Tamanho máximo da imagem: ${MAX_FILE_SIZE_MB}MB.`
    ).refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Formato de imagem inválido (aceito: JPG, PNG, WebP)."
    ),
  servicesOffered: z.string().optional(),
  operatingHours: z.string().max(100).optional(),
  plano: z.enum(planTypes, { required_error: "A seleção de um plano é obrigatória." }),
});

type RegisterBusinessFormValues = z.infer<typeof registerBusinessSchema>;

export type RegisterBusinessSubmitData = RegisterBusinessFormValues;

interface RegisterBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterBusinessSubmitData) => void;
}

export default function RegisterBusinessModal({ isOpen, onClose, onSubmit }: RegisterBusinessModalProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterBusinessFormValues>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      instagramUsername: "",
      plano: "PREMIUM", // Default to Premium for full feature visibility in simulation
    },
  });

  const selectedPlan = form.watch("plano");

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo da imagem: ${MAX_FILE_SIZE_MB}MB.`});
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      form.setValue("imageFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    form.setValue("imageFile", undefined, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (data: RegisterBusinessFormValues) => {
    onSubmit(data);
    form.reset();
    removeImage();
  };

  const handleCloseDialog = () => {
    form.reset();
    removeImage();
    onClose();
  };

  const planFeatures = {
    GRATUITO: {
        operatingHours: false,
        instagramUsername: false,
        servicesOffered: false,
    },
    INTERMEDIARIO: {
        operatingHours: true,
        instagramUsername: false,
        servicesOffered: true,
    },
    PREMIUM: {
        operatingHours: true,
        instagramUsername: true,
        servicesOffered: true,
    }
  };

  const currentPlanFeatures = planFeatures[selectedPlan] || planFeatures.GRATUITO;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
      <DialogContent className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none bg-background !p-0 grid grid-rows-[auto_1fr_auto] !translate-x-0 !translate-y-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="font-headline text-xl">Cadastrar Novo Comércio</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar seu estabelecimento ao guia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-grow flex flex-col overflow-hidden">
          <ScrollArea className="flex-grow min-h-0">
            <div className="space-y-4 py-4 px-4">
              <div>
                <Label htmlFor="plano-comercial">Plano Escolhido <span className="text-destructive">*</span></Label>
                <Controller
                  name="plano"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="plano-comercial" className="mt-1">
                        <SelectValue placeholder="Selecione um plano..." />
                      </SelectTrigger>
                      <SelectContent>
                        {planTypes.map(plan => (
                          <SelectItem key={plan} value={plan}>{plan.charAt(0) + plan.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {form.formState.errors.plano && <p className="text-sm text-destructive mt-1">{form.formState.errors.plano.message}</p>}
              </div>

              <div>
                <Label htmlFor="name-comercial">Nome do Comércio <span className="text-destructive">*</span></Label>
                <Input id="name-comercial" {...form.register("name")} className="mt-1" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="category-comercial">Categoria <span className="text-destructive">*</span></Label>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <SelectTrigger id="category-comercial" className="mt-1">
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="imageFile-comercial">Foto Principal <span className="text-destructive">*</span></Label>
                 <Input 
                    id="imageFile-comercial"
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
                              <Image src={imagePreview} alt="Preview da foto principal" layout="fill" objectFit="contain" className="rounded"/>
                              <button
                                  type="button"
                                  aria-label="Remover foto"
                                  className="absolute -top-1 -right-1 h-6 w-6 z-10 bg-destructive text-destructive-foreground rounded-full p-1 flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                              >
                                  <X className="h-4 w-4"/>
                              </button>
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
                <Label htmlFor="address-comercial">Endereço Completo <span className="text-destructive">*</span></Label>
                <Textarea id="address-comercial" {...form.register("address")} className="mt-1 min-h-[60px]" />
                {form.formState.errors.address && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>}
              </div>

              <div>
                <Label htmlFor="description-comercial">Descrição <span className="text-destructive">*</span></Label>
                <Textarea id="description-comercial" {...form.register("description")} className="mt-1 min-h-[80px]" placeholder="Fale sobre seu negócio, diferenciais, etc."/>
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone-comercial">Telefone (Fixo ou Celular)</Label>
                <Input id="phone-comercial" type="tel" {...form.register("phone")} className="mt-1" placeholder="Ex: 4133334444" />
                {form.formState.errors.phone && <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp-comercial">WhatsApp (País+DDD+Número)</Label>
                <Input id="whatsapp-comercial" type="tel" {...form.register("whatsapp")} className="mt-1" placeholder="Ex: 5541999998888"/>
                {form.formState.errors.whatsapp && <p className="text-sm text-destructive mt-1">{form.formState.errors.whatsapp.message}</p>}
              </div>
              
              {currentPlanFeatures.instagramUsername && (
                <div>
                  <Label htmlFor="instagramUsername-comercial">Usuário do Instagram (sem @)</Label>
                  <Input id="instagramUsername-comercial" {...form.register("instagramUsername")} className="mt-1" placeholder="Ex: nome_do_meu_comercio"/>
                  {form.formState.errors.instagramUsername && <p className="text-sm text-destructive mt-1">{form.formState.errors.instagramUsername.message}</p>}
                </div>
              )}

              {currentPlanFeatures.servicesOffered && (
                <div>
                  <Label htmlFor="servicesOffered-comercial">Serviços Oferecidos (separados por vírgula)</Label>
                  <Input id="servicesOffered-comercial" {...form.register("servicesOffered")} className="mt-1" placeholder="Ex: Wi-Fi, Banheiro, Café"/>
                </div>
              )}

              {currentPlanFeatures.operatingHours && (
                <div>
                  <Label htmlFor="operatingHours-comercial">Horário de Funcionamento</Label>
                  <Input id="operatingHours-comercial" {...form.register("operatingHours")} className="mt-1" placeholder="Ex: Seg-Sex: 08:00-18:00"/>
                  {form.formState.errors.operatingHours && <p className="text-sm text-destructive mt-1">{form.formState.errors.operatingHours.message}</p>}
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enviando..." : "Enviar para Análise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

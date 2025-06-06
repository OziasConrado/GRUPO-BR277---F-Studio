
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
import type { BusinessData, BusinessCategory } from '@/types/guia-comercial';
import { businessCategories } from '@/types/guia-comercial';
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
    message: "Nome de usuário do Instagram inválido."
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
  isPremium: z.boolean().default(false),
});

type RegisterBusinessFormValues = z.infer<typeof registerBusinessSchema>;

interface RegisterBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BusinessData, 'id' | 'imageUrl' | 'dataAIImageHint'> & { imagePreviewUrl: string }) => void;
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
      isPremium: false,
      instagramUsername: "",
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
      form.setValue("imageFile", undefined);
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

  const handleFormSubmit = async (data: RegisterBusinessFormValues) => {
    if (!data.imageFile || !imagePreview) {
        toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, envie uma foto principal para o comércio."});
        return;
    }
    
    const businessPayload = { // Explicitly create the payload for onSubmit
        name: data.name,
        category: data.category,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        instagramUsername: data.instagramUsername,
        description: data.description,
        servicesOffered: data.servicesOffered?.split(',').map(s => s.trim()).filter(s => s) || [],
        operatingHours: data.operatingHours,
        isPremium: data.isPremium,
        imagePreviewUrl: imagePreview, // Pass the preview URL
    };
    onSubmit(businessPayload);
    form.reset();
    removeImage();
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
          <DialogTitle className="font-headline text-xl">Cadastrar Novo Comércio</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar seu estabelecimento ao guia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-3">
          <ScrollArea className="h-[65vh] pr-5">
            <div className="space-y-3 py-1">
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
                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-1 flex flex-col items-center justify-center h-32 border-dashed hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview da foto principal" layout="fill" objectFit="contain" className="rounded"/>
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
                            <span className="text-xs text-muted-foreground/80 mt-1">JPG, PNG, WebP - Máx {MAX_FILE_SIZE_MB}MB</span>
                        </>
                    )}
                </Button>
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

              <div>
                <Label htmlFor="instagramUsername-comercial">Usuário do Instagram</Label>
                <Input id="instagramUsername-comercial" {...form.register("instagramUsername")} className="mt-1" placeholder="Ex: nome_do_meu_comercio"/>
                {form.formState.errors.instagramUsername && <p className="text-sm text-destructive mt-1">{form.formState.errors.instagramUsername.message}</p>}
              </div>


              <div>
                <Label htmlFor="servicesOffered-comercial">Serviços Oferecidos (separados por vírgula)</Label>
                <Input id="servicesOffered-comercial" {...form.register("servicesOffered")} className="mt-1" placeholder="Ex: Wi-Fi, Banheiro, Café"/>
              </div>

              <div>
                <Label htmlFor="operatingHours-comercial">Horário de Funcionamento</Label>
                <Input id="operatingHours-comercial" {...form.register("operatingHours")} className="mt-1" placeholder="Ex: Seg-Sex: 08:00-18:00"/>
                {form.formState.errors.operatingHours && <p className="text-sm text-destructive mt-1">{form.formState.errors.operatingHours.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Controller
                    name="isPremium"
                    control={form.control}
                    render={({ field }) => (
                        <Checkbox
                        id="isPremium-comercial"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    )}
                />
                <Label htmlFor="isPremium-comercial" className="font-normal text-sm">
                  Este é um Comércio Premium (Destaque e sem anúncios no card. Funcionalidade conceitual).
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-7">
                Comércios no plano gratuito podem exibir um pequeno banner de anúncio no card.
              </p>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Cadastrar Comércio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

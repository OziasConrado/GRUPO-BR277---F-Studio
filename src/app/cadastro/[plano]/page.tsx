
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { BusinessCategory, PlanType } from '@/types/guia-comercial';
import { businessCategories, planTypes } from '@/types/guia-comercial';
import { useToast } from "@/hooks/use-toast";
import { useState, type ChangeEvent, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { UploadCloud, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { firestore, uploadFile } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PROMO_IMAGES = 4;

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
  imageFile: z.custom<File | undefined>().optional()
    .refine(
      (file) => file === undefined || file.size <= MAX_FILE_SIZE_BYTES,
      `Tamanho máximo da imagem principal: ${MAX_FILE_SIZE_MB}MB.`
    ).refine(
      (file) => file === undefined || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Formato de imagem inválido (aceito: JPG, PNG, WebP)."
    ),
  promoImageFiles: z.array(z.custom<File>()).optional(),
  servicesOffered: z.string().optional(),
  operatingHours: z.string().max(100).optional(),
  plano: z.enum(planTypes, { required_error: "O plano não foi definido." }),
});

type RegisterBusinessFormValues = z.infer<typeof registerBusinessSchema>;
export type RegisterBusinessSubmitData = RegisterBusinessFormValues;

const planFeatures = {
  GRATUITO: { operatingHours: false, instagramUsername: false, servicesOffered: false, whatsapp: false, photo: false, promoImages: 0 },
  INTERMEDIARIO: { operatingHours: true, instagramUsername: true, servicesOffered: true, whatsapp: true, photo: true, promoImages: 2 },
  PREMIUM: { operatingHours: true, instagramUsername: true, servicesOffered: true, whatsapp: true, photo: true, promoImages: 4 }
};

export default function RegisterBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticating } = useAuth();
  const planoParam = params.plano as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedPlano = useMemo(() => {
    if (!planoParam) return null;
    const upperCasePlano = planoParam.toUpperCase() as PlanType;
    return planTypes.includes(upperCasePlano) ? upperCasePlano : null;
  }, [planoParam]);

  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [promoImagePreviews, setPromoImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promoFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterBusinessFormValues>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      plano: formattedPlano || undefined,
    },
  });

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = form;

  const currentPlanFeatures = planFeatures[formattedPlano as keyof typeof planFeatures] || planFeatures.GRATUITO;

  useEffect(() => {
    if (!isAuthenticating) {
      if (!currentUser) {
        toast({
          title: "Login Necessário",
          description: "Você precisa fazer login para cadastrar um negócio.",
          variant: "destructive"
        });
        router.push(`/login?redirect=/cadastro/${planoParam}`);
      } else if (!formattedPlano) {
        toast({
          title: "Plano Inválido",
          description: "O plano selecionado não é válido. Por favor, escolha um plano.",
          variant: "destructive"
        });
        router.push('/planos');
      } else {
        setValue('plano', formattedPlano);
        if (currentPlanFeatures.photo) {
          form.register('imageFile', {
              validate: value => value instanceof File || "A foto principal é obrigatória para este plano."
          });
        }
      }
    }
  }, [isAuthenticating, currentUser, formattedPlano, planoParam, router, toast, setValue, currentPlanFeatures.photo, form]);


  const onSubmit = async (data: RegisterBusinessFormValues) => {
    if (!currentUser || !firestore) {
      toast({ title: "Erro", description: "Você precisa estar logado para cadastrar.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { imageFile, promoImageFiles, ...businessData } = data;
      let imageUrl: string | undefined;
      let promoImageUrls: { url: string; hint: string; }[] = [];

      if (imageFile && currentPlanFeatures.photo) {
        const filePath = `business_images/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadFile(imageFile, filePath);
      }

      if (promoImageFiles && currentPlanFeatures.promoImages > 0) {
        for (const file of promoImageFiles) {
          const filePath = `business_promo_images/${currentUser.uid}/${Date.now()}_${file.name}`;
          const url = await uploadFile(file, filePath);
          promoImageUrls.push({ url, hint: `promotion for ${data.name}` });
        }
      }

      const docToSave = {
        ...businessData,
        ownerId: currentUser.uid,
        imageUrl: imageUrl || 'https://placehold.co/800x400/e2e8f0/64748b?text=Sem+Foto',
        dataAIImageHint: imageUrl ? `photo of ${data.name}` : 'no photo placeholder',
        promoImages: promoImageUrls,
        statusPagamento: data.plano === 'GRATUITO' ? 'ATIVO' : 'PENDENTE',
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, 'businesses'), docToSave);
      
      toast({
        title: "Cadastro Enviado com Sucesso!",
        description: data.plano === 'GRATUITO'
          ? "Seu estabelecimento foi publicado no Guia Comercial."
          : "Seu estabelecimento foi enviado para análise. Efetue o pagamento para publicá-lo.",
      });
      router.push('/guia-comercial');

    } catch (error) {
      console.error("Erro ao cadastrar negócio:", error);
      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: "Não foi possível salvar seu cadastro. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isAuthenticating || !currentUser || !formattedPlano) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // --- IMAGE HANDLERS ---
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationResult = z.custom<File>().refine(f => f.size <= MAX_FILE_SIZE_BYTES).safeParse(file);
      if (!validationResult.success) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo: ${MAX_FILE_SIZE_MB}MB.` });
        return;
      }
      setValue("imageFile", file, { shouldValidate: true });
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const removeImage = () => {
    setValue("imageFile", undefined, { shouldValidate: true });
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePromoImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const currentPromoFiles = form.getValues("promoImageFiles") || [];
    if(currentPromoFiles.length + files.length > currentPlanFeatures.promoImages) {
        toast({ variant: "destructive", title: "Limite de Imagens Excedido", description: `Você pode enviar no máximo ${currentPlanFeatures.promoImages} imagens promocionais para este plano.` });
        return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPromoImagePreviews(prev => [...prev, ...newPreviews]);
    setValue("promoImageFiles", [...currentPromoFiles, ...files], { shouldValidate: true });
  };

  const removePromoImage = (indexToRemove: number) => {
    const currentPromoFiles = form.getValues("promoImageFiles") || [];
    const updatedFiles = currentPromoFiles.filter((_, index) => index !== indexToRemove);
    setValue("promoImageFiles", updatedFiles, { shouldValidate: true });
    
    const updatedPreviews = promoImagePreviews.filter((_, index) => index !== indexToRemove);
    setPromoImagePreviews(updatedPreviews);
  };


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
        <Link href="/planos" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Planos
        </Link>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Cadastro no Guia Comercial</CardTitle>
                <CardDescription>
                    Plano selecionado: <span className="font-bold text-primary">{formattedPlano.charAt(0) + formattedPlano.slice(1).toLowerCase()}</span>. 
                    Preencha os campos abaixo.
                </CardDescription>
            </CardHeader>
            <CardContent>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name-comercial">Nome do Comércio <span className="text-destructive">*</span></Label>
                        <Input id="name-comercial" {...register("name")} className="mt-1" />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="category-comercial">Categoria <span className="text-destructive">*</span></Label>
                        <Controller name="category" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="category-comercial" className="mt-1"><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                                <SelectContent><>{businessCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</></SelectContent>
                            </Select>
                        )} />
                        {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                    </div>

                    {currentPlanFeatures.photo && (
                        <div>
                            <Label htmlFor="imageFile-comercial">Foto Principal / Logo <span className="text-destructive">*</span></Label>
                            <Input id="imageFile-comercial" ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
                            <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} className="mt-1 flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed border-input hover:border-primary cursor-pointer transition-colors">
                                {imagePreview ? (
                                    <div className="relative w-full h-full p-1">
                                        <Image src={imagePreview} alt="Preview da foto principal" layout="fill" objectFit="contain" className="rounded"/>
                                        <button type="button" className="absolute -top-1 -right-1 h-6 w-6 z-10 bg-destructive text-destructive-foreground rounded-full p-1" onClick={(e) => { e.stopPropagation(); removeImage(); }}><X className="h-4 w-4"/></button>
                                    </div>
                                ) : (
                                    <><UploadCloud className="h-8 w-8 text-muted-foreground"/><span className="text-muted-foreground text-sm mt-1">Clique para enviar uma foto</span><span className="text-xs text-muted-foreground/80 mt-0.5">JPG, PNG, WebP (Máx {MAX_FILE_SIZE_MB}MB)</span></>
                                )}
                            </div>
                            {errors.imageFile && <p className="text-sm text-destructive mt-1">{errors.imageFile.message}</p>}
                        </div>
                    )}
                    
                    <div>
                        <Label htmlFor="address-comercial">Endereço Completo <span className="text-destructive">*</span></Label>
                        <Textarea id="address-comercial" {...register("address")} className="mt-1 min-h-[60px]" />
                        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description-comercial">Descrição <span className="text-destructive">*</span></Label>
                        <Textarea id="description-comercial" {...register("description")} className="mt-1 min-h-[80px]" placeholder="Fale sobre seu negócio, diferenciais, etc."/>
                        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="phone-comercial">Telefone (Fixo ou Celular)</Label>
                        <Input id="phone-comercial" type="tel" {...register("phone")} className="mt-1" placeholder="Ex: 4133334444" />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                    </div>

                    {currentPlanFeatures.whatsapp && (
                        <div>
                            <Label htmlFor="whatsapp-comercial">WhatsApp (País+DDD+Número)</Label>
                            <Input id="whatsapp-comercial" type="tel" {...register("whatsapp")} className="mt-1" placeholder="Ex: 5541999998888"/>
                            {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp.message}</p>}
                        </div>
                    )}

                    {currentPlanFeatures.instagramUsername && (
                        <div>
                            <Label htmlFor="instagramUsername-comercial">Usuário do Instagram (sem @)</Label>
                            <Input id="instagramUsername-comercial" {...register("instagramUsername")} className="mt-1" placeholder="Ex: nome_do_meu_comercio"/>
                            {errors.instagramUsername && <p className="text-sm text-destructive mt-1">{errors.instagramUsername.message}</p>}
                        </div>
                    )}

                    {currentPlanFeatures.servicesOffered && (
                        <div>
                            <Label htmlFor="servicesOffered-comercial">Serviços Oferecidos (separados por vírgula)</Label>
                            <Input id="servicesOffered-comercial" {...register("servicesOffered")} className="mt-1" placeholder="Ex: Wi-Fi, Banheiro, Café"/>
                        </div>
                    )}

                    {currentPlanFeatures.operatingHours && (
                        <div>
                            <Label htmlFor="operatingHours-comercial">Horário de Funcionamento</Label>
                            <Input id="operatingHours-comercial" {...register("operatingHours")} className="mt-1" placeholder="Ex: Seg-Sex: 08:00-18:00"/>
                            {errors.operatingHours && <p className="text-sm text-destructive mt-1">{errors.operatingHours.message}</p>}
                        </div>
                    )}

                    {currentPlanFeatures.promoImages > 0 && (
                        <div>
                             <Label htmlFor="promoImageFiles-comercial">Imagens Promocionais (até {currentPlanFeatures.promoImages})</Label>
                            <Input id="promoImageFiles-comercial" ref={promoFileInputRef} type="file" multiple accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handlePromoImagesChange} />
                             <div role="button" tabIndex={0} onClick={() => promoFileInputRef.current?.click()} className="mt-1 flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-input hover:border-primary cursor-pointer transition-colors">
                                <UploadCloud className="h-8 w-8 text-muted-foreground"/>
                                <span className="text-muted-foreground text-sm mt-1">Clique para adicionar imagens</span>
                             </div>
                             {promoImagePreviews.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {promoImagePreviews.map((src, index) => (
                                        <div key={src} className="relative aspect-square">
                                            <Image src={src} alt={`Preview ${index}`} layout="fill" objectFit="cover" className="rounded" />
                                            <button type="button" className="absolute -top-1 -right-1 h-6 w-6 z-10 bg-destructive text-destructive-foreground rounded-full p-1" onClick={() => removePromoImage(index)}><X className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                    )}

                     <div className="pt-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Enviando...</> : "Enviar Cadastro para Análise"}
                        </Button>
                    </div>

                </div>
            </form>
            </CardContent>
        </Card>
    </div>
  );
}

    
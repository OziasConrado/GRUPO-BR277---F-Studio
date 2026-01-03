'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Zod schema updated to handle conditional validation
const bannerSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório (mín. 3 caracteres).'),
  targetUrl: z.string().url('A URL de destino deve ser um link válido.'),
  order: z.coerce.number().min(0, 'A ordem deve ser um número positivo.'),
  isActive: z.boolean().default(true),
  imageSourceType: z.enum(['upload', 'url']).default('upload'),
  imageFile: z.custom<File | undefined>().optional(),
  imageUrlInput: z.string().optional(),
}).refine(data => {
  if (data.imageSourceType === 'url') {
    return !!data.imageUrlInput && z.string().url().safeParse(data.imageUrlInput).success;
  }
  return true;
}, {
  message: 'Por favor, insira uma URL de imagem válida.',
  path: ['imageUrlInput'],
}).refine(data => {
    // When creating a new banner (banner prop is null), one of the two must be present.
    // For editing, this rule is relaxed in the onSubmit logic.
    if (data.imageSourceType === 'upload') {
        return data.imageFile instanceof File;
    }
    if (data.imageSourceType === 'url') {
        return !!data.imageUrlInput;
    }
    return true; // Should not happen
}, {
  message: 'Uma imagem (upload ou URL) é obrigatória para um novo banner.',
  path: ['imageFile'], // Report error on the first tab field for visibility
});


type BannerFormValues = z.infer<typeof bannerSchema>;

export interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  order: number;
}

interface BannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
}

export function BannerForm({ isOpen, onClose, banner }: BannerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: '',
      targetUrl: '',
      order: 0,
      isActive: true,
      imageSourceType: 'upload',
      imageFile: undefined,
      imageUrlInput: '',
    },
  });

  useEffect(() => {
    if (banner) {
      form.reset({
        name: banner.name,
        targetUrl: banner.targetUrl,
        order: banner.order,
        isActive: banner.isActive,
        imageSourceType: 'upload', // Default to upload, user can switch
        imageFile: undefined,
        imageUrlInput: banner.imageUrl.startsWith('http') ? banner.imageUrl : '',
      });
      setImagePreview(banner.imageUrl);
    } else {
      form.reset();
      setImagePreview(null);
    }
  }, [banner, form, isOpen]);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O tamanho máximo da imagem é de ${MAX_FILE_SIZE_MB}MB.`,
        });
        form.setValue('imageFile', undefined);
        return;
      }
      form.setValue('imageFile', file);
      form.setValue('imageUrlInput', ''); // Clear other source
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('imageUrlInput', url);
    if(z.string().url().safeParse(url).success) {
        setImagePreview(url);
        form.setValue('imageFile', undefined); // Clear other source
    } else {
        setImagePreview(null);
    }
  }


  const onSubmit = async (data: BannerFormValues) => {
    // Manual validation for new banner image requirement
    if (!banner && !data.imageFile && !data.imageUrlInput) {
        form.setError('imageFile', { message: 'A imagem é obrigatória (upload ou URL).' });
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = banner?.imageUrl;
      const storage = getStorage();

      if (data.imageSourceType === 'upload' && data.imageFile) {
        // If editing and there was an old image, delete it
        if (banner && banner.imageUrl) {
          try {
            const oldImageRef = ref(storage, banner.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error: any) {
             if (error.code !== 'storage/object-not-found') {
                console.warn("Falha ao deletar imagem antiga:", error);
             }
          }
        }
        
        // Upload new image
        const imagePath = `banners/${Date.now()}_${data.imageFile.name}`;
        const newImageRef = ref(storage, imagePath);
        await uploadBytes(newImageRef, data.imageFile);
        finalImageUrl = await getDownloadURL(newImageRef);
      } else if (data.imageSourceType === 'url' && data.imageUrlInput) {
        finalImageUrl = data.imageUrlInput;
      }
      
      if (!finalImageUrl) {
          throw new Error("URL da imagem não está disponível. A imagem pode não ter sido fornecida ou o upload falhou.");
      }

      const bannerData = {
        name: data.name,
        targetUrl: data.targetUrl,
        order: data.order,
        isActive: data.isActive,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (banner) {
        const bannerRef = doc(db, 'banners', banner.id);
        await updateDoc(bannerRef, bannerData);
        toast({ title: 'Sucesso', description: 'Banner atualizado com sucesso.' });
      } else {
        await addDoc(collection(db, 'banners'), {
          ...bannerData,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Sucesso', description: 'Novo banner criado.' });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o banner.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageSourceType = form.watch('imageSourceType');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{banner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="targetUrl">URL de Destino</Label>
            <Input id="targetUrl" {...form.register('targetUrl')} />
            {form.formState.errors.targetUrl && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.targetUrl.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="order">Ordem de Exibição</Label>
            <Input id="order" type="number" {...form.register('order')} />
             <p className="text-xs text-muted-foreground mt-1">Menor número = maior prioridade.</p>
            {form.formState.errors.order && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.order.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={form.watch('isActive')} onCheckedChange={(checked) => form.setValue('isActive', checked)} />
            <Label htmlFor="isActive">Ativo</Label>
          </div>
          <div>
            <Label>Imagem do Banner</Label>
             <Tabs value={imageSourceType} onValueChange={(value) => form.setValue('imageSourceType', value as 'upload' | 'url')} className="w-full mt-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                 <div className="flex justify-center rounded-md border-2 border-dashed border-input px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                       {imagePreview && imageSourceType === 'upload' ? (
                            <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain"/>
                       ) : (
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                       )}
                       <div className="flex text-sm text-muted-foreground">
                          <Label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                             <span>{imagePreview && imageSourceType === 'upload' ? 'Trocar imagem' : 'Carregar uma imagem'}</span>
                             <Input id="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                          </Label>
                       </div>
                       <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP até {MAX_FILE_SIZE_MB}MB</p>
                    </div>
                 </div>
                 {form.formState.errors.imageFile && imageSourceType === 'upload' && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message}</p>
                )}
              </TabsContent>
              <TabsContent value="url" className="mt-4">
                 <div className="space-y-2">
                    <Label htmlFor="imageUrlInput">URL da Imagem</Label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Input id="imageUrlInput" placeholder="https://..." {...form.register('imageUrlInput')} onChange={handleImageUrlChange}/>
                    </div>
                    {imagePreview && imageSourceType === 'url' && (
                        <div className="mt-2 flex justify-center">
                          <img src={imagePreview} alt="Preview da URL" className="mx-auto h-24 w-auto rounded-md object-contain border p-1" />
                        </div>
                    )}
                    {form.formState.errors.imageUrlInput && imageSourceType === 'url' &&(
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrlInput.message}</p>
                    )}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

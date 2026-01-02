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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { Loader2, UploadCloud } from 'lucide-react';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const bannerSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório (mín. 3 caracteres).'),
  targetUrl: z.string().url('A URL de destino deve ser um link válido.'),
  order: z.coerce.number().min(0, 'A ordem deve ser um número positivo.'),
  isActive: z.boolean().default(true),
  image: z.custom<File | undefined>().optional(),
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
  const { firestore } = useAuth();
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
      image: undefined,
    },
  });

  useEffect(() => {
    if (banner) {
      form.reset({
        name: banner.name,
        targetUrl: banner.targetUrl,
        order: banner.order,
        isActive: banner.isActive,
        image: undefined, // Reset image input
      });
      setImagePreview(banner.imageUrl);
    } else {
      form.reset();
      setImagePreview(null);
    }
  }, [banner, form, isOpen]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O tamanho máximo da imagem é de ${MAX_FILE_SIZE_MB}MB.`,
        });
        form.setValue('image', undefined);
        return;
      }
      form.setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    if (!firestore) return;
    if (!banner && !data.image) {
      form.setError('image', { message: 'A imagem é obrigatória para um novo banner.' });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = banner?.imageUrl;
      const storage = getStorage();

      // Handle image upload if a new one is provided
      if (data.image) {
        // If editing and there was an old image, delete it
        if (banner && banner.imageUrl) {
          try {
            const oldImageRef = ref(storage, banner.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error: any) {
             if (error.code !== 'storage/object-not-found') {
                console.error("Failed to delete old image, proceeding anyway:", error);
             }
          }
        }
        
        // Upload new image
        const imagePath = `banners/${Date.now()}_${data.image.name}`;
        const newImageRef = ref(storage, imagePath);
        await uploadBytes(newImageRef, data.image);
        imageUrl = await getDownloadURL(newImageRef);
      }

      if (!imageUrl) {
          throw new Error("URL da imagem não está disponível. O upload pode ter falhado.");
      }

      const bannerData = {
        name: data.name,
        targetUrl: data.targetUrl,
        order: data.order,
        isActive: data.isActive,
        imageUrl: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (banner) {
        // Update existing banner
        const bannerRef = doc(firestore, 'banners', banner.id);
        await updateDoc(bannerRef, bannerData);
        toast({ title: 'Sucesso', description: 'Banner atualizado com sucesso.' });
      } else {
        // Create new banner
        await addDoc(collection(firestore, 'banners'), {
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
             <Label htmlFor="image">Imagem do Banner</Label>
             <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-input px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                   {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md"/>
                   ) : (
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                   )}
                   <div className="flex text-sm text-muted-foreground">
                      <Label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                         <span>{imagePreview ? 'Trocar imagem' : 'Carregar uma imagem'}</span>
                         <Input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                      </Label>
                   </div>
                   <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP até {MAX_FILE_SIZE_MB}MB</p>
                </div>
             </div>
             {form.formState.errors.image && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.image.message}</p>
            )}
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

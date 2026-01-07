
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveCameraSponsorServer } from '@/app/actions/firestore';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const mockStreamsData = [
  { id: 'stream-cwb-1', title: 'BR-376, km 594' },
  { id: 'stream-cwb-2', title: 'BR-116, km 113' },
  { id: 'stream-cwb-3', title: 'BR-277, km 82' },
  { id: 'stream-cl-1', title: 'BR-277, km 109' },
  { id: 'stream-cl-2', title: 'BR-277, km 114' },
  { id: 'stream-cl-3', title: 'BR-277, km 117' },
  { id: 'stream-cl-4', title: 'BR-277, km 120' },
  { id: 'stream-cl-5', title: 'BR-277, km 122' },
  { id: 'stream-morretes-1', title: 'BR-277, km 33' },
  { id: 'stream-morretes-2', title: 'BR-277, km 40+500' },
  { id: 'stream-pg-1', title: 'BR-376, km 494' },
  { id: 'stream-sp-1', title: 'Via Dutra (Chegada)' },
  { id: 'stream-sp-2', title: 'Via Dutra (Saída)' },
  { id: 'stream-guaratuba-1', title: 'Praia Central Vista 1' },
  { id: 'stream-guaratuba-2', title: 'Praia Central Vista 2' },
  { id: 'stream-guaratuba-3', title: 'Obra Nova Ponte 1' },
  { id: 'stream-guaratuba-4', title: 'Obra Nova Ponte 2' },
  { id: 'stream-pontal-1', title: 'Balneário Ipanema' },
  { id: 'stream-outros-1', title: 'Paraguai - Ponte da Amizade' },
];

const sponsorSchema = z.object({
  cameraId: z.string().min(1, 'A câmera é obrigatória.'),
  linkDestino: z.string().url('A URL de destino deve ser um link válido.'),
  isActive: z.boolean().default(true),
  imageSourceType: z.enum(['upload', 'url']).default('upload'),
  imageFile: z.custom<File | undefined>().optional(),
  sponsorImageUrl: z.string().optional(),
}).refine(data => {
  if (data.imageSourceType === 'url') {
    return !!data.sponsorImageUrl && z.string().url().safeParse(data.sponsorImageUrl).success;
  }
  return true;
}, {
  message: 'Por favor, insira uma URL de imagem válida.',
  path: ['sponsorImageUrl'],
}).refine(data => {
    if (data.imageSourceType === 'upload') return data.imageFile instanceof File;
    if (data.imageSourceType === 'url') return !!data.sponsorImageUrl;
    return true;
}, {
  message: 'Uma imagem (upload ou URL) é obrigatória para um novo patrocínio.',
  path: ['imageFile'],
});


type SponsorFormValues = z.infer<typeof sponsorSchema>;

export interface Sponsor {
  id: string;
  cameraId: string;
  sponsorImageUrl: string;
  linkDestino: string;
  isActive: boolean;
}

interface SponsorFormProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor?: Sponsor | null;
}

const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Substituir caracteres especiais por _
    .replace(/\s+/g, '_'); // Substituir espaços por _
};

export function SponsorForm({ isOpen, onClose, sponsor }: SponsorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      cameraId: '',
      linkDestino: '',
      isActive: true,
      imageSourceType: 'upload',
      imageFile: undefined,
      sponsorImageUrl: '',
    },
  });

  useEffect(() => {
    if (sponsor) {
      form.reset({
        cameraId: sponsor.cameraId,
        linkDestino: sponsor.linkDestino,
        isActive: sponsor.isActive,
        imageSourceType: 'url',
        imageFile: undefined,
        sponsorImageUrl: sponsor.sponsorImageUrl,
      });
      setImagePreview(sponsor.sponsorImageUrl);
    } else {
      form.reset({
        cameraId: '',
        linkDestino: '',
        isActive: true,
        imageSourceType: 'upload',
        imageFile: undefined,
        sponsorImageUrl: '',
      });
      setImagePreview(null);
    }
  }, [sponsor, form, isOpen]);

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: 'destructive', title: 'Arquivo muito grande', description: `O tamanho máximo da imagem é de ${MAX_FILE_SIZE_MB}MB.` });
        form.setValue('imageFile', undefined);
        return;
      }
      form.setValue('imageFile', file);
      form.setValue('sponsorImageUrl', '');
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('sponsorImageUrl', url);
    if (z.string().url().safeParse(url).success) {
        setImagePreview(url);
        form.setValue('imageFile', undefined);
    } else {
        setImagePreview(null);
    }
  }

  const onSubmit = async (data: SponsorFormValues) => {
    if (!sponsor && !data.imageFile && !data.sponsorImageUrl) {
        form.setError('imageFile', { message: 'A imagem é obrigatória.' });
        return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = sponsor?.sponsorImageUrl;
      const storage = getStorage();

      if (data.imageSourceType === 'upload' && data.imageFile) {
        if (sponsor?.sponsorImageUrl && sponsor.sponsorImageUrl.includes('firebasestorage')) {
          try { await deleteObject(ref(storage, sponsor.sponsorImageUrl)); } catch (e) {
            if ((e as any).code !== 'storage/object-not-found') {
              console.warn("Could not delete old sponsor image:", e);
            }
          }
        }
        
        const sanitizedName = sanitizeFileName(data.imageFile.name);
        const imagePath = `sponsors/${Date.now()}_${sanitizedName}`;
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, data.imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      } else if (data.imageSourceType === 'url' && data.sponsorImageUrl) {
        finalImageUrl = data.sponsorImageUrl;
      }
      
      if (!finalImageUrl) {
          throw new Error("URL da imagem não está disponível.");
      }

      const sponsorDataToSave = {
        cameraId: data.cameraId,
        sponsorImageUrl: finalImageUrl,
        linkDestino: data.linkDestino,
        isActive: data.isActive,
      };

      const result = await saveCameraSponsorServer(sponsorDataToSave, sponsor?.id || null);

      if (result.success) {
        toast({ title: 'Sucesso', description: `Patrocínio ${sponsor ? 'atualizado' : 'criado'}.` });
        onClose();
      } else {
        throw new Error(result.error || 'Ocorreu um erro desconhecido no servidor.');
      }

    } catch (error: any) {
      console.error('Error saving sponsor:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageSourceType = form.watch('imageSourceType');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{sponsor ? 'Editar Patrocínio' : 'Novo Patrocínio'}</DialogTitle>
          <DialogDescription>
            Associe um patrocinador a uma câmera específica.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="cameraId">Câmera</Label>
            <Controller
                name="cameraId"
                control={form.control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <SelectTrigger id="cameraId" className="w-full mt-1">
                            <SelectValue placeholder="Selecione uma câmera..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mockStreamsData.map(stream => (
                                <SelectItem key={stream.id} value={stream.id}>
                                    {stream.title} ({stream.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
            {form.formState.errors.cameraId && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.cameraId.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="linkDestino">URL de Destino</Label>
            <Input id="linkDestino" {...form.register('linkDestino')} />
            {form.formState.errors.linkDestino && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.linkDestino.message}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={form.watch('isActive')} onCheckedChange={(checked) => form.setValue('isActive', checked)} />
            <Label htmlFor="isActive">Ativo</Label>
          </div>
          <div>
            <Label>Logo do Patrocinador</Label>
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
                             <span>{imagePreview && imageSourceType === 'upload' ? 'Trocar logo' : 'Carregar um logo'}</span>
                             <Input id="image-upload" type="file" className="sr-only" onChange={handleImageFileChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                          </Label>
                       </div>
                       <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP até ${MAX_FILE_SIZE_MB}MB</p>
                    </div>
                 </div>
                 {form.formState.errors.imageFile && imageSourceType === 'upload' && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message}</p>
                )}
              </TabsContent>
              <TabsContent value="url" className="mt-4">
                 <div className="space-y-2">
                    <Label htmlFor="sponsorImageUrl">URL do Logo</Label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Input id="sponsorImageUrl" placeholder="https://..." {...form.register('sponsorImageUrl')} onChange={handleImageUrlChange}/>
                    </div>
                    {imagePreview && imageSourceType === 'url' && (
                        <div className="mt-2 flex justify-center">
                          <img src={imagePreview} alt="Preview da URL" className="mx-auto h-24 w-auto rounded-md object-contain border p-1" />
                        </div>
                    )}
                    {form.formState.errors.sponsorImageUrl && imageSourceType === 'url' &&(
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.sponsorImageUrl.message}</p>
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

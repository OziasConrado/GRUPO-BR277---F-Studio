'use client';

import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Edit, ArrowLeft, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const profileSchema = z.object({
  displayName: z.string().min(3, 'O nome ou apelido deve ter pelo menos 3 caracteres.').max(50, 'O nome deve ter no máximo 50 caracteres.'),
  location: z.string().min(3, 'A cidade ou município é obrigatório.').max(50, 'A cidade deve ter no máximo 50 caracteres.'),
  newPhotoFile: z.custom<File | undefined>()
    .refine(file => file === undefined || file.size <= MAX_FILE_SIZE_BYTES, `Foto deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`)
    .refine(file => file === undefined || ["image/jpeg", "image/png", "image/webp"].includes(file.type), "Formato de foto inválido (JPG, PNG, WebP).")
    .optional(),
  bio: z.string().max(160, 'A biografia não pode ter mais de 160 caracteres.').optional(),
  instagramUsername: z.string().max(30, 'Usuário do Instagram muito longo.').optional().refine(val => !val || !val.startsWith('@'), {
    message: "Não inclua o '@' no nome de usuário."
  }).refine(val => !val || /^[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/.test(val), {
    message: "Nome de usuário do Instagram inválido."
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { currentUser, userProfile, updateUserProfile, loading, authAction, signOutUser, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      location: '',
      newPhotoFile: undefined,
      bio: '',
      instagramUsername: '',
    },
  });

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
    if (currentUser) {
      reset({
        displayName: currentUser.displayName || '',
        location: userProfile?.location || '',
        bio: userProfile?.bio || '',
        instagramUsername: userProfile?.instagramUsername || '',
        newPhotoFile: undefined,
      });
      setImagePreview(currentUser.photoURL || null);
    }
  }, [currentUser, userProfile, loading, router, reset]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo da foto: ${MAX_FILE_SIZE_MB}MB.`});
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast({ variant: "destructive", title: "Erro na Imagem", description: "Formato de foto inválido (aceito: JPG, PNG, WebP)."});
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setValue("newPhotoFile", file, { shouldValidate: true, shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!isDirty) {
      toast({ title: "Nenhuma Alteração", description: "Nenhuma informação foi alterada." });
      return;
    }
    await updateUserProfile(data);
    reset(data, { keepValues: true, keepDirty: false, keepDefaultValues: false, keepErrors: false });
  };

  if (loading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <Edit className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold font-headline">Editar Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={imagePreview || undefined} alt={currentUser.displayName || 'User Avatar'} />
                  <AvatarFallback className="text-4xl">
                    {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : <UserCircle className="h-20 w-20 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-full">
                <UploadCloud className="mr-2 h-4 w-4" />
                Alterar Foto
              </Button>
              <Input
                id="newPhotoFile"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              {errors.newPhotoFile && <p className="text-sm text-destructive text-center">{errors.newPhotoFile.message}</p>}
            </div>

            <div>
              <Label htmlFor="displayName">Nome ou Apelido <span className="text-destructive">*</span></Label>
              <Input
                id="displayName"
                {...register('displayName')}
                className="mt-1 rounded-lg"
              />
              {errors.displayName && <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>}
            </div>

            <div>
              <Label htmlFor="location">Cidade ou Município <span className="text-destructive">*</span></Label>
              <Input
                id="location"
                {...register('location')}
                className="mt-1 rounded-lg"
                placeholder="Ex: Curitiba, PR"
              />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                className="mt-1 rounded-lg min-h-[80px]"
                maxLength={160}
                placeholder="Fale um pouco sobre você..."
              />
              {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>}
            </div>

            <div>
              <Label htmlFor="instagramUsername">Usuário do Instagram (sem @)</Label>
              <Input
                id="instagramUsername"
                {...register('instagramUsername')}
                className="mt-1 rounded-lg"
                 placeholder="seu_usuario"
              />
              {errors.instagramUsername && <p className="text-sm text-destructive mt-1">{errors.instagramUsername.message}</p>}
            </div>


            <div>
              <Label htmlFor="email">E-mail (não editável)</Label>
              <Input
                id="email"
                type="email"
                value={currentUser.email || ''}
                disabled
                className="mt-1 rounded-lg bg-muted/50 cursor-not-allowed"
              />
            </div>

            <Button type="submit" className="w-full rounded-full py-3 text-base" disabled={authAction !== null || !isDirty}>
              {authAction === 'update' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pt-6">
          <Button variant="outline" onClick={() => router.back()} className="w-full max-w-xs rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
           <Button variant="link" onClick={signOutUser} className="text-destructive hover:text-destructive/80" disabled={authAction !== null}>
            Sair da Conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

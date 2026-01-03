<<<<<<< HEAD
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Loader2, Image as ImageIcon, ExternalLink, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BannerForm } from './_components/banner-form';
import type { Banner } from './_components/banner-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getStorage, ref, deleteObject } from "firebase/storage";

export default function AdminBannersPage() {
  const { firestore } = useAuth();
  const { toast } = useToast();
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const bannersQuery = query(collection(firestore, 'banners'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(bannersQuery, (snapshot) => {
      const fetchedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
      setBanners(fetchedBanners);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching banners:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar banners' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedBanner(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (banner: Banner) => {
    setBannerToDelete(banner);
    setIsDeleteAlertOpen(true);
  };

  const executeDelete = async () => {
    if (!bannerToDelete || !firestore) return;

    try {
      // 1. Delete image from Storage
      if (bannerToDelete.imageUrl) {
        const storage = getStorage();
        // Create a reference from the full URL
        const imageRef = ref(storage, bannerToDelete.imageUrl);
        await deleteObject(imageRef);
      }
      
      // 2. Delete document from Firestore
      await deleteDoc(doc(firestore, 'banners', bannerToDelete.id));

      toast({ title: 'Sucesso', description: 'Banner excluído com sucesso.' });
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } finally {
      setBannerToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-headline">Gerenciar Banners</h1>
              <p className="text-muted-foreground text-sm">Adicione, edite ou remova os banners do site.</p>
            </div>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Banner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Banners Atuais</CardTitle>
            <CardDescription>Lista de todos os banners cadastrados, ordenados por prioridade.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : banners.length > 0 ? (
              <div className="space-y-4">
                {banners.map(banner => (
                  <div key={banner.id} className="flex items-center gap-4 rounded-md border p-3">
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      className="h-16 w-32 object-cover rounded-md bg-muted"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{banner.name} <span className="text-xs text-muted-foreground font-normal">(Ordem: {banner.order})</span></p>
                      <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1 truncate">
                        <ExternalLink className="h-3 w-3" /> {banner.targetUrl}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                          {banner.isActive ? (
                              <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Ativo</span>
                          ) : (
                               <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3"/> Inativo</span>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(banner)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhum banner cadastrado ainda. Clique em "Novo Banner" para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BannerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        banner={selectedBanner}
      />
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir o banner "{bannerToDelete?.name}"? Esta ação é irreversível e também removerá a imagem associada.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
=======

'use client';

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon, Link as LinkIcon, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    createdAt: any;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AdminBannersPage() {
    const { firestore, uploadFile } = useAuth();
    const { toast } = useToast();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const bannersCollection = collection(firestore, 'banners');
        const q = query(bannersCollection, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
            setBanners(fetchedBanners);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching banners: ", error);
            toast({ variant: 'destructive', title: 'Erro ao Carregar', description: 'Não foi possível buscar os banners.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, toast]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLink('');
        setImageUrl('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast({ variant: "destructive", title: "Erro na Imagem", description: `Tamanho máximo da foto: ${MAX_FILE_SIZE_MB}MB.` });
                if(fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || !uploadFile) return;

        const finalImageUrl = activeTab === 'url' ? imageUrl : '';
        if (!title || (!imageFile && !finalImageUrl)) {
            toast({ variant: 'destructive', title: 'Campos Obrigatórios', description: 'Título e imagem (via upload ou URL) são necessários.' });
            return;
        }
        setIsSubmitting(true);
        try {
            let uploadedUrl = finalImageUrl;
            if (activeTab === 'upload' && imageFile) {
                const filePath = `banners/${Date.now()}_${imageFile.name}`;
                uploadedUrl = await uploadFile(imageFile, filePath);
            }

            if (!uploadedUrl) {
                throw new Error("A URL da imagem não pôde ser gerada.");
            }

            await addDoc(collection(firestore, 'banners'), {
                title,
                description,
                link,
                imageUrl: uploadedUrl,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Sucesso', description: 'Banner adicionado.' });
            resetForm();
        } catch (error: any) {
            console.error("Error adding banner:", error);
            toast({ variant: 'destructive', title: 'Erro ao Adicionar', description: error.message || 'Não foi possível salvar o banner.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        if (confirm('Tem certeza que deseja excluir este banner?')) {
            try {
                await deleteDoc(doc(firestore, 'banners', id));
                toast({ title: 'Sucesso', description: 'Banner excluído.' });
            } catch (error) {
                console.error("Error deleting banner:", error);
                toast({ variant: 'destructive', title: 'Erro ao Excluir', description: 'Não foi possível excluir o banner.' });
            }
        }
    };

    return (
        <div className="w-full space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">Gerenciar Banners</h1>
                <p className="text-muted-foreground">Adicione ou remova banners de publicidade.</p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Adicionar Novo Banner</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" />Fazer Upload</TabsTrigger>
                                <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" />Usar URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="pt-4">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Clique para enviar uma imagem"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-input hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-colors"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-full p-1">
                                            <Image src={imagePreview} alt="Preview do banner" fill style={{ objectFit: 'contain' }} className="rounded" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 z-10 rounded-full"
                                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <span className="text-muted-foreground text-sm mt-1">Clique para enviar uma imagem</span>
                                            <span className="text-xs text-muted-foreground/80 mt-0.5">PNG, JPG, WebP (Máx {MAX_FILE_SIZE_MB}MB)</span>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                            </TabsContent>
                            <TabsContent value="url" className="pt-4">
                                <Label htmlFor="imageUrl">URL da Imagem</Label>
                                <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemplo.com/imagem.png" />
                                {imageUrl && <Image src={imageUrl} alt="Preview da URL" width={200} height={100} className="mt-2 rounded-md object-contain border" />}
                            </TabsContent>
                        </Tabs>

                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="description">Descrição (opcional)</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="link">Link de Destino (opcional)</Label>
                            <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://destino.com.br" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar Banner'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-4">Banners Atuais</h2>
                {loading ? (
                    <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : banners.length === 0 ? (
                    <p className="text-center text-muted-foreground">Nenhum banner cadastrado.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {banners.map(banner => (
                            <Card key={banner.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="truncate">{banner.title}</CardTitle>
                                    <CardDescription className="truncate">{banner.description || 'Sem descrição'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <Image src={banner.imageUrl} alt={banner.title} width={300} height={150} className="rounded-md object-cover w-full aspect-video" />
                                    {banner.link && <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block mt-2">{banner.link}</a>}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

>>>>>>> 0538a4f5ad6dbfd4d734ab1f85ddcbef9397e196

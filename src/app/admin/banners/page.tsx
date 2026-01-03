
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
      // Handle cases where the image might not exist in storage anymore
      if (error.code === 'storage/object-not-found') {
        try {
            await deleteDoc(doc(firestore, 'banners', bannerToDelete.id));
            toast({ title: 'Sucesso', description: 'Banner excluído. A imagem associada não foi encontrada no armazenamento, mas o registro foi removido.' });
        } catch (dbError: any) {
            toast({ variant: 'destructive', title: 'Erro ao excluir do banco de dados', description: dbError.message });
        }
      } else {
        toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
      }
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

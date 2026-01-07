
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Shield, Loader2, ExternalLink, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
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
import { fetchAllBannersServer, deleteBannerServer } from '@/app/actions/firestore';

export default function AdminBannersPage() {
  const { toast } = useToast();
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const result = await fetchAllBannersServer();
    if (result.success) {
      setBanners(result.data);
    } else {
      toast({ variant: 'destructive', title: 'Erro ao buscar banners', description: result.error });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedBanner(null);
    fetchBanners(); // Re-fetch banners after form closes
  }

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
    if (!bannerToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Delete image from Storage if it's a Firebase URL
      if (bannerToDelete.imageUrl && bannerToDelete.imageUrl.includes('firebasestorage')) {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, bannerToDelete.imageUrl);
            await deleteObject(imageRef);
        } catch (storageError: any) {
            // If the object doesn't exist, we can ignore it and proceed.
            if (storageError.code !== 'storage/object-not-found') {
                throw storageError; // Re-throw other storage errors
            }
            console.warn("Imagem do banner não encontrada no Storage, prosseguindo com a exclusão do registro.");
        }
      }
      
      // 2. Delete document from Firestore via Server Action
      const result = await deleteBannerServer(bannerToDelete.id);
      if (!result.success) {
        throw new Error(result.error || 'Falha ao deletar o registro do banner.');
      }

      toast({ title: 'Sucesso', description: 'Banner excluído com sucesso.' });
      fetchBanners(); // Re-fetch after delete
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } finally {
      setBannerToDelete(null);
      setIsDeleteAlertOpen(false);
      setIsDeleting(false);
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
                    <div className="flex-grow min-w-0">
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
        onClose={handleFormClose}
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
                <AlertDialogAction onClick={executeDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

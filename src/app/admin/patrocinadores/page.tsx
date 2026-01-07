
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Handshake, Loader2, ExternalLink, CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { SponsorForm, type Sponsor } from './_components/sponsor-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { fetchAllCameraSponsorsServer, deleteCameraSponsorServer } from '@/app/actions/firestore';

export default function AdminSponsorsPage() {
  const { toast } = useToast();
  
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    const result = await fetchAllCameraSponsorsServer();
    if (result.success) {
      setSponsors(result.data);
    } else {
      toast({ variant: 'destructive', title: 'Erro ao buscar patrocinadores', description: result.error });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSponsor(null);
    fetchSponsors();
  }

  const handleEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedSponsor(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (sponsor: Sponsor) => {
    setSponsorToDelete(sponsor);
    setIsDeleteAlertOpen(true);
  };

  const executeDelete = async () => {
    if (!sponsorToDelete) return;
    setIsDeleting(true);

    try {
      if (sponsorToDelete.sponsorImageUrl && sponsorToDelete.sponsorImageUrl.includes('firebasestorage')) {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, sponsorToDelete.sponsorImageUrl);
            await deleteObject(imageRef);
        } catch (storageError: any) {
            if (storageError.code !== 'storage/object-not-found') throw storageError;
            console.warn("Imagem do patrocinador não encontrada no Storage.");
        }
      }
      
      const result = await deleteCameraSponsorServer(sponsorToDelete.id);
      if (!result.success) {
        throw new Error(result.error || 'Falha ao deletar o registro do patrocinador.');
      }

      toast({ title: 'Sucesso', description: 'Patrocinador excluído com sucesso.' });
      fetchSponsors();
    } catch (error: any) {
      console.error("Error deleting sponsor:", error);
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } finally {
      setSponsorToDelete(null);
      setIsDeleteAlertOpen(false);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-headline">Gerenciar Patrocinadores</h1>
              <p className="text-muted-foreground text-sm">Adicione ou edite os patrocinadores das câmeras.</p>
            </div>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Patrocinador
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patrocinadores Atuais</CardTitle>
            <CardDescription>Lista de todos os patrocínios cadastrados.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sponsors.length > 0 ? (
              <div className="space-y-4">
                {sponsors.map(sponsor => (
                  <div key={sponsor.id} className="flex items-center gap-4 rounded-md border p-3">
                    <img
                      src={sponsor.sponsorImageUrl}
                      alt={`Logo para ${sponsor.cameraId}`}
                      className="h-16 w-32 object-contain rounded-md bg-muted"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold truncate">Câmera: {sponsor.cameraId}</p>
                      <a href={sponsor.linkDestino} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1 truncate">
                        <ExternalLink className="h-3 w-3" /> {sponsor.linkDestino}
                      </a>
                       <div className="flex items-center gap-2 mt-1">
                          {sponsor.isActive ? (
                              <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> Ativo</span>
                          ) : (
                               <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3"/> Inativo</span>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(sponsor)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(sponsor)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhum patrocínio cadastrado. Clique em "Novo Patrocinador" para começar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <SponsorForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        sponsor={selectedSponsor}
      />
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir este patrocínio? Esta ação é irreversível e removerá a imagem associada.
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

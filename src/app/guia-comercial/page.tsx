
'use client';

import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, Frown } from 'lucide-react';
import type { BusinessData, BusinessCategory } from '@/types/guia-comercial';
import { businessCategories } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import SauFilters from '@/components/sau/sau-filters'; // Reutilizando o componente de filtro
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);


export default function GuiaComercialListPage() {
  const { firestore } = useAuth();
  const { toast } = useToast();
  
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | 'Todas'>('Todas');

  useEffect(() => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível carregar os estabelecimentos.' });
      setLoading(false);
      return;
    }

    setLoading(true);
    const businessesCollection = collection(firestore, 'businesses');
    // Filtro para mostrar apenas negócios com pagamento ATIVO
    const q = query(businessesCollection, where('statusPagamento', '==', 'ATIVO'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBusinesses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Garante que os timestamps sejam convertidos para ISO string se necessário
          dataInicio: data.dataInicio instanceof Timestamp ? data.dataInicio.toDate().toISOString() : data.dataInicio,
          dataExpiracao: data.dataExpiracao instanceof Timestamp ? data.dataExpiracao.toDate().toISOString() : data.dataExpiracao,
        } as BusinessData;
      });
      setBusinesses(fetchedBusinesses);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching businesses:", error);
      toast({ variant: 'destructive', title: 'Erro ao Carregar', description: 'Não foi possível buscar os estabelecimentos.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);
  
  const filteredBusinesses = useMemo(() => {
    return businesses
      .filter(business =>
        activeCategory === 'Todas' || business.category === activeCategory
      )
      .filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [businesses, searchTerm, activeCategory]);

  const categoriesForFilter = ['Todos', ...businessCategories];

  return (
    <div className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold mb-2 font-headline">Guia Comercial</h1>
        <p className="text-muted-foreground">Encontre os melhores estabelecimentos na sua rota.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-full h-11 bg-card/70"
          />
        </div>
        <Button asChild size="lg" className="rounded-full h-11 text-base">
          <Link href="/planos">
            <PlusCircle className="mr-2 h-5 w-5" />
            Anuncie seu Negócio
          </Link>
        </Button>
      </div>

      <SauFilters
          concessionaires={categoriesForFilter}
          currentFilter={activeCategory}
          onFilterChange={(filter) => setActiveCategory(filter as BusinessCategory | 'Todas')}
        />
        
      <AdPlaceholder />

      {loading ? (
        <Alert>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <AlertTitle className="font-headline">Carregando Estabelecimentos...</AlertTitle>
            <AlertDescription>Buscando os melhores locais para você.</AlertDescription>
        </Alert>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business, index) => (
             <React.Fragment key={business.id}>
                <BusinessCard business={business} />
                {(index + 1) % 5 === 0 && <AdPlaceholder />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 rounded-lg bg-muted/30 border border-dashed">
            <Frown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">Nenhum Resultado Encontrado</h3>
            <p className="text-muted-foreground text-sm mt-1">
                Tente ajustar sua busca ou filtro. Em breve teremos mais estabelecimentos!
            </p>
        </div>
      )}
    </div>
  );
}

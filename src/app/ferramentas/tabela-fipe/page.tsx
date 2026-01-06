
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CarFront, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription as ShadcnAlertDescription } from "@/components/ui/alert";

interface FipeOption {
  nome: string;
  codigo: string;
}

interface FipeResult {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
}

export default function TabelaFipePage() {
  const [vehicleType, setVehicleType] = useState<string>('');
  const [brands, setBrands] = useState<FipeOption[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [models, setModels] = useState<FipeOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [years, setYears] = useState<FipeOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [result, setResult] = useState<FipeResult | null>(null);
  
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);

  const { toast } = useToast();
  const API_BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

  const resetSelections = (level: 'type' | 'brand' | 'model' | 'year') => {
    setResult(null);
    if (level === 'type') {
      setBrands([]);
      setSelectedBrand('');
    }
    if (level === 'type' || level === 'brand') {
      setModels([]);
      setSelectedModel('');
    }
    if (level === 'type' || level === 'brand' || level === 'model') {
      setYears([]);
      setSelectedYear('');
    }
  };

  useEffect(() => {
    if (vehicleType) {
      resetSelections('type');
      setLoadingBrands(true);
      fetch(`${API_BASE_URL}/${vehicleType}/marcas`)
        .then(res => res.json())
        .then(data => setBrands(data))
        .catch(() => toast({ variant: 'destructive', title: 'Erro de API', description: 'Não foi possível buscar as marcas.' }))
        .finally(() => setLoadingBrands(false));
    }
  }, [vehicleType, toast]);

  useEffect(() => {
    if (selectedBrand) {
      resetSelections('brand');
      setLoadingModels(true);
      fetch(`${API_BASE_URL}/${vehicleType}/marcas/${selectedBrand}/modelos`)
        .then(res => res.json())
        .then(data => setModels(data.modelos))
        .catch(() => toast({ variant: 'destructive', title: 'Erro de API', description: 'Não foi possível buscar os modelos.' }))
        .finally(() => setLoadingModels(false));
    }
  }, [selectedBrand, vehicleType, toast]);

  useEffect(() => {
    if (selectedModel) {
      resetSelections('model');
      setLoadingYears(true);
      fetch(`${API_BASE_URL}/${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos`)
        .then(res => res.json())
        .then(setYears)
        .catch(() => toast({ variant: 'destructive', title: 'Erro de API', description: 'Não foi possível buscar os anos.' }))
        .finally(() => setLoadingYears(false));
    }
  }, [selectedModel, selectedBrand, vehicleType, toast]);
  
  useEffect(() => {
    if (selectedYear) {
      setResult(null);
      setLoadingResult(true);
      fetch(`${API_BASE_URL}/${vehicleType}/marcas/${selectedBrand}/modelos/${selectedModel}/anos/${selectedYear}`)
        .then(res => res.json())
        .then(setResult)
        .catch(() => toast({ variant: 'destructive', title: 'Erro de API', description: 'Não foi possível buscar o valor do veículo.' }))
        .finally(() => setLoadingResult(false));
    }
  }, [selectedYear, selectedModel, selectedBrand, vehicleType, toast]);


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Link href="/ferramentas" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Ferramentas
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CarFront className="w-7 h-7 text-primary" />
            <CardTitle className="font-headline text-xl sm:text-2xl">Consulta Tabela FIPE</CardTitle>
          </div>
          <CardDescription>Consulte o valor de mercado do seu veículo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vehicle-type">Tipo de Veículo</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger id="vehicle-type" className="w-full rounded-lg mt-1">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carros">Carros</SelectItem>
                <SelectItem value="motos">Motos</SelectItem>
                <SelectItem value="caminhoes">Caminhões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {vehicleType && (
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={loadingBrands || brands.length === 0}>
                <SelectTrigger id="brand" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder={loadingBrands ? "Carregando marcas..." : "Selecione a marca..."} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => <SelectItem key={brand.codigo} value={brand.codigo}>{brand.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedBrand && (
            <div>
              <Label htmlFor="model">Modelo</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loadingModels || models.length === 0}>
                <SelectTrigger id="model" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder={loadingModels ? "Carregando modelos..." : "Selecione o modelo..."} />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => <SelectItem key={model.codigo} value={model.codigo}>{model.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedModel && (
             <div>
              <Label htmlFor="year">Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear} disabled={loadingYears || years.length === 0}>
                <SelectTrigger id="year" className="w-full rounded-lg mt-1">
                  <SelectValue placeholder={loadingYears ? "Carregando anos..." : "Selecione o ano..."} />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => <SelectItem key={year.codigo} value={year.codigo}>{year.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {loadingResult && (
            <div className="flex items-center justify-center pt-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Consultando valor...</p>
            </div>
          )}

          {result && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Resultado da Consulta</h3>
              <Alert className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                <CarFront className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-300">Valor Estimado (FIPE)</AlertTitle>
                <ShadcnAlertDescription>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 my-2">{result.Valor}</p>
                    <p className="text-sm font-medium">{result.Marca} {result.Modelo}</p>
                    <p className="text-xs">{result.AnoModelo}, Combustível: {result.Combustivel}</p>
                    <p className="text-xs mt-1">Mês de Referência: {result.MesReferencia}</p>
                </ShadcnAlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

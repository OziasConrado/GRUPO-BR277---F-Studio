
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react'; // Import React for React.Fragment
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, AlertTriangle, Info, Phone, Globe } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SauLocationCard from '@/components/sau/sau-location-card';
import SauFilters from '@/components/sau/sau-filters';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const concessionairesForFilter = [
  "Todos",
  "Via Araucária",
  "EPR Litoral Pioneiro",
  "EPR Iguaçu",
  "CCR PRVias",
  "Arteris Litoral Sul",
  "Arteris Planalto Sul",
  "Arteris Régis Bitencourt",
  "CCR RioSP",
];

const concessionaireContacts = [
  {
    name: 'Via Araucária',
    highways: 'BRs 277 Centro-Sul e Campos Gerais, 373, 376 e 476. PRs 418, 423 e 427',
    phone: '0800 277 0376',
    website: 'https://viaaraucaria.com.br/',
    color: '#273896',
    textColor: '#FFFFFF',
  },
  {
    name: 'EPR Litoral Pioneiro',
    highways: 'BRs 153, 277 (Curitiba-Paranaguá) e 369. PRs 092, 151, 239, 407, 408, 411, 508, 804 e 855',
    phone: '0800 277 0153',
    website: 'https://eprlpioneiro.com.br/',
    color: '#012F57',
    textColor: '#FFFFFF',
  },
  {
    name: 'EPR Iguaçu',
    highways: 'BR-277, BR-163, PR-182, PR-483, PR-180, PR-280, e PR-158',
    phone: '0800 277 0163',
    website: 'https://epriguacu.com.br/',
    color: '#012F57',
    textColor: '#FFFFFF',
  },
  {
    name: 'Arteris Planalto Sul',
    highways: 'BR-116/PR-SC',
    phone: '0800 6420 116',
    phone2: '0800 7171 000',
    website: 'https://www.arteris.com.br/nossas-rodovias/planalto-sul/apresentacao/',
    color: '#FFB000',
    textColor: '#333333',
  },
  {
    name: 'Arteris Régis Bittencourt',
    highways: 'BR-116/SP-PR',
    phone: '0800 7090 116',
    phone2: '0800 7171 000',
    website: 'https://www.arteris.com.br/nossas-rodovias/regis-bittencourt/apresentacao/',
    color: '#FFB000',
    textColor: '#333333',
  },
  {
    name: 'Arteris Litoral Sul',
    highways: 'BRs 116/PR, 376/PR e 101/SC',
    phone: '0800 7251 771',
    phone2: '0800 7171 000',
    website: 'https://www.arteris.com.br/nossas-rodovias/litoral-sul/apresentacao/',
    color: '#FFB000',
    textColor: '#333333',
  },
  {
    name: 'CCR PRVias',
    highways: 'BR-369, BR-373, BR-376, PR-090, PR-170, PR-323 e PR-445',
    phone: '0800 376 0000',
    website: 'https://rodovias.motiva.com.br/prvias/',
    color: '#822121',
    textColor: '#FFFFFF',
  },
  {
    name: 'CCR RioSP',
    highways: 'BR-116/RJ-SP',
    phone: '0800 0173 536',
    phone2: '(11) 2795-2238',
    website: 'https://www.ccrriosp.com.br/mobile/#!/services',
    color: '#822121',
    textColor: '#FFFFFF',
  },
];

const allSausData: SAULocation[] = [
  // Via Araucária
  { id: 'via-araucaria-1', concessionaire: 'Via Araucária', name: 'BR-277, km 108,80', address: 'Curitiba/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.485, longitude: -49.385 },
  { id: 'via-araucaria-2', concessionaire: 'Via Araucária', name: 'BR-277, km 165,70', address: 'Porto Amazonas/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.541, longitude: -49.897 },
  { id: 'via-araucaria-3', concessionaire: 'Via Araucária', name: 'BR-277, km 211,70', address: 'Palmeira/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.419, longitude: -50.231 },
  { id: 'via-araucaria-4', concessionaire: 'Via Araucária', name: 'BR-277, km 256,10', address: 'Irati/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.474, longitude: -50.627 },
  { id: 'via-araucaria-5', concessionaire: 'Via Araucária', name: 'BR-277, km 300,30', address: 'Prudentópolis/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.309, longitude: -51.002 },
  { id: 'via-araucaria-6', concessionaire: 'Via Araucária', name: 'BR-373, km 240,40', address: 'Guamiranga/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.215, longitude: -50.785 },
  { id: 'via-araucaria-7', concessionaire: 'Via Araucária', name: 'BR-373, km 201,80', address: 'Ipiranga/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.004, longitude: -50.593 },
  { id: 'via-araucaria-8', concessionaire: 'Via Araucária', name: 'PR-423, km 15,00', address: 'Araucária/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.568, longitude: -49.431 },
  { id: 'via-araucaria-9', concessionaire: 'Via Araucária', name: 'BR-476, km 188,30', address: 'Lapa/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.820, longitude: -49.849 },

  // EPR Litoral Pioneiro
  { id: 'epr-litoral-1', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-369 Km 68,2', address: 'Santa Mariana/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.159, longitude: -50.626 },
  { id: 'epr-litoral-2', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-369 Km 10', address: 'Cambará/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.053, longitude: -50.143 },
  { id: 'epr-litoral-3', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-153 Km 31,4', address: 'Santo Antônio da Platina/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.235, longitude: -50.082 },
  { id: 'epr-litoral-4', concessionaire: 'EPR Litoral Pioneiro', name: 'PR-092 Km 300,4', address: 'Quatiguá/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.559, longitude: -50.106 },
  { id: 'epr-litoral-5', concessionaire: 'EPR Litoral Pioneiro', name: 'PR-092 Km 255,3', address: 'Wenceslau Braz/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.864, longitude: -49.821 },
  { id: 'epr-litoral-6', concessionaire: 'EPR Litoral Pioneiro', name: 'PR-092 Km 217', address: 'Arapoti/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.116, longitude: -49.805 },
  { id: 'epr-litoral-7', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-153 Km 187,4', address: 'Sengés/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.103, longitude: -49.529 },
  { id: 'epr-litoral-8', concessionaire: 'EPR Litoral Pioneiro', name: 'PR-151 Km 252,8', address: 'Piraí do Sul/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.588, longitude: -49.919 },
  { id: 'epr-litoral-9', concessionaire: 'EPR Litoral Pioneiro', name: 'PR-151 Km 305,2', address: 'Carambeí/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.908, longitude: -50.117 },
  { id: 'epr-litoral-10', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-277 Km 60,6', address: 'São José dos Pinhais/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.567, longitude: -49.034 },
  { id: 'epr-litoral-11', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-277 Km 10,7', address: 'Paranaguá/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.526, longitude: -48.601 },
  { id: 'epr-litoral-12', concessionaire: 'EPR Litoral Pioneiro', name: 'BR-277 Km 35', address: 'Morretes/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.539, longitude: -48.835 },
  
  // EPR Iguaçu
  { id: 'epr-iguacu-1', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 310', address: 'Prudentópolis/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.263, longitude: -51.080 },
  { id: 'epr-iguacu-2', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 381', address: 'Candói/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.602, longitude: -51.688 },
  { id: 'epr-iguacu-3', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 454', address: 'Laranjeiras do Sul/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.426, longitude: -52.366 },
  { id: 'epr-iguacu-4', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 519', address: 'Guaraniaçu/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.109, longitude: -52.868 },
  { id: 'epr-iguacu-5', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 574', address: 'Cascavel/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.001, longitude: -53.361 },
  { id: 'epr-iguacu-6', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 664', address: 'Matelândia/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.275, longitude: -53.987 },
  { id: 'epr-iguacu-7', concessionaire: 'EPR Iguaçu', name: 'BR-277, km 711', address: 'Santa Terezinha de Itaipu/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.441, longitude: -54.496 },
  { id: 'epr-iguacu-8', concessionaire: 'EPR Iguaçu', name: 'PR-180, km 177', address: 'Lindoeste/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.176, longitude: -53.491 },
  { id: 'epr-iguacu-9', concessionaire: 'EPR Iguaçu', name: 'PR-182, km 128', address: 'Marmelândia/PR (Realeza)', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.698, longitude: -53.535 },
  { id: 'epr-iguacu-10', concessionaire: 'EPR Iguaçu', name: 'PR-182, km 521', address: 'Ampére/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.719, longitude: -53.468 },
  { id: 'epr-iguacu-11', concessionaire: 'EPR Iguaçu', name: 'PR-280, km 247', address: 'Renascença/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.155, longitude: -53.037 },

  // CCR PRVias
  { id: 'ccr-prvias-1', concessionaire: 'CCR PRVias', name: 'BR-369, km 194 (Sentido Sul)', address: 'Arapongas/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.393, longitude: -51.498 },
  { id: 'ccr-prvias-2', concessionaire: 'CCR PRVias', name: 'BR-369, km 213 (Sentido Sul)', address: 'Apucarana/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.518, longitude: -51.523 },
  { id: 'ccr-prvias-3', concessionaire: 'CCR PRVias', name: 'BR-373, km 181 (Sentido Norte)', address: 'Ponta Grossa/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.111, longitude: -50.315 },
  { id: 'ccr-prvias-4', concessionaire: 'CCR PRVias', name: 'BR-376, km 511 (Sentido Norte)', address: 'Ponta Grossa/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.071, longitude: -50.040 },
  { id: 'ccr-prvias-5', concessionaire: 'CCR PRVias', name: 'BR-376, km 389 (Sentido Norte)', address: 'Imbaú/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.464, longitude: -50.751 },
  { id: 'ccr-prvias-6', concessionaire: 'CCR PRVias', name: 'PR-445, km 26 (Sentido Norte)', address: 'Londrina/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.477, longitude: -51.196 },
  { id: 'ccr-prvias-7', concessionaire: 'CCR PRVias', name: 'PR-445, km 59 (Sentido Norte)', address: 'Londrina/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.367, longitude: -51.189 },
  { id: 'ccr-prvias-8', concessionaire: 'CCR PRVias', name: 'PR-323, km 27 (Sentido Sul)', address: 'Sertanópolis/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.035, longitude: -51.050 },
  { id: 'ccr-prvias-9', concessionaire: 'CCR PRVias', name: 'PR-323, km 54 (Sentido Sul)', address: 'Sertanópolis/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.003, longitude: -51.272 },
  { id: 'ccr-prvias-10', concessionaire: 'CCR PRVias', name: 'BR-376, km 278 (Sentido Norte)', address: 'Marilândia do Sul/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.774, longitude: -51.311 },
  { id: 'ccr-prvias-11', concessionaire: 'CCR PRVias', name: 'BR-376, km 347 (Sentido Norte)', address: 'Ortigueira/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.161, longitude: -50.985 },
  { id: 'ccr-prvias-12', concessionaire: 'CCR PRVias', name: 'BR-376, km 294 (Sentido Norte)', address: 'Mauá da Serra/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.896, longitude: -51.246 },
  { id: 'ccr-prvias-13', concessionaire: 'CCR PRVias', name: 'BR-376, km 436 (Sentido Norte)', address: 'Tibagi/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.620, longitude: -50.536 },
  
  // Arteris Litoral Sul
  { id: 'arteris-litoral-1', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 1,3 (sul)', address: 'Garuva/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.026, longitude: -48.847 },
  { id: 'arteris-litoral-2', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 46,8 (norte)', address: 'Joinville/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.335, longitude: -48.790 },
  { id: 'arteris-litoral-3', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 79,4 (sul)', address: 'Araquari/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.541, longitude: -48.705 },
  { id: 'arteris-litoral-4', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 129,8 (norte)', address: 'Camboriú/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.014, longitude: -48.653 },
  { id: 'arteris-litoral-5', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 157,4 (sul)', address: 'Porto Belo/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.169, longitude: -48.563 },
  { id: 'arteris-litoral-6', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 192,4 (norte)', address: 'Biguaçu/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.489, longitude: -48.647 },
  { id: 'arteris-litoral-7', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 243 (norte)', address: 'Palhoça/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.837, longitude: -48.652 },
  { id: 'arteris-litoral-8', concessionaire: 'Arteris Litoral Sul', name: 'BR-101/SC, km 205 (sul)', address: 'São José/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.593, longitude: -48.641 },
  { id: 'arteris-litoral-9', concessionaire: 'Arteris Litoral Sul', name: 'BR-116/PR (Contorno Leste), km 90,3 (sul)', address: 'Piraquara/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.501, longitude: -49.155 },
  { id: 'arteris-litoral-10', concessionaire: 'Arteris Litoral Sul', name: 'BR-376/PR, km 635,4 (norte)', address: 'São José dos Pinhais/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.602, longitude: -49.182 },
  
  // Arteris Planalto Sul
  { id: 'arteris-planalto-1', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 42', address: 'Itaiópolis/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.368, longitude: -49.919 },
  { id: 'arteris-planalto-2', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 82', address: 'Monte Castelo/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.568, longitude: -50.210 },
  { id: 'arteris-planalto-3', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 120', address: 'Monte Castelo/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.853, longitude: -50.312 },
  { id: 'arteris-planalto-4', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 152', address: 'Santa Cecília/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.965, longitude: -50.419 },
  { id: 'arteris-planalto-5', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 195', address: 'São Cristóvão do Sul/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.284, longitude: -50.485 },
  { id: 'arteris-planalto-6', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 233', address: 'Correia Pinto/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.575, longitude: -50.380 },
  { id: 'arteris-planalto-7', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 276', address: 'Capão Alto/SC', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -27.920, longitude: -50.505 },
  { id: 'arteris-planalto-8', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 134', address: 'Fazenda Rio Grande/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.698, longitude: -49.336 },
  { id: 'arteris-planalto-9', concessionaire: 'Arteris Planalto Sul', name: 'BR-116, km 204', address: 'Rio Negro/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -26.113, longitude: -49.778 },

  // Arteris Régis Bitencourt
  { id: 'arteris-regis-1', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 287 (sentido Curitiba)', address: 'Itapecerica da Serra/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.700, longitude: -46.840 },
  { id: 'arteris-regis-2', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 299 (sentido Curitiba)', address: 'São Lourenço da Serra/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.837, longitude: -46.924 },
  { id: 'arteris-regis-3', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 343 (sentido São Paulo)', address: 'Miracatu/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.168, longitude: -47.337 },
  { id: 'arteris-regis-4', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 357 (sentido Curitiba)', address: 'Miracatu/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.285, longitude: -47.399 },
  { id: 'arteris-regis-5', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 370 (sentido São Paulo)', address: 'Miracatu/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.321, longitude: -47.514 },
  { id: 'arteris-regis-6', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 426 (sentido Curitiba)', address: 'Juquiá/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.398, longitude: -47.886 },
  { id: 'arteris-regis-7', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 485 (sentido São Paulo)', address: 'Cajati/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.717, longitude: -48.109 },
  { id: 'arteris-regis-8', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 542 (sentido Curitiba)', address: 'Barra do Turvo/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -24.908, longitude: -48.384 },
  { id: 'arteris-regis-9', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 31 (sentido São Paulo)', address: 'Campina Grande do Sul/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.267, longitude: -49.006 },
  { id: 'arteris-regis-10', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 57 (sentido Curitiba)', address: 'Campina Grande do Sul/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.328, longitude: -49.198 },
  { id: 'arteris-regis-11', concessionaire: 'Arteris Régis Bitencourt', name: 'BR-116, Km 70 (sentido Curitiba)', address: 'Quatro Barras/PR', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -25.378, longitude: -49.123 },

  // CCR RioSP
  { id: 'ccr-riosp-1', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 98,900', address: 'Sentido Rio - SP (Sul) - Pindamonhangaba, SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.951, longitude: -45.485 },
  { id: 'ccr-riosp-2', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 51,200', address: 'Sentido SP - Rio (Norte) - Lorena/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.715, longitude: -45.097 },
  { id: 'ccr-riosp-3', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 202', address: 'Sentido SP - Rio (Norte) - Arujá/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.398, longitude: -46.347 },
  { id: 'ccr-riosp-4', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 117,5', address: 'Sentido SP - Rio (Norte) - Taubaté/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.003, longitude: -45.623 },
  { id: 'ccr-riosp-5', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 156,200', address: 'Sentido Rio - SP (Sul) - São José dos Campos/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.197, longitude: -45.961 },
  { id: 'ccr-riosp-6', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 264,600', address: 'Sentido Rio - SP (Sul) - Volta Redonda/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.569, longitude: -44.172 },
  { id: 'ccr-riosp-7', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 233,700', address: 'Sentido SP - Rio (Norte) - Piraí/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.641, longitude: -43.896 },
  { id: 'ccr-riosp-8', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 297,700', address: 'Sentido SP - Rio (Norte) - Porto Real/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.457, longitude: -44.385 },
  { id: 'ccr-riosp-9', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 230,200', address: 'Sentido Rio - SP (Sul) - Piraí/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.628, longitude: -43.874 },
  { id: 'ccr-riosp-10', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 18,300', address: 'Sentido SP - Rio (Norte) - Lavrinhas/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.570, longitude: -44.939 },
  { id: 'ccr-riosp-11', concessionaire: 'CCR RioSP', name: 'BR-116 (Via Dutra), Km 316,700', address: 'Sentido Rio - SP (Sul) - Itatiaia/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.485, longitude: -44.577 },
  { id: 'ccr-riosp-12', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 471', address: 'Sentido RJ (Norte) - Angra dos Reis/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.964, longitude: -44.316 },
  { id: 'ccr-riosp-13', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 10', address: 'Sentido RJ (Norte) - Ubatuba/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.364, longitude: -44.863 },
  { id: 'ccr-riosp-14', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 497', address: 'Sentido RJ (Norte) - Angra dos Reis/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.010, longitude: -44.425 },
  { id: 'ccr-riosp-15', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), km 31', address: 'Sentido RJ (Norte) - Ubatuba/SP', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.383, longitude: -44.996 },
  { id: 'ccr-riosp-16', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 550', address: 'Sentido RJ (Norte) - Paraty/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.189, longitude: -44.693 },
  { id: 'ccr-riosp-17', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 451', address: 'Sentido RJ (Norte) - Mangaratiba/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.919, longitude: -44.155 },
  { id: 'ccr-riosp-18', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 417', address: 'Sentido RJ (Norte) - Mangaratiba/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.955, longitude: -43.953 },
  { id: 'ccr-riosp-19', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 392', address: 'Sentido SP (Sul) - Itaguaí/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -22.880, longitude: -43.805 },
  { id: 'ccr-riosp-20', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 579', address: 'Sentido SP (Sul) - Paraty/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.275, longitude: -44.721 },
  { id: 'ccr-riosp-21', concessionaire: 'CCR RioSP', name: 'BR-101 (Rio Santos), Km 527', address: 'Sentido SP (Sul) - Angra dos Reis/RJ', services: ['Banheiros', 'Fraldário', 'Bebedouros', 'WI-FI', 'Informações'], operatingHours: '24 horas', latitude: -23.013, longitude: -44.595 },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function SAUPage() {
  const [sauLocations, setSauLocations] = useState<SAULocation[]>([]);
  const [loadingSaus, setLoadingSaus] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviews, setReviews] = useState<SAUReview[]>([]); // All reviews, fetched once
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeConcessionaireFilter, setActiveConcessionaireFilter] = useState<string>('Todos');
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [isContactsSheetOpen, setIsContactsSheetOpen] = useState(false);


  const requestLocation = useCallback(() => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadDataAndLocation = async () => {
      // Set hardcoded SAUs immediately
      setSauLocations(allSausData);
      setLoadingSaus(false);

      // Fetch reviews from Firestore
      if (firestore) {
        setLoadingReviews(true);
        try {
            const reviewsCollection = collection(firestore, 'sau_reviews');
            const qReviews = query(reviewsCollection, orderBy('timestamp', 'desc'));
            const reviewSnapshot = await getDocs(qReviews);
            const fetchedReviews: SAUReview[] = reviewSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    sauId: data.sauId,
                    author: data.author,
                    rating: data.rating,
                    comment: data.comment,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
                } as SAUReview;
            });
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching SAU reviews: ", error);
            toast({ variant: "destructive", title: "Erro ao Carregar Avaliações", description: "Não foi possível buscar as avaliações." });
        } finally {
            setLoadingReviews(false);
        }
      } else {
        setLoadingReviews(false);
      }
      
      requestLocation();
    };

    loadDataAndLocation();
  }, [requestLocation, toast]);
  

  const processedSaus = useMemo(() => {
    let filteredSaus = sauLocations;

    if (activeConcessionaireFilter !== 'Todos') {
      filteredSaus = filteredSaus.filter(sau => sau.concessionaire === activeConcessionaireFilter);
    }

    const sausWithAggregatedReviews = filteredSaus.map(sau => {
        const sauSpecificReviews = reviews.filter(r => r.sauId === sau.id);
        let averageRating = 0;
        if (sauSpecificReviews.length > 0) {
            averageRating = sauSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / sauSpecificReviews.length;
        }
        return {
            ...sau,
            averageRating,
            reviewCount: sauSpecificReviews.length,
        };
    });


    if (userLocation && locationStatus === 'success') {
      const sausWithDistance = sausWithAggregatedReviews.map(sau => {
        const distance = (sau.latitude && sau.longitude)
          ? calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude)
          : Infinity;
        return { ...sau, distance };
      });
      sausWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return sausWithDistance;
    } else {
      return [...sausWithAggregatedReviews].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [sauLocations, reviews, userLocation, locationStatus, activeConcessionaireFilter]);

  const handleAddReview = async (newReviewData: Omit<SAUReview, 'id' | 'timestamp' | 'author' | 'sauId'>, sauId: string) => {
    if (!currentUser || !firestore) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para avaliar ou serviço indisponível." });
      return;
    }

    const reviewToSave = {
      ...newReviewData,
      sauId: sauId,
      author: currentUser.displayName || "Usuário Anônimo",
      userId: currentUser.uid,
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(firestore, 'sau_reviews'), reviewToSave);
      const addedReview: SAUReview = {
          ...reviewToSave,
          id: docRef.id,
          // @ts-ignore
          timestamp: new Date().toISOString() // For optimistic update
      };
      setReviews(prevReviews => [addedReview, ...prevReviews]);
      toast({
        title: "Avaliação Enviada!",
        description: "Obrigado por sua contribuição.",
      });
    } catch (error) {
        console.error("Error adding SAU review: ", error);
        toast({ variant: "destructive", title: "Erro ao Enviar Avaliação", description: "Não foi possível salvar sua avaliação." });
    }
  };

  const isLoading = loadingSaus || loadingReviews || locationStatus === 'loading';

  return (
    <>
      <div className="w-full space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold font-headline">Concessões de Pedágio</h1>
          <p className="text-muted-foreground">Rodovias sob concessão e Serviço de Atendimento ao Usuário (SAU).</p>
        </div>

        <SauFilters
          concessionaires={concessionairesForFilter}
          currentFilter={activeConcessionaireFilter}
          onFilterChange={setActiveConcessionaireFilter}
        />
        
        <Button variant="destructive" className="w-full rounded-lg" onClick={() => setIsContactsSheetOpen(true)}>
            Telefones e Sites das Concessionárias
        </Button>

        <AdPlaceholder />

        {isLoading && (
          <Alert>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <AlertTitle className="font-headline">Carregando SAUs e Avaliações...</AlertTitle>
            <AlertDescription>
              Buscando informações e {locationStatus === 'loading' ? "tentando obter sua localização..." : "calculando distâncias..."}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && locationStatus === 'error' && (
          <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-headline">Localização indisponível</AlertTitle>
              <AlertDescription>
                  Verifique as permissões de localização e tente novamente.
                  <Button variant="outline" size="sm" onClick={requestLocation} className="ml-2 mt-1 sm:mt-0">
                      Tentar Novamente
                  </Button>
              </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {!isLoading && processedSaus.length > 0 ? processedSaus.map((sau, index) => {
            const sauSpecificReviews = reviews.filter(r => r.sauId === sau.id);
            return (
              <React.Fragment key={sau.id}>
                <SauLocationCard
                  sau={sau} // already has aggregated review data from processedSaus
                  reviews={sauSpecificReviews} // Pass filtered reviews for this SAU
                  onAddReview={(reviewData) => handleAddReview(reviewData, sau.id)}
                />
                {(index + 1) % 3 === 0 && index < processedSaus.length - 1 && (
                  <AdPlaceholder />
                )}
              </React.Fragment>
            );
          }) : !isLoading && (
            <p className="text-muted-foreground text-center py-4">
              Nenhum SAU encontrado para os filtros selecionados.
            </p>
          )}
        </div>

        <Alert className="mt-6">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline">Sobre os SAUs</AlertTitle>
            <AlertDescription>
              Os SAUs são pontos de apoio das concessionárias, oferecendo serviços como banheiros, água e informações.
            </AlertDescription>
          </Alert>
      </div>

      <Sheet open={isContactsSheetOpen} onOpenChange={setIsContactsSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 rounded-t-[25px]">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-center font-headline text-lg">Contatos das Concessionárias</SheetTitle>
            <SheetDescription className="text-center text-xs">
              Acesse rapidamente os telefones e sites das principais concessionárias.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {concessionaireContacts.map((contact, index) => (
              <Card key={index} className="shadow-md rounded-lg overflow-hidden" style={{ borderColor: contact.color }}>
                <CardHeader className="p-4" style={{ backgroundColor: `${contact.color}1A` }}>
                  <h3 className="font-bold font-headline text-base" style={{ color: contact.textColor }}>{contact.name}</h3>
                  <p className="text-xs" style={{ color: contact.textColor, opacity: 0.8 }}>{contact.highways}</p>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <a href={`tel:${contact.phone?.replace(/\D/g, '')}`}>
                      <Phone className="mr-2 h-4 w-4" /> {contact.phone}
                    </a>
                  </Button>
                  {contact.phone2 && (
                    <Button asChild variant="outline" className="w-full rounded-full">
                        <a href={`tel:${contact.phone2.replace(/\D/g, '')}`}>
                            <Phone className="mr-2 h-4 w-4" /> {contact.phone2}
                        </a>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full rounded-full sm:col-span-2">
                    <a href={contact.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" /> Acessar Site
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="p-4 border-t">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full rounded-full">
                  Fechar
                </Button>
              </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

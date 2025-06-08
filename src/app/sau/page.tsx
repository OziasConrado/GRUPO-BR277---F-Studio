
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react'; // Import React for React.Fragment
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, AlertTriangle, Info } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SauLocationCard from '@/components/sau/sau-location-card';
import SauFilters from '@/components/sau/sau-filters';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const concessionairesForFilter = [
  "Todos", "Via Araucária", "EPR Litoral Pioneiro", "Arteris Litoral Sul",
  "Arteris Planalto Sul", "Arteris Régis Bitencourt", "CCR PRVias",
  "CCR RioSP"
];

// Serviços padronizados para todas as concessionárias
const standardSauServices = ["Fraldário", "Banheiros", "Bebedouros", "Informações", "Outros"];

const mockSauLocations: SAULocation[] = [
  // Via Araucária (Paraná)
  { id: 'va-1', concessionaire: 'Via Araucária', name: 'SAU Km 520 - BR-277', address: 'BR-277, Km 520, Nova Laranjeiras - PR', latitude: -25.3303, longitude: -52.5414, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-2', concessionaire: 'Via Araucária', name: 'SAU Km 450 - BR-373', address: 'BR-373, Km 450, Candói - PR', latitude: -25.6037, longitude: -52.0305, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-1', concessionaire: 'Via Araucária', name: 'BSO 1: BR-277, km 108,80 - Curitiba', address: 'BR-277, km 108,80, Curitiba - PR', latitude: -25.4284, longitude: -49.2733, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-2', concessionaire: 'Via Araucária', name: 'BSO 2: BR-277, km 165,70 - Porto Amazonas', address: 'BR-277, km 165,70, Porto Amazonas - PR', latitude: -25.5380, longitude: -49.8930, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-3', concessionaire: 'Via Araucária', name: 'BSO 3: BR-277, km 211,70 - Palmeira', address: 'BR-277, km 211,70, Palmeira - PR', latitude: -25.4290, longitude: -50.0060, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-4', concessionaire: 'Via Araucária', name: 'BSO 4: BR-277, km 256,10 - Irati', address: 'BR-277, km 256,10, Irati - PR', latitude: -25.4670, longitude: -50.6510, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-5', concessionaire: 'Via Araucária', name: 'BSO 5: BR-277, km 300,30 - Prudentópolis', address: 'BR-277, km 300,30, Prudentópolis - PR', latitude: -25.2130, longitude: -50.9770, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-6', concessionaire: 'Via Araucária', name: 'BSO 6: BR-373, km 240,40 - Guamiranga', address: 'BR-373, km 240,40, Guamiranga - PR', latitude: -25.2180, longitude: -50.7890, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-7', concessionaire: 'Via Araucária', name: 'BSO 7: BR-373, km 201,80 - Ipiranga', address: 'BR-373, km 201,80, Ipiranga - PR', latitude: -25.0270, longitude: -50.5860, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-8', concessionaire: 'Via Araucária', name: 'BSO 8: PR-423, km 15,00 - Araucária', address: 'PR-423, km 15,00, Araucária - PR', latitude: -25.5920, longitude: -49.3999, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-9', concessionaire: 'Via Araucária', name: 'BSO 9: BR-476, km 188,30 - Lapa', address: 'BR-476, km 188,30, Lapa - PR', latitude: -25.7690, longitude: -49.7160, services: standardSauServices, operatingHours: '24 horas' },

  // EPR Litoral Pioneiro (Paraná)
  { id: 'epr-lp-bso-1', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 1: BR-369, Km 68.2 - Santa Mariana', address: 'BR-369, Km 68,2, Santa Mariana - PR', latitude: -23.145, longitude: -50.565, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-2', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 2: BR-369, Km 10 - Cambará', address: 'BR-369, Km 10, Cambará - PR', latitude: -23.048, longitude: -50.073, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-3', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 3: BR-153, Km 31.4 - Santo Antônio da Platina', address: 'BR-153, Km 31,4, Santo Antônio da Platina - PR', latitude: -23.295, longitude: -50.079, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-4', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 4: PR-092, Km 300.4 - Quatiguá', address: 'PR-092, Km 300,4, Quatiguá - PR', latitude: -23.573, longitude: -50.134, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-5', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 5: PR-092, Km 255.3 - Wenceslau Braz', address: 'PR-092, Km 255,3, Wenceslau Braz - PR', latitude: -23.875, longitude: -49.806, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-6', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 6: PR-092, Km 217 - Arapoti', address: 'PR-092, Km 217, Arapoti - PR', latitude: -24.156, longitude: -49.829, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-7', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 7: BR-153, Km 187.4 - Sengés', address: 'BR-153, Km 187,4, Sengés - PR', latitude: -24.113, longitude: -49.563, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-8', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 8: PR-151, Km 252.8 - Piraí do Sul', address: 'PR-151, Km 252,8, Piraí do Sul - PR', latitude: -24.527, longitude: -49.941, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-9', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 9: PR-151, Km 305.2 - Carambeí', address: 'PR-151, Km 305,2, Carambeí - PR', latitude: -24.917, longitude: -50.098, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-10', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 10: BR-277, Km 60.6 - São José dos Pinhais', address: 'BR-277, Km 60,6, São José dos Pinhais - PR', latitude: -25.5546, longitude: -49.0011, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-11', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 11: BR-277, Km 10.7 - Paranaguá', address: 'BR-277, Km 10,7, Paranaguá - PR', latitude: -25.520, longitude: -48.530, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-12', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 12: BR-277, Km 35 - Morretes', address: 'BR-277, Km 35, Morretes - PR', latitude: -25.470, longitude: -48.830, services: standardSauServices, operatingHours: '24 horas' },

  // Arteris Litoral Sul (Paraná/Santa Catarina)
  { id: 'als-1', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 1.3 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 1.3 (sentido Sul), Garuva - SC', latitude: -26.0261, longitude: -48.8519, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-2', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 46.8 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 46.8 (sentido Norte), Joinville - SC', latitude: -26.3031, longitude: -48.8416, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-3', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 79.4 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 79.4 (sentido Sul), Araquari - SC', latitude: -26.3708, longitude: -48.7222, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-4', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 129.8 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 129.8 (sentido Norte), Camboriú - SC', latitude: -27.0272, longitude: -48.6303, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-5', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 157.4 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 157.4 (sentido Sul), Porto Belo - SC', latitude: -27.1575, longitude: -48.5528, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-6', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 192.4 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 192.4 (sentido Norte), Biguaçu - SC', latitude: -27.4931, longitude: -48.6544, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-7', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 243 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 243 (sentido Norte), Palhoça - SC', latitude: -27.6464, longitude: -48.6678, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-8', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 205 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 205 (sentido Sul), São José - SC', latitude: -27.6146, longitude: -48.6280, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-9', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 90.3 (Sul) - BR-116/PR (Contorno Leste)', address: 'BR-116/PR (Contorno Leste), Km 90.3 (sentido Sul), Piraquara - PR', latitude: -25.4442, longitude: -49.0628, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-10', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 635.4 (Norte) - BR-376/PR', address: 'BR-376/PR, Km 635.4 (sentido Norte), São José dos Pinhais - PR', latitude: -25.5313, longitude: -49.1959, services: standardSauServices, operatingHours: '24 horas' },

  // Arteris Planalto Sul (Paraná/Santa Catarina)
  { id: 'aps-new-1', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 42 - BR-116', address: 'BR-116, Km 42, Itaiópolis - SC', latitude: -26.3312, longitude: -49.9015, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-2', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 82 - BR-116', address: 'BR-116, Km 82, Monte Castelo - SC', latitude: -26.4530, longitude: -50.2300, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-3', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 120 - BR-116', address: 'BR-116, Km 120, Monte Castelo - SC', latitude: -26.6200, longitude: -50.3200, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-4', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 152 - BR-116', address: 'BR-116, Km 152, Santa Cecília - SC', latitude: -26.9450, longitude: -50.4320, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-5', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 195 - BR-116', address: 'BR-116, Km 195, São Cristóvão do Sul - SC', latitude: -27.2780, longitude: -50.4250, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-6', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 233 - BR-116', address: 'BR-116, Km 233, Correia Pinto - SC', latitude: -27.5860, longitude: -50.3610, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-7', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 276 - BR-116', address: 'BR-116, Km 276, Capão Alto - SC', latitude: -27.9350, longitude: -50.5040, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-8', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 134 - BR-116', address: 'BR-116, Km 134, Fazenda Rio Grande - PR', latitude: -25.6578, longitude: -49.3103, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-9', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 204 - BR-116', address: 'BR-116, Km 204, Rio Negro - PR', latitude: -26.0980, longitude: -49.7950, services: standardSauServices, operatingHours: '24 horas' },

  // Arteris Régis Bitencourt (São Paulo/Paraná)
  { id: 'arb-new-1', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 287 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 287 (sentido Curitiba), Itapecerica da Serra - SP', latitude: -23.7169, longitude: -46.8487, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-2', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 299 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 299 (sentido Curitiba), São Lourenço da Serra - SP', latitude: -23.8614, longitude: -46.9419, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-3', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 343 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 343 (sentido São Paulo), Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-4', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 357 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 357 (sentido Curitiba), Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-5', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 370 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 370 (sentido São Paulo), Miracatu - SP', latitude: -24.2700, longitude: -47.4500, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-6', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 426 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 426 (sentido Curitiba), Juquiá - SP', latitude: -24.3194, longitude: -47.6369, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-7', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 485 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 485 (sentido São Paulo), Cajati - SP', latitude: -24.7378, longitude: -48.1042, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-8', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 542 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 542 (sentido Curitiba), Barra do Turvo - SP', latitude: -24.9111, longitude: -48.3653, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-9', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 31 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 31 (sentido São Paulo), Campina Grande do Sul - PR', latitude: -25.3033, longitude: -49.0528, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-10', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 57 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 57 (sentido Curitiba), Campina Grande do Sul - PR', latitude: -25.2000, longitude: -48.8000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-11', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 70 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 70 (sentido Curitiba), Quatro Barras - PR', latitude: -25.3683, longitude: -49.0769, services: standardSauServices, operatingHours: '24 horas' },

  // CCR PRVias
  { id: 'ccr-prvias-1', concessionaire: 'CCR PRVias', name: 'SAU Km 194 (Sul) - BR-369/PR', address: 'BR-369/PR - Rodovia Melo Peixoto, km 194 (Sentido Sul), Arapongas - PR', latitude: -23.4197, longitude: -51.4244, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-2', concessionaire: 'CCR PRVias', name: 'SAU Km 213 (Sul) - BR-369/PR', address: 'BR-369/PR - Rodovia Melo Peixoto, km 213 (Sentido Sul), Apucarana - PR', latitude: -23.5508, longitude: -51.4600, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-3', concessionaire: 'CCR PRVias', name: 'SAU Km 181 (Norte) - BR-373', address: 'BR-373 – Rodovia do Café Governador Ney Braga, km 181 (Sentido Norte), Ponta Grossa - PR', latitude: -25.1567, longitude: -50.1039, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-4', concessionaire: 'CCR PRVias', name: 'SAU Km 511 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 511 (Sentido Norte), Ponta Grossa - PR', latitude: -24.9980, longitude: -50.1592, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-5', concessionaire: 'CCR PRVias', name: 'SAU Km 389 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 389 (Sentido Norte), Imbaú - PR', latitude: -24.4458, longitude: -50.7744, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-6', concessionaire: 'CCR PRVias', name: 'SAU Km 26 (Norte) - PR-445', address: 'PR-445 - Rodovia Celso Garcia Cid, km 26 (Sentido Norte), Londrina - PR', latitude: -23.4215, longitude: -51.1851, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-7', concessionaire: 'CCR PRVias', name: 'SAU Km 59 (Norte) - PR-445', address: 'PR-445 - Rodovia Celso Garcia Cid, km 59 (Sentido Norte), Londrina - PR', latitude: -23.3379, longitude: -51.1707, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-8', concessionaire: 'CCR PRVias', name: 'SAU Km 27 (Sul) - PR-323', address: 'PR-323 – Rodovia Celso Garcia Cid, km 27 (Sentido Sul), Sertanópolis - PR', latitude: -23.0583, longitude: -51.0375, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-9', concessionaire: 'CCR PRVias', name: 'SAU Km 54 (Sul) - PR-323', address: 'PR-323 – Rodovia Celso Garcia Cid, km 54 (Sentido Sul), Sertanópolis - PR', latitude: -23.0700, longitude: -50.8000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-10', concessionaire: 'CCR PRVias', name: 'SAU Km 278 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 278  (Sentido Norte), Marilândia do Sul - PR', latitude: -23.7500, longitude: -51.3000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-11', concessionaire: 'CCR PRVias', name: 'SAU Km 347 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 347 (Sentido Norte), Ortigueira - PR', latitude: -24.2081, longitude: -50.9494, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-12', concessionaire: 'CCR PRVias', name: 'SAU Km 294 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 294 (Sentido Norte), Mauá da Serra - PR', latitude: -23.8989, longitude: -51.2208, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-prvias-13', concessionaire: 'CCR PRVias', name: 'SAU Km 436 (Norte) - BR-376/PR', address: 'BR-376/PR - Rodovia do Café Governador Ney Braga, km 436 (Sentido Norte), Tibagi - PR', latitude: -24.5128, longitude: -50.4169, services: standardSauServices, operatingHours: '24 horas' },

  // CCR RioSP
  { id: 'ccr-rsp-new-1', concessionaire: 'CCR RioSP', name: 'SAU Km 98.9 (Sul) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 98,900 - Sentido Rio - SP (Sul), Pindamonhangaba - SP', latitude: -22.9231, longitude: -45.4563, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-2', concessionaire: 'CCR RioSP', name: 'SAU Km 51.2 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 51,200 - Sentido SP - Rio (Norte), Lorena - SP', latitude: -22.7319, longitude: -45.1242, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-3', concessionaire: 'CCR RioSP', name: 'SAU Km 202 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 202 - Sentido SP - Rio (Norte), Arujá - SP', latitude: -23.3961, longitude: -46.3194, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-4', concessionaire: 'CCR RioSP', name: 'SAU Km 117.5 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 117,5 - Sentido SP - Rio (Norte), Taubaté - SP', latitude: -23.0267, longitude: -45.5558, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-5', concessionaire: 'CCR RioSP', name: 'SAU Km 156.2 (Sul) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 156,200 - Sentido Rio - SP (Sul), São José dos Campos - SP', latitude: -23.1792, longitude: -45.8869, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-6', concessionaire: 'CCR RioSP', name: 'SAU Km 264.6 (Sul) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 264,600 - Sentido Rio - SP (Sul), Volta Redonda - RJ', latitude: -22.5230, longitude: -44.1042, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-7', concessionaire: 'CCR RioSP', name: 'SAU Km 233.7 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 233,700 - Sentido SP - Rio (Norte), Piraí - RJ', latitude: -22.6292, longitude: -43.8984, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-8', concessionaire: 'CCR RioSP', name: 'SAU Km 297.7 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 297,700 - Sentido SP - Rio (Norte), Porto Real - RJ', latitude: -22.4197, longitude: -44.2908, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-9', concessionaire: 'CCR RioSP', name: 'SAU Km 230.2 (Sul) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 230,200 - Sentido Rio - SP (Sul), São Paulo - SP', latitude: -23.4969, longitude: -46.5413, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-10', concessionaire: 'CCR RioSP', name: 'SAU Km 18.3 (Norte) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 18,300 - Sentido SP - Rio (Norte), Lavrinhas - SP', latitude: -22.5708, longitude: -44.9031, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-11', concessionaire: 'CCR RioSP', name: 'SAU Km 316.7 (Sul) - BR-116 (Via Dutra)', address: 'BR-116 (Via Dutra), Km 316,700 - Sentido Rio - SP (Sul), Itatiaia - RJ', latitude: -22.4964, longitude: -44.5636, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-12', concessionaire: 'CCR RioSP', name: 'SAU Km 471 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 471 - Sentido RJ (Norte), Angra dos Reis - RJ', latitude: -23.0069, longitude: -44.3183, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-13', concessionaire: 'CCR RioSP', name: 'SAU Km 10 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 10 - Sentido RJ (Norte), Ubatuba - SP', latitude: -23.4339, longitude: -45.0711, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-14', concessionaire: 'CCR RioSP', name: 'SAU Km 497 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 497 - Sentido RJ (Norte), Angra dos Reis - RJ', latitude: -22.9000, longitude: -44.2000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-15', concessionaire: 'CCR RioSP', name: 'SAU Km 31 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), km 31 - Sentido RJ (Norte), Ubatuba - SP', latitude: -23.3000, longitude: -44.9000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-16', concessionaire: 'CCR RioSP', name: 'SAU Km 550 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 550 - Sentido RJ (Norte), Paraty - RJ', latitude: -23.2194, longitude: -44.7153, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-17', concessionaire: 'CCR RioSP', name: 'SAU Km 451 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 451 - Sentido RJ (Norte), Mangaratiba - RJ', latitude: -22.9597, longitude: -44.0406, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-18', concessionaire: 'CCR RioSP', name: 'SAU Km 417 (Norte) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 417 - Sentido RJ (Norte), Mangaratiba - RJ', latitude: -22.9000, longitude: -43.9000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-19', concessionaire: 'CCR RioSP', name: 'SAU Km 392 (Sul) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 392 - Sentido SP (Sul), Itaguaí - RJ', latitude: -22.8519, longitude: -43.7758, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-20', concessionaire: 'CCR RioSP', name: 'SAU Km 579 (Sul) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 579 - Sentido SP (Sul), Paraty - RJ', latitude: -23.1000, longitude: -44.6000, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'ccr-rsp-new-21', concessionaire: 'CCR RioSP', name: 'SAU Km 527 (Sul) - BR-101 (Rio Santos)', address: 'BR-101 (Rio Santos), Km 527 - Sentido SP (Sul), Angra dos Reis - RJ', latitude: -22.8000, longitude: -44.1000, services: standardSauServices, operatingHours: '24 horas' },
].filter(sau => sau.concessionaire !== 'COI DER/PR');


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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviews, setReviews] = useState<SAUReview[]>([]);
  const [activeConcessionaireFilter, setActiveConcessionaireFilter] = useState<string>('Todos');
  const { toast } = useToast();

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
          toast({
            title: "Erro de Localização",
            description: "Não foi possível obter sua localização. Mostrando SAUs em ordem padrão.",
            variant: "destructive"
          });
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
    requestLocation();
  }, [requestLocation]);

  const processedSaus = useMemo(() => {
    let filteredSaus = mockSauLocations;

    if (activeConcessionaireFilter !== 'Todos') {
      filteredSaus = filteredSaus.filter(sau => sau.concessionaire === activeConcessionaireFilter);
    }

    if (userLocation) {
      const sausWithDistance = filteredSaus.map(sau => ({
        ...sau,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude),
      }));
      sausWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return sausWithDistance;
    } else {
      return [...filteredSaus].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [userLocation, activeConcessionaireFilter]);

  const handleAddReview = (newReview: Omit<SAUReview, 'id' | 'timestamp' | 'author'>, sauId: string) => {
    const fullReview: SAUReview = {
      ...newReview,
      id: `review-${Date.now()}`,
      sauId: sauId,
      author: "Usuário Anônimo",
      timestamp: new Date().toISOString(),
    };
    setReviews(prevReviews => [...prevReviews, fullReview]);
    toast({
      title: "Avaliação Enviada!",
      description: "Obrigado por sua contribuição.",
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold font-headline">Serviços de Atendimento ao Usuário (SAU)</h1>
        <p className="text-muted-foreground">Encontre os SAUs das concessionárias.</p>
      </div>

      <SauFilters
        concessionaires={concessionairesForFilter}
        currentFilter={activeConcessionaireFilter}
        onFilterChange={setActiveConcessionaireFilter}
      />

      <AdPlaceholder />

      {locationStatus === 'loading' && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Obtendo sua localização...</AlertTitle>
          <AlertDescription>
            Por favor, aguarde para listarmos os SAUs mais próximos.
          </AlertDescription>
        </Alert>
      )}

      {locationStatus === 'error' && (
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
        {processedSaus.length > 0 ? processedSaus.map((sau, index) => {
          const sauReviews = reviews.filter(r => r.sauId === sau.id);
          let averageRating = 0;
          if (sauReviews.length > 0) {
            averageRating = sauReviews.reduce((sum, r) => sum + r.rating, 0) / sauReviews.length;
          }
          return (
            <React.Fragment key={sau.id}>
              <SauLocationCard
                sau={{...sau, averageRating, reviewCount: sauReviews.length}}
                reviews={sauReviews}
                onAddReview={(reviewData) => handleAddReview(reviewData, sau.id)}
              />
              {(index + 1) % 3 === 0 && index < processedSaus.length - 1 && (
                <AdPlaceholder />
              )}
            </React.Fragment>
          );
        }) : (
          <p className="text-muted-foreground text-center py-4">
            {locationStatus !== 'loading' ? 'Nenhum SAU encontrado para os filtros selecionados.' : 'Carregando SAUs...'}
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
  );
}

    
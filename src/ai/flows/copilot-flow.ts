
'use server';
/**
 * @fileOverview O copiloto de IA para o Rota Segura.
 *
 * - askCopilot - A função principal que um usuário chama com sua pergunta.
 * - CopilotInput - O tipo de entrada para askCopilot.
 * - CopilotOutput - O tipo de retorno para askCopilot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  CopilotInputSchema,
  type CopilotInput,
  CopilotOutputSchema,
  type CopilotOutput,
} from '@/ai/schemas/copilot-schemas';
import axios from 'axios';

export type { CopilotInput, CopilotOutput };

// Ferramenta de Informações de Trânsito
const getTrafficInfo = ai.defineTool(
    {
        name: 'getTrafficInfo',
        description: 'Obtém informações de trânsito em tempo real, incluindo tempo de viagem, distância e um resumo das condições entre dois locais.',
        inputSchema: z.object({
            origin: z.string().describe('A cidade ou ponto de partida.'),
            destination: z.string().describe('A cidade ou ponto de destino.'),
        }),
        outputSchema: z.object({
            travelTime: z.string().describe('O tempo estimado de viagem, por exemplo, "1 hora e 30 minutos".'),
            distance: z.string().describe('A distância total da rota, por exemplo, "150 km".'),
            summary: z.string().describe('Um resumo das condições da rota, incluindo acidentes, obras ou congestionamentos.'),
        })
    },
    async ({ origin, destination }) => {
        console.log(`Buscando tráfego (MOCK) de ${origin} para ${destination}`);
        // !! IMPLEMENTAÇÃO MOCK !!
        // Para usar a API real do Google Maps, você precisará de uma chave de API
        // e substituir este bloco de código por uma chamada real usando axios.
        // Adicione a chave no arquivo .env como NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            return {
                travelTime: "desconhecido",
                distance: "desconhecida",
                summary: "A API do Google Maps não está configurada. Por favor, adicione a chave no arquivo .env."
            };
        }

        // Exemplo de dados mockados
        if (origin.toLowerCase().includes('curitiba') && destination.toLowerCase().includes('matinhos')) {
            return {
                travelTime: "1 hora e 45 minutos",
                distance: "110 km",
                summary: "O trânsito na BR-277 está intenso, com um ponto de lentidão próximo a Morretes devido a obras na pista. Fora isso, sem acidentes reportados."
            };
        }
        return {
            travelTime: "desconhecido",
            distance: "desconhecida",
            summary: `Não consegui obter informações de tráfego para a rota entre ${origin} e ${destination}. Por favor, tente com cidades mais conhecidas.`
        };
    }
);

// Ferramenta de Previsão do Tempo
const getWeatherInfo = ai.defineTool(
    {
        name: 'getWeatherInfo',
        description: 'Obtém a previsão do tempo atual para uma cidade específica.',
        inputSchema: z.object({
            location: z.string().describe('A cidade para a qual obter a previsão do tempo, por exemplo, "Curitiba, BR".'),
        }),
        outputSchema: z.object({
            temperature: z.string().describe('A temperatura atual.'),
            condition: z.string().describe('A condição do tempo (ex: Ensolarado, Nublado, Chuvoso).'),
            summary: z.string().describe('Um resumo amigável do tempo para viajantes.'),
        })
    },
    async ({ location }) => {
        console.log(`Buscando clima (MOCK) para ${location}`);
        // !! IMPLEMENTAÇÃO MOCK !!
        // Para usar uma API real (ex: OpenWeatherMap), você precisaria de uma chave
        // e faria uma chamada aqui.
        if (location.toLowerCase().includes('curitiba')) {
            return {
                temperature: "15°C",
                condition: "Parcialmente nublado",
                summary: "Tempo ameno em Curitiba, bom para viajar mas com possibilidade de neblina na serra."
            };
        }
        return {
            temperature: "Desconhecida",
            condition: "Desconhecida",
            summary: `Não foi possível obter a previsão do tempo para ${location}.`
        };
    }
);

// Ferramenta para Encontrar Locais Próximos
const findNearbyPlaces = ai.defineTool(
    {
        name: 'findNearbyPlaces',
        description: 'Encontra lugares próximos, como restaurantes, postos de gasolina ou hotéis, em uma determinada cidade.',
        inputSchema: z.object({
            query: z.string().describe('O tipo de lugar a ser buscado, por exemplo, "restaurante", "posto de gasolina 24h", "hotel barato".'),
            location: z.string().describe('A cidade onde buscar os locais.'),
        }),
        outputSchema: z.object({
            places: z.array(z.object({
                name: z.string(),
                address: z.string(),
            })).describe('Uma lista de até 3 lugares encontrados.')
        })
    },
    async ({ query, location }) => {
        console.log(`Buscando locais (MOCK) para "${query}" em ${location}`);
        // !! IMPLEMENTAÇÃO MOCK com a API do Google Places !!
        if (query.includes('restaurante') && location.toLowerCase().includes('curitiba')) {
            return {
                places: [
                    { name: "Madaloosso", address: "Av. Manoel Ribas, 5875 - Santa Felicidade" },
                    { name: "Churrascaria Batel Grill", address: "Av. do Batel, 18 - Batel" },
                ]
            };
        }
        return {
            places: []
        };
    }
);

// Ferramenta de Cálculo de Pedágios
const calculateTolls = ai.defineTool(
    {
        name: 'calculateTolls',
        description: 'Fornece uma estimativa do custo de pedágio e o número de praças para uma rota. AVISO: O valor é uma estimativa e pode variar.',
        inputSchema: z.object({
            origin: z.string().describe('A cidade de partida.'),
            destination: z.string().describe('A cidade de destino.'),
        }),
        outputSchema: z.object({
            totalCost: z.number().describe('O custo total estimado dos pedágios.'),
            tollCount: z.number().describe('O número aproximado de praças de pedágio.'),
        })
    },
    async ({ origin, destination }) => {
        console.log(`Calculando pedágios (MOCK) de ${origin} para ${destination}`);
        // !! IMPLEMENTAÇÃO MOCK !! APIs de pedágio são geralmente pagas e complexas.
        if (origin.toLowerCase().includes('são paulo') && destination.toLowerCase().includes('curitiba')) {
            return { totalCost: 78.90, tollCount: 6 };
        }
        if (origin.toLowerCase().includes('curitiba') && destination.toLowerCase().includes('florianópolis')) {
            return { totalCost: 24.60, tollCount: 4 };
        }
        return { totalCost: 0, tollCount: 0 };
    }
);

const copilotPrompt = ai.definePrompt({
    name: 'copilotPrompt',
    system: `Você é o Copiloto277, um assistente de IA amigável e expert para viajantes no aplicativo Rota Segura.
- Sua principal função é fornecer informações claras e úteis sobre rotas, trânsito, clima, locais e pedágios.
- Use as ferramentas disponíveis sempre que a pergunta do usuário solicitar.
- Ao planejar uma rota, combine informações de múltiplas ferramentas. Por exemplo, para "Qual a condição da rota de São Paulo para Curitiba?", use 'getTrafficInfo' para o trânsito, 'calculateTolls' para os pedágios, e 'getWeatherInfo' para o clima em Curitiba.
- Se não conseguir encontrar informações com uma ferramenta, informe ao usuário de forma amigável.
- Formate a resposta de forma conversacional, clara e organizada. Use listas se for apropriado.
- Mantenha as respostas concisas, mas completas.`,
    tools: [getTrafficInfo, getWeatherInfo, findNearbyPlaces, calculateTolls],
    output: {
        format: 'text'
    }
});


const copilotFlow = ai.defineFlow(
  {
    name: 'copilotFlow',
    inputSchema: CopilotInputSchema,
    outputSchema: CopilotOutputSchema,
  },
  async (input) => {
    const llmResponse = await copilotPrompt(input.query);
    return { response: llmResponse.text };
  }
);


export async function askCopilot(input: CopilotInput): Promise<CopilotOutput> {
  return copilotFlow(input);
}

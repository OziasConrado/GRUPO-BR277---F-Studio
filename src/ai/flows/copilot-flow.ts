
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
import { type MessageData } from '@genkit-ai/ai/model';

export type { CopilotInput, CopilotOutput };


// Helper para Geocodificação
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('Google Maps API Key not found.');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].geometry.location;
        }
        console.warn(`Geocoding failed for ${address}:`, data.status);
        return null;
    } catch (error) {
        console.error(`Geocoding request failed for ${address}:`, error);
        return null;
    }
}


// Ferramenta de Informações de Trânsito e Pedágio
const getTrafficInfo = ai.defineTool(
    {
        name: 'getTrafficInfo',
        description: 'Obtém informações de trânsito em tempo real, incluindo tempo de viagem, distância, um resumo das condições e custo de pedágio entre dois locais.',
        inputSchema: z.object({
            origin: z.string().describe('A cidade ou ponto de partida.'),
            destination: z.string().describe('A cidade ou ponto de destino.'),
        }),
        outputSchema: z.object({
            travelTime: z.string().describe('O tempo estimado de viagem, por exemplo, "1 hora e 30 minutos".'),
            distance: z.string().describe('A distância total da rota, por exemplo, "150 km".'),
            summary: z.string().describe('Um resumo das condições da rota, incluindo acidentes, obras ou congestionamentos.'),
            tollCost: z.number().describe('O custo total estimado dos pedágios. Retorna 0 se não houver pedágios.'),
        })
    },
    async ({ origin, destination }) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
             return {
                travelTime: "desconhecido",
                distance: "desconhecida",
                summary: "A API do Google Maps não está configurada.",
                tollCost: 0
            };
        }

        try {
            const [originCoords, destinationCoords] = await Promise.all([geocode(origin), geocode(destination)]);

            if (!originCoords || !destinationCoords) {
                return {
                    travelTime: "desconhecido",
                    distance: "desconhecida",
                    summary: `Não foi possível encontrar as coordenadas para ${origin} ou ${destination}.`,
                    tollCost: 0
                };
            }

            const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory,routes.tollInfo'
                },
                body: JSON.stringify({
                    origin: { location: { latLng: originCoords } },
                    destination: { location: { latLng: destinationCoords } },
                    travelMode: 'DRIVE',
                    computeAlternativeRoutes: false,
                    extraComputations: ["TOLLS", "TRAFFIC_ON_POLYLINE"],
                    languageCode: "pt-BR",
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                 console.error('Routes API error:', data.error);
                 return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Erro ao buscar informações de rota: ${data.error.message || 'Erro de comunicação.'}`, tollCost: 0
                };
            }

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const distanceKm = (route.distanceMeters / 1000).toFixed(1);
                const distance = `${distanceKm} km`;
                
                const durationSeconds = parseInt(route.duration.slice(0, -1)); // remove 's'
                const hours = Math.floor(durationSeconds / 3600);
                const minutes = Math.floor((durationSeconds % 3600) / 60);
                const travelTime = `${hours > 0 ? `${hours} hora${hours > 1 ? 's' : ''} e ` : ''}${minutes} minuto${minutes > 1 ? 's' : ''}`;

                const summary = route.travelAdvisory?.trafficAdvisory?.trafficCondition 
                    ? `Condição do trânsito: ${route.travelAdvisory.trafficAdvisory.trafficCondition}.`
                    : "Sem informações de tráfego disponíveis.";

                let tollCost = 0;
                if (route.tollInfo && route.tollInfo.estimatedPrice) {
                    tollCost = route.tollInfo.estimatedPrice.reduce((total: number, price: any) => {
                        return total + (parseFloat(price.units) || 0) + (price.nanos / 1_000_000_000);
                    }, 0);
                }

                return { travelTime, distance, summary, tollCost };
            } else {
                 return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Não foi possível encontrar uma rota entre ${origin} e ${destination}.`, tollCost: 0
                };
            }
        } catch (error: any) {
            console.error('Routes API error:', error);
            return {
                travelTime: "desconhecido", distance: "desconhecida",
                summary: `Erro ao buscar informações de rota: ${error.message || 'Erro de comunicação.'}`, tollCost: 0
            };
        }
    }
);


// Ferramenta de Previsão do Tempo (MOCK)
const getWeatherInfo = ai.defineTool(
    {
        name: 'getWeatherInfo',
        description: 'Obtém a previsão do tempo atual para uma cidade específica. (DADOS DE EXEMPLO)',
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
        // !! IMPLEMENTAÇÃO MOCK !!
        if (location.toLowerCase().includes('curitiba')) {
            return {
                temperature: "15°C",
                condition: "Parcialmente nublado",
                summary: "Tempo ameno em Curitiba, bom para viajar mas com possibilidade de neblina na serra."
            };
        }
        return {
            temperature: "Desconhecida", condition: "Desconhecida",
            summary: `(Exemplo) Não foi possível obter a previsão do tempo para ${location}.`
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
                address: z.string().optional(),
                rating: z.number().optional(),
            })).describe('Uma lista de até 3 lugares encontrados.')
        })
    },
    async ({ query, location }) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return { places: [] };

        try {
            const locationCoords = await geocode(location);
            if (!locationCoords) {
                return { places: [{ name: `Não foi possível encontrar a localização: ${location}`, address: undefined, rating: undefined }] };
            }

            const params = new URLSearchParams({
                location: `${locationCoords.lat},${locationCoords.lng}`,
                radius: '15000',
                keyword: query,
                key: apiKey,
                language: 'pt-BR'
            });
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();


            if (data.status === 'OK') {
                return {
                    places: data.results.slice(0, 3).map((place: any) => ({
                        name: place.name,
                        address: place.vicinity,
                        rating: place.rating
                    }))
                };
            }
            return { places: [] };

        } catch (error: any) {
            console.error('Places API error:', error);
            return { places: [] };
        }
    }
);


const copilotFlow = ai.defineFlow(
  {
    name: 'copilotFlow',
    inputSchema: CopilotInputSchema,
    outputSchema: CopilotOutputSchema,
  },
  async (input) => {
    const tools = [getTrafficInfo, getWeatherInfo, findNearbyPlaces];
    const systemPrompt = `Você é o Copiloto277, um assistente de IA amigável e expert para viajantes no aplicativo Rota Segura.
- Sua principal função é fornecer informações claras e úteis sobre rotas, trânsito, clima, locais e pedágios.
- Use as ferramentas disponíveis sempre que a pergunta do usuário solicitar.
- Ao planejar uma rota, combine informações de múltiplas ferramentas. Por exemplo, para "Qual a condição da rota de São Paulo para Curitiba?", use 'getTrafficInfo' para o trânsito e pedágios, e 'getWeatherInfo' para o clima em Curitiba.
- Se não conseguir encontrar informações com uma ferramenta, informe ao usuário de forma amigável.
- Formate a resposta de forma conversacional, clara e organizada. Use listas se for apropriado.
- Mantenha as respostas concisas, mas completas.
- AVISO: A previsão do tempo ainda está em fase de testes e usa dados de exemplo.`;

    // The history of the conversation.
    const messages: MessageData[] = [{ role: 'user', content: [{ text: input.query }] }];

    for (let i = 0; i < 5; i++) {
      const lastMessage = messages[messages.length - 1];
      const history = messages.slice(0, -1);

      const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: lastMessage.content,
        history: history,
        tools: tools,
        system: systemPrompt,
      });

      // Add the model's response to the list of messages.
      messages.push(llmResponse.message);

      // If the model did NOT request a tool, we have the final answer.
      if (!llmResponse.toolCalls || llmResponse.toolCalls.length === 0) {
        return { response: llmResponse.text ?? "Não foi possível obter uma resposta do assistente. Tente novamente." };
      }

      // Execute the tool calls.
      const toolResults = await Promise.all(
        llmResponse.toolCalls.map(async (call) => {
          console.log('Attempting to call tool:', call.tool);
          const tool = ai.lookupTool(call.tool);
          if (!tool) {
            console.error(`Tool not found: ${call.tool}`);
            return { call, output: { error: `Tool ${call.tool} not found.` } };
          }

          try {
            const output = await tool(call.input);
            return { call, output };
          } catch (e: any) {
            console.error(`Error executing tool ${call.tool}:`, e);
            return { call, output: { error: `A ferramenta falhou com o erro: ${e.message}` } };
          }
        })
      );
      
      // Add tool results as a new message to the history.
      const toolResponseMessage: MessageData = {
        role: 'tool',
        content: toolResults.map((result) => ({
          toolResponse: { name: result.call.tool, response: result.output },
        })),
      };
      messages.push(toolResponseMessage);
      
      // Continue the loop to let the model process the tool results and generate the next response.
    }
    
    return { response: "O assistente não conseguiu chegar a uma resposta final." };
  }
);


export async function askCopilot(input: CopilotInput): Promise<CopilotOutput> {
  return copilotFlow(input);
}

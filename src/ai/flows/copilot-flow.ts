
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
        description: 'Obtém informações de trânsito em tempo real, incluindo tempo de viagem, distância, um resumo das condições, custo e quantidade de pedágios entre dois locais.',
        inputSchema: z.object({
            origin: z.string().describe('A cidade ou ponto de partida.'),
            destination: z.string().describe('A cidade ou ponto de destino.'),
        }),
        outputSchema: z.object({
            travelTime: z.string().describe('O tempo estimado de viagem, por exemplo, "1 hora e 30 minutos".'),
            distance: z.string().describe('A distância total da rota, por exemplo, "150 km".'),
            summary: z.string().describe('Um resumo das condições da rota, incluindo acidentes, obras ou congestionamentos.'),
            tollCost: z.number().describe('O custo total estimado dos pedágios. Retorna 0 se não houver pedágios.'),
            tollCount: z.number().describe('O número de praças de pedágio na rota.'),
            routePolyline: z.string().optional().describe('A polilinha codificada da rota para gerar uma imagem de mapa.')
        })
    },
    async ({ origin, destination }) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
             return {
                travelTime: "desconhecido",
                distance: "desconhecida",
                summary: "A API do Google Maps não está configurada.",
                tollCost: 0,
                tollCount: 0,
                routePolyline: undefined,
            };
        }

        try {
            const [originCoords, destinationCoords] = await Promise.all([geocode(origin), geocode(destination)]);

            if (!originCoords || !destinationCoords) {
                return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Não foi possível encontrar as coordenadas para ${origin} ou ${destination}.`, tollCost: 0, tollCount: 0,
                };
            }

            const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory,routes.tollInfo,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction'
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
                    summary: `Erro ao buscar informações de rota: ${data.error.message || 'Erro de comunicação.'}`, tollCost: 0, tollCount: 0,
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

                let tollCount = 0;
                if (route.legs) {
                    for (const leg of route.legs) {
                        if (leg.steps) {
                            for (const step of leg.steps) {
                                if (step.navigationInstruction?.instructions?.toLowerCase().includes('pedágio')) {
                                    tollCount++;
                                }
                            }
                        }
                    }
                }
                
                const routePolyline = route.polyline?.encodedPolyline;

                return { travelTime, distance, summary, tollCost, tollCount, routePolyline };
            } else {
                 return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Não foi possível encontrar uma rota entre ${origin} e ${destination}.`, tollCost: 0, tollCount: 0
                };
            }
        } catch (error: any) {
            console.error('Routes API error:', error);
            return {
                travelTime: "desconhecido", distance: "desconhecida",
                summary: `Erro ao buscar informações de rota: ${error.message || 'Erro de comunicação.'}`, tollCost: 0, tollCount: 0
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
    const systemPrompt = `Você é o "Copiloto277", um assistente de IA amigável e especialista em informações de trânsito em tempo real para o Brasil, com a missão de fornecer informações claras, concisas e úteis.

**Personalidade e Tom:**
- Seja amigável, prestativo e proativo. Comece com uma saudação como "Olá! Que bom que você está planejando sua viagem! Vamos ver como está a estrada."
- Use uma linguagem simples e direta.
- O tom deve ser sempre otimista e tranquilizador.

**Funções e Habilidades:**
- **Consulta de Rota:** Receba a origem e o destino do usuário (ex: "Curitiba para Londrina"). Se o usuário falar "minha localização atual", considere isso como a origem.
- **Condições de Trânsito:** Use a ferramenta \`getTrafficInfo\` para obter dados. Sua resposta DEVE incluir:
    - Uma *Condição geral do trecho* (ex: "O trânsito está fluindo bem, com alguns pontos de atenção.").
    - O *Tempo estimado de viagem* de forma visível.
    - **Pedágios**: Informe o número de praças de pedágio (\`tollCount\`) e o custo total estimado (\`tollCost\`). Formate o custo como moeda brasileira (R$). Ex: "Há 3 praças de pedágio no caminho, com um custo total de R$ 45,90." Se o custo ou a contagem for 0, informe que não há pedágios.
    - Uma lista de *Pontos de atenção* (lentidão, congestionamentos, acidentes, obras) se houver problemas. Seja específico (ex: "Na BR-376, próximo ao km 120, há lentidão devido a obras na pista").
- **Aviso de Dados:** Sempre termine sua resposta com a frase: "Lembre-se que as condições do trânsito podem mudar rapidamente. Dirija com segurança e boa viagem!"

**Estrutura da Resposta (Siga EXATAMENTE este formato):**
1. Saudação amigável e confirmação da rota.
2. Apresente a *Condição geral*.
3. Apresente o *Tempo estimado de viagem*.
4. Apresente as informações de *Pedágio* (quantidade e custo).
5. Se houver problemas, liste os *Pontos de atenção* com marcadores. Se não houver problemas, diga algo como "O caminho está livre!".
6. Finalize com a frase de segurança e boa viagem.

**IMPORTANTE:**
- NÃO invente informações de trânsito. Se a ferramenta não retornar dados, informe ao usuário que não há informações disponíveis no momento.
- NÃO inclua o link do mapa na sua resposta de texto. O link e um mapa visual serão adicionados automaticamente à interface do aplicativo.`;

    const messages: MessageData[] = [{ role: 'user', content: [{ text: input.query }] }];
    let routeOrigin: string | undefined;
    let routeDestination: string | undefined;
    let routePolyline: string | undefined;

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

      messages.push(llmResponse.message);

      if (!llmResponse.toolCalls || llmResponse.toolCalls.length === 0) {
        let mapUrl: string | undefined;
        if (routeOrigin && routeDestination) {
          mapUrl = `https://www.google.com/maps/dir/${encodeURIComponent(routeOrigin)}/${encodeURIComponent(routeDestination)}`;
        }

        let mapImageUrl: string | undefined;
        if (routePolyline) {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (apiKey) {
                mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x300&path=enc:${routePolyline}&key=${apiKey}`;
            }
        }

        return { 
            response: llmResponse.text ?? "Não foi possível obter uma resposta do assistente. Tente novamente.",
            mapUrl: mapUrl,
            mapImageUrl: mapImageUrl,
        };
      }
      
      const trafficToolCall = llmResponse.toolCalls.find(tc => tc.tool === 'getTrafficInfo');
      if (trafficToolCall && trafficToolCall.input) {
          if (!routeOrigin) routeOrigin = (trafficToolCall.input as any).origin;
          if (!routeDestination) routeDestination = (trafficToolCall.input as any).destination;
      }

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
            if (call.tool === 'getTrafficInfo' && (output as any).routePolyline) {
                routePolyline = (output as any).routePolyline;
            }
            return { call, output };
          } catch (e: any) {
            console.error(`Error executing tool ${call.tool}:`, e);
            return { call, output: { error: `A ferramenta falhou com o erro: ${e.message}` } };
          }
        })
      );
      
      const toolResponseMessage: MessageData = {
        role: 'tool',
        content: toolResults.map((result) => ({
          toolResponse: { name: result.call.tool, response: result.output },
        })),
      };
      messages.push(toolResponseMessage);
    }
    
    return { response: "O assistente não conseguiu chegar a uma resposta final." };
  }
);


export async function askCopilot(input: CopilotInput): Promise<CopilotOutput> {
  return copilotFlow(input);
}

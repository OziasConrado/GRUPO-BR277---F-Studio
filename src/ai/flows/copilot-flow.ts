
'use server';
/**
 * @fileOverview O copiloto de IA para o Rota Segura.
 *
 * - askCopilot - A função principal que um usuário chama com sua pergunta.
 * - CopilotInput - O tipo de entrada para askCopilot.
 * - CopilotOutput - O tipo de retorno para askCopilot.
 */

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import {
  CopilotInputSchema,
  type CopilotInput,
  CopilotOutputSchema,
  type CopilotOutput,
} from '@/ai/schemas/copilot-schemas';
import { type MessageData, type TextData, type MediaData } from '@genkit-ai/ai/model';

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
            routePolyline: z.string().optional().describe('A polilinha codificada da rota para gerar uma imagem de mapa.')
        })
    },
    async ({ origin, destination }) => {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
             return {
                travelTime: "desconhecido",
                distance: "desconhecida",
                summary: "A API do Google Maps não pôde ser contatada. A chave da API (GOOGLE_MAPS_API_KEY) não foi encontrada no ambiente de execução. Para desenvolvimento local, certifique-se de que ela está definida no arquivo .env.",
                routePolyline: undefined,
            };
        }

        try {
            const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.travelAdvisory,routes.polyline'
                },
                body: JSON.stringify({
                    origin: { address: origin },
                    destination: { address: destination },
                    travelMode: 'DRIVE',
                    computeAlternativeRoutes: false,
                    languageCode: "pt-BR",
                })
            });
            
            if (!response.ok) {
                console.error('Routes API error:', response.status, response.statusText);
                try {
                    const errorBody = await response.json();
                    console.error('Routes API error body:', errorBody);
                    const summary = errorBody?.error?.message || 'Falha na comunicação com a API de rotas.';
                    return { travelTime: "desconhecido", distance: "desconhecida", summary };
                } catch (e) {
                    return { travelTime: "desconhecido", distance: "desconhecida", summary: 'Falha na comunicação com a API de rotas.' };
                }
            }

            const data = await response.json();
            
            if (data.error) {
                 console.error('Routes API error:', data.error);
                 return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Erro ao buscar informações de rota: ${data.error.message || 'Erro de comunicação.'}`,
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

                const summary = route.travelAdvisory?.trafficReport?.summary || "Sem informações detalhadas de tráfego disponíveis.";
                
                const routePolyline = route.polyline?.encodedPolyline;

                return { travelTime, distance, summary, routePolyline };
            } else {
                 return {
                    travelTime: "desconhecido", distance: "desconhecida",
                    summary: `Não foi possível encontrar uma rota entre ${origin} e ${destination}.`
                };
            }
        } catch (error: any) {
            console.error('Routes API error:', error);
            return {
                travelTime: "desconhecido", distance: "desconhecida",
                summary: `Erro ao buscar informações de rota: ${error.message || 'Erro de comunicação.'}`
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
            const params = new URLSearchParams({
                query: `${query} em ${location}`,
                key: apiKey,
                language: 'pt-BR'
            });
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Places API request failed with status: ${response.status}`);
                return { places: [] };
            }

            const data = await response.json();

            if (data.status === 'OK') {
                return {
                    places: data.results.slice(0, 3).map((place: any) => ({
                        name: place.name,
                        address: place.formatted_address,
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
    const systemPrompt = `Você é o "Copiloto277", um assistente de IA amigável e especialista em informações de trânsito em tempo real para o Brasil. Sua missão é fornecer informações claras, concisas e úteis usando emojis para deixar a comunicação mais animada.

**Personalidade e Tom:**
- Seja amigável, prestativo e proativo. Comece com uma saudação como "Olá! 👋 Que bom que você está planejando sua viagem! Vamos ver como está a estrada."
- Use uma linguagem simples e direta.
- O tom deve ser sempre otimista e tranquilizador.

**Funções e Habilidades:**
- **Consulta de Rota:** Receba a origem e o destino do usuário (ex: "Curitiba para Londrina").
- **Condições de Trânsito:** Use a ferramenta \`getTrafficInfo\` para obter os dados. Sua resposta DEVE ser baseada SOMENTE nas informações retornadas pela ferramenta.

**Estrutura da Resposta (Siga EXATAMENTE este formato):**
1.  Saudação amigável e confirmação da rota.
2.  Apresente o **Tempo estimado de viagem** e a **Distância total**. Use negrito. Se a informação for "desconhecido" ou "desconhecida", diga "Não disponível no momento".
3.  Apresente a **Condição do trânsito:** usando o texto EXATO do campo 'summary' retornado pela ferramenta \`getTrafficInfo\`. Se o sumário for "Sem informações detalhadas de tráfego disponíveis.", apenas diga "O caminho parece estar livre, sem alertas de trânsito no momento. ✅".
4.  Finalize com a frase de segurança: "Lembre-se que as condições do trânsito podem mudar rapidamente. Dirija com segurança e boa viagem! 🛣️"

**IMPORTANTE:**
- **NÃO INVENTE INFORMAÇÕES.** Use apenas os dados das ferramentas. O campo 'summary' da ferramenta 'getTrafficInfo' é sua única fonte para as condições do trânsito.
- NÃO inclua o link do mapa na sua resposta de texto. O link e um mapa visual serão adicionados automaticamente à interface do aplicativo.`;

    const messages: MessageData[] = [{ role: 'user', content: [{ text: input.query }] }];
    let routeOrigin: string | undefined;
    let routeDestination: string | undefined;
    let routePolyline: string | undefined;

    for (let i = 0; i < 5; i++) {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-1.5-flash-latest'),
        messages: messages,
        tools: tools,
        system: systemPrompt,
      });

      if (llmResponse.message) {
        // Manually construct a valid MessageData object from the Message object.
        // The main difference is that `Message.content` is `Part[]` where `text` can be `undefined`,
        // while `MessageData.content` expects `ContentData` where `text` must be a `string`.
        const newContent = llmResponse.message.content
          .map((part) => {
            if (part.text !== undefined) {
              return { text: part.text };
            }
            if (part.media) {
              return { media: part.media };
            }
            // Filter out other part types like toolRequest/toolResponse for the history
            return null;
          })
          .filter((p): p is TextData | MediaData => p !== null);

        const newMessageData: MessageData = {
          role: llmResponse.message.role,
          content: newContent,
        };
        if (llmResponse.message.metadata) {
          newMessageData.metadata = llmResponse.message.metadata;
        }
        messages.push(newMessageData);
      }

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

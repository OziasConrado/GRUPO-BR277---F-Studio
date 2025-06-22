
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

export type { CopilotInput, CopilotOutput };

// Tool para obter informações de tráfego (com dados mock)
const getTrafficInfo = ai.defineTool(
    {
        name: 'getTrafficInfo',
        description: 'Obtém informações de trânsito em tempo real, incluindo tempo de viagem e um resumo das condições entre dois locais.',
        inputSchema: z.object({
            origin: z.string().describe('A cidade ou ponto de partida.'),
            destination: z.string().describe('A cidade ou ponto de destino.'),
        }),
        outputSchema: z.object({
            travelTime: z.string().describe('O tempo estimado de viagem, por exemplo, "1 hora e 30 minutos".'),
            summary: z.string().describe('Um resumo das condições da rota, incluindo acidentes, obras ou congestionamentos.'),
        })
    },
    async ({ origin, destination }) => {
        // MOCK IMPLEMENTATION - In a real app, call Google Maps API here
        console.log(`Buscando tráfego (MOCK) de ${origin} para ${destination}`);
        if (origin.toLowerCase().includes('curitiba') && destination.toLowerCase().includes('matinhos')) {
            return {
                travelTime: "1 hora e 45 minutos",
                summary: "O trânsito na BR-277 está intenso, com um ponto de lentidão próximo a Morretes devido a obras na pista. Fora isso, sem acidentes reportados."
            };
        }
        if (origin.toLowerCase().includes('são paulo') && destination.toLowerCase().includes('curitiba')) {
             return {
                travelTime: "Cerca de 6 horas",
                summary: "Na Régis Bittencourt (BR-116), o tráfego é moderado, mas flui bem. Há um trecho com neblina na serra, dirija com cuidado."
            };
        }
        return {
            travelTime: "desconhecido",
            summary: `Não consegui obter informações de tráfego para a rota entre ${origin} e ${destination}. Por favor, tente com cidades mais conhecidas.`
        };
    }
);

const copilotPrompt = ai.definePrompt({
    name: 'copilotPrompt',
    system: `Você é o Copiloto277, um assistente de IA amigável e prestativo para caminhoneiros e viajantes no aplicativo Rota Segura. Sua principal função é fornecer informações claras e concisas sobre rotas, trânsito e condições da estrada.
- Sempre que um usuário perguntar sobre uma rota entre dois pontos, use a ferramenta 'getTrafficInfo' para obter os dados mais recentes.
- Formate a resposta de forma natural e conversacional.
- Se não conseguir encontrar informações, seja honesto e peça ao usuário para tentar uma rota diferente ou fornecer mais detalhes.
- Mantenha as respostas curtas e diretas.`,
    tools: [getTrafficInfo],
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

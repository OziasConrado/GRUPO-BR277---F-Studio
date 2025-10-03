'use server';
/**
 * @fileOverview Um agente de IA para geração de imagens a partir de texto.
 *
 * - gerarImagem - Função que lida com o processo de geração de imagem.
 * - GerarImagemInput - O tipo de entrada para a função gerarImagem.
 * - GerarImagemOutput - O tipo de retorno para a função gerarImagem.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GerarImagemInputSchema,
  type GerarImagemInput,
  GerarImagemOutputSchema,
  type GerarImagemOutput,
} from '@/ai/schemas/gerar-imagem-schemas';

export type { GerarImagemInput, GerarImagemOutput };

export async function gerarImagem(input: GerarImagemInput): Promise<GerarImagemOutput> {
  return gerarImagemFlow(input);
}

const gerarImagemFlow = ai.defineFlow(
  {
    name: 'gerarImagemFlow',
    inputSchema: GerarImagemInputSchema,
    outputSchema: GerarImagemOutputSchema,
  },
  async (input) => {
    
    const { media, usage } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Crie uma imagem realista e de alta qualidade baseada na seguinte descrição: ${input.prompt}. A imagem não deve conter texto.`,
        config: {
          aspectRatio: '1:1', // Square image
        },
    });

    const revisedPrompt = usage?.promptTokenCount ? `(Prompt revisado pela IA com ${usage.promptTokenCount} tokens)` : undefined;
    
    if (!media.url) {
      throw new Error('A IA não retornou uma imagem. Tente novamente.');
    }

    return {
        imageUrl: media.url,
        revisedPrompt,
    };
  }
);

import { z } from 'zod';

export const GerarImagemInputSchema = z.object({
  prompt: z.string().min(5, "O prompt deve ter pelo menos 5 caracteres.").max(1000, "O prompt é muito longo."),
});

export type GerarImagemInput = z.infer<typeof GerarImagemInputSchema>;

export const GerarImagemOutputSchema = z.object({
  imageUrl: z.string().url().describe("A URL da imagem gerada como uma string data URI."),
  revisedPrompt: z.string().optional().describe("O prompt revisado usado pela IA para gerar a imagem."),
});

export type GerarImagemOutput = z.infer<typeof GerarImagemOutputSchema>;

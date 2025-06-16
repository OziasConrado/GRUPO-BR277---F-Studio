
import { z } from 'zod';

export const ToneEnum = z.enum(["Entusiasmado", "Informativo", "Urgente", "Divertido", "Profissional"]);

export const GerarPostsPromocionaisInputSchema = z.object({
  productName: z.string().min(1, "Nome do produto/serviço é obrigatório."),
  features: z.string().min(10, "Descreva as principais características/benefícios (mín. 10 caracteres)."),
  targetAudience: z.string().min(3, "Público-alvo é obrigatório."),
  tone: ToneEnum,
  includeHashtags: z.boolean().default(false),
  numVariations: z.number().min(1).max(3).default(1),
  productLink: z.string().url("Link inválido. Use o formato http:// ou https://").optional().or(z.literal('')),
  addEmojis: z.boolean().default(false),
  platform: z.string().optional().default("Geral") // Ex: Instagram, Facebook, LinkedIn, Geral
});
export type GerarPostsPromocionaisInput = z.infer<typeof GerarPostsPromocionaisInputSchema>;

export const GerarPostsPromocionaisOutputSchema = z.object({
  posts: z.array(
    z.object({
      text: z.string().describe("O texto do post promocional."),
      hashtags: z.array(z.string()).optional().describe("Uma lista de hashtags sugeridas, se solicitado."),
    })
  ).describe("Uma lista de variações de posts promocionais gerados."),
});
export type GerarPostsPromocionaisOutput = z.infer<typeof GerarPostsPromocionaisOutputSchema>;


import { z } from 'zod';

export const CopilotInputSchema = z.object({
  query: z.string().min(5, "Sua pergunta deve ter pelo menos 5 caracteres.").max(300, "Sua pergunta é muito longa."),
});
export type CopilotInput = z.infer<typeof CopilotInputSchema>;

export const CopilotOutputSchema = z.object({
  response: z.string(),
});
export type CopilotOutput = z.infer<typeof CopilotOutputSchema>;

'use server';

import { z } from 'zod';

export const CriarCobrancaAsaasInputSchema = z.object({
  plano: z.enum(["INTERMEDIARIO", "PREMIUM"]),
  businessId: z.string().min(1, "businessId é obrigatório."),
  ownerId: z.string().min(1, "ownerId é obrigatório."),
});
export type CriarCobrancaAsaasInput = z.infer<typeof CriarCobrancaAsaasInputSchema>;

export const CriarCobrancaAsaasOutputSchema = z.object({
  paymentUrl: z.string(),
});
export type CriarCobrancaAsaasOutput = z.infer<typeof CriarCobrancaAsaasOutputSchema>;

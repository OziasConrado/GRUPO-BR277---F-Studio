'use server';
/**
 * @fileOverview A Genkit flow to create a Stripe checkout session.
 *
 * - criarSessaoCheckout - A function that handles the checkout session creation process.
 * - CriarSessaoCheckoutInput - The input type for the criarSessaoCheckout function.
 * - CriarSessaoCheckoutOutput - The return type for the criarSessaoCheckout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

// Define o esquema de entrada para o fluxo
export const CriarSessaoCheckoutInputSchema = z.object({
  plano: z.enum(["INTERMEDIARIO", "PREMIUM"]),
  businessId: z.string().min(1, "businessId é obrigatório."),
});
export type CriarSessaoCheckoutInput = z.infer<typeof CriarSessaoCheckoutInputSchema>;

// Define o esquema de saída para o fluxo
export const CriarSessaoCheckoutOutputSchema = z.object({
  sessionId: z.string(),
});
export type CriarSessaoCheckoutOutput = z.infer<typeof CriarSessaoCheckoutOutputSchema>;

// IDs de preço de TESTE da sua conta Stripe.
const planPrices = {
  INTERMEDIARIO: 'price_1PWTy2FZ66hy1ES1gYn1sEyV',
  PREMIUM: 'price_1SMzQZFZ66hy1ES1KSm7S2ga',
};

// Exporta a função que será chamada pela API route
export async function criarSessaoCheckout(input: CriarSessaoCheckoutInput): Promise<CriarSessaoCheckoutOutput> {
  return criarSessaoCheckoutFlow(input);
}

// Define o fluxo do Genkit
const criarSessaoCheckoutFlow = ai.defineFlow(
  {
    name: 'criarSessaoCheckoutFlow',
    inputSchema: CriarSessaoCheckoutInputSchema,
    outputSchema: CriarSessaoCheckoutOutputSchema,
  },
  async (input) => {
    const { plano, businessId } = input;
    console.log('[Flow] Início da criação da sessão de checkout para o plano:', plano);

    // Pega a chave secreta do Stripe das variáveis de ambiente
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("[Flow] ERRO: Chave secreta da Stripe não está configurada.");
      throw new Error("A configuração de pagamento do servidor está incompleta.");
    }
    console.log('[Flow] Chave secreta da Stripe carregada com sucesso.');

    const stripe = new Stripe(stripeSecretKey);
    const priceId = planPrices[plano];
    const origin = 'https://grupobr277-v2-d85f5.web.app'; // URL de produção fixa

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card', 'boleto'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/guia-comercial?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/planos`,
        metadata: {
          businessId: businessId,
          plano: plano,
        }
      };

    console.log('[Flow] Preparando para criar sessão no Stripe com os parâmetros:', JSON.stringify(sessionParams, null, 2));

    try {
      const session = await stripe.checkout.sessions.create(sessionParams);
      
      if (!session.id) {
        throw new Error('Não foi possível criar a sessão de checkout do Stripe.');
      }
      
      console.log(`[Flow] Sessão criada com sucesso no Stripe: ${session.id}`);
      return { sessionId: session.id };

    } catch (err: any) {
      console.error('[Flow] ERRO CRÍTICO ao criar sessão no Stripe:', err);
      // Loga o erro inteiro para depuração completa
      console.error('[Flow] Detalhes completos do erro:', JSON.stringify(err, null, 2));
      throw new Error(err.message || 'Um erro inesperado ocorreu ao contatar o serviço de pagamento.');
    }
  }
);

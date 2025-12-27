
import { NextRequest, NextResponse } from 'next/server';
import { criarCobrancaAsaas } from '@/ai/flows/criar-cobranca-asaas-flow';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CheckoutRequestSchema = z.object({
  plano: z.enum(['INTERMEDIARIO', 'PREMIUM']),
  businessId: z.string(),
  ownerId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validation = CheckoutRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos.', details: validation.error.flatten() }, { status: 400 });
    }

    const { plano, businessId, ownerId } = validation.data;
    console.log('[Checkout API] - Recebida requisição para o plano:', plano, 'e businessId:', businessId);

    // Call the Genkit flow to create the Asaas charge
    const result = await criarCobrancaAsaas({
        plano,
        businessId,
        ownerId,
    });
    
    if (!result.paymentUrl) {
      throw new Error('Flow do Genkit não retornou uma URL de pagamento.');
    }

    console.log('[Checkout API] - URL de pagamento Asaas criada com sucesso via Flow:', result.paymentUrl);
    return NextResponse.json({ paymentUrl: result.paymentUrl });

  } catch (err: any) {
    console.error('[Checkout API] - Erro CRÍTICO na API de checkout:', err);
    // Ensure a proper error message is sent back
    const errorMessage = err.message || "Ocorreu um erro desconhecido no servidor.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export const maxDuration = 120; // 2 minutes

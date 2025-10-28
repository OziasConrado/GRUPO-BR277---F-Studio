'use server';

import { NextRequest, NextResponse } from 'next/server';
import { criarCobrancaAsaas } from '@/ai/flows/criar-cobranca-asaas-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plano, businessId, ownerId } = body;

    console.log('[Checkout API] - Recebida requisição para o plano:', plano, 'e businessId:', businessId);

    if (!plano || (plano !== 'INTERMEDIARIO' && plano !== 'PREMIUM')) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }
    if (!businessId) {
        return NextResponse.json({ error: 'ID do negócio é obrigatório' }, { status: 400 });
    }
    if (!ownerId) {
        return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Chama o Genkit flow para criar a cobrança na Asaas
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const maxDuration = 120; // 2 minutes

'use server';

import { NextRequest, NextResponse } from 'next/server';
import { criarSessaoCheckout } from '@/ai/flows/criar-sessao-checkout-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plano, businessId } = body;

    console.log('[Checkout API] - Recebida requisição para o plano:', plano, 'e businessId:', businessId);

    if (!plano || (plano !== 'INTERMEDIARIO' && plano !== 'PREMIUM')) {
      console.error('[Checkout API] - Erro: Plano inválido recebido.');
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    if (!businessId) {
        console.error('[Checkout API] - Erro: ID do negócio é obrigatório.');
        return NextResponse.json({ error: 'ID do negócio é obrigatório' }, { status: 400 });
    }

    // Chama o Genkit flow para criar a sessão
    const result = await criarSessaoCheckout({
        plano: plano,
        businessId: businessId,
    });
    
    if (!result.sessionId) {
      throw new Error('Flow do Genkit não retornou um sessionId.');
    }

    console.log('[Checkout API] - Sessão Stripe criada com sucesso via Flow:', result.sessionId);
    return NextResponse.json({ sessionId: result.sessionId });

  } catch (err: any) {
    console.error('[Checkout API] - Erro CRÍTICO na API de checkout:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { PlanType } from '@/types/guia-comercial';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Aumenta o tempo limite da função para 2 minutos
export const maxDuration = 120;

// IDs de preço de TESTE da sua conta Stripe.
const planPrices: Record<Exclude<PlanType, 'GRATUITO'>, string> = {
  INTERMEDIARIO: 'price_1SMzMoFZ66hy1ES1HUGnRSP1',
  PREMIUM: 'price_1SMzQZFZ66hy1ES1KSm7S2ga',
};

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

    const priceId = planPrices[plano];
    const mode = 'subscription'; // Ambos são assinaturas

    console.log(`[Checkout API] - Tentando criar sessão Stripe com priceId: ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.get('origin')}/guia-comercial?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/planos`,
      metadata: {
        businessId: businessId,
        plano: plano,
      }
    });

    console.log('[Checkout API] - Sessão Stripe criada com sucesso:', session.id);

    if (!session.id) {
        throw new Error('Não foi possível criar a sessão de checkout do Stripe.');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('[Checkout API] - Erro CRÍTICO na API de checkout:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

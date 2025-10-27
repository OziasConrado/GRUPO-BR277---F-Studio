
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { PlanType } from '@/types/guia-comercial';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// IMPORTANTE: Substitua estes valores pelos seus "Price IDs" reais do Stripe.
// Você pode encontrá-los no seu Dashboard do Stripe, na seção de Produtos.
const planPrices: Record<Exclude<PlanType, 'GRATUITO'>, string> = {
  INTERMEDIARIO: 'price_SEU_ID_DO_PLANO_INTERMEDIARIO', // Ex: price_1PGjJZFZ66hy1ES19y6PAu2O
  PREMIUM: 'price_SEU_ID_DO_PLANO_PREMIUM', // Ex: price_1PGjJkFZ66hy1ES1YgL4x1vC
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plano, businessId } = body;

    if (!plano || (plano !== 'INTERMEDIARIO' && plano !== 'PREMIUM')) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    if (!businessId) {
        return NextResponse.json({ error: 'ID do negócio é obrigatório' }, { status: 400 });
    }

    const priceId = planPrices[plano];
    const mode = 'subscription'; // Ambos são assinaturas

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

    if (!session.id) {
        throw new Error('Não foi possível criar a sessão de checkout do Stripe.');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Erro na API de checkout:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

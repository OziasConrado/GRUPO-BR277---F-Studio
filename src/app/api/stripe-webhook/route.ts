
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { firestore } from '@/lib/firebase/server';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { PlanType } from '@/types/guia-comercial';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// O segredo do webhook é lido das variáveis de ambiente.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('O segredo do webhook do Stripe não está configurado nas variáveis de ambiente.');
    }
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Lidar com o evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { businessId, plano } = session.metadata || {};
      
      if (!businessId || !plano) {
          console.error('Webhook Error: businessId ou plano faltando nos metadados da sessão', session.id);
          return NextResponse.json({ error: 'Metadata missing' }, { status: 400 });
      }

      try {
        if (!firestore) {
          throw new Error('Conexão com o Firestore não estabelecida no servidor.');
        }
        
        const businessRef = doc(firestore, 'businesses', businessId);
        
        let dataExpiracao: Date;
        const hoje = new Date();

        if(plano === 'INTERMEDIARIO') {
            dataExpiracao = new Date(hoje.setMonth(hoje.getMonth() + 6));
        } else if (plano === 'PREMIUM') {
            dataExpiracao = new Date(hoje.setFullYear(hoje.getFullYear() + 1));
        } else {
             // Por segurança, se não for um plano conhecido, não fazemos nada.
            console.warn(`Plano desconhecido "${plano}" recebido no webhook.`);
            return NextResponse.json({ received: true });
        }

        await updateDoc(businessRef, {
            statusPagamento: 'ATIVO',
            plano: plano as PlanType, // Garante que o tipo do plano seja atualizado
            stripeSubscriptionId: session.subscription,
            dataInicio: Timestamp.fromDate(new Date()),
            dataExpiracao: Timestamp.fromDate(dataExpiracao),
        });

        console.log(`Negócio ${businessId} atualizado para ATIVO com plano ${plano}.`);

      } catch (dbError: any) {
          console.error('Erro ao atualizar o Firestore:', dbError);
          // Retornar um erro 500 para que o Stripe tente reenviar o webhook.
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      break;
    
    // TODO: Adicionar lógica para outros eventos, como `customer.subscription.deleted` ou `customer.subscription.updated`
    // para lidar com cancelamentos e renovações.
    
    default:
      console.log(`Evento Stripe não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

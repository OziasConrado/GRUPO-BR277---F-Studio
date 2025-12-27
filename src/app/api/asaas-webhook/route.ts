import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/server';
import { add, type Duration } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Asaas Webhook] Recebido:', JSON.stringify(body, null, 2));

    // Validação de segurança (ex: verificar um token secreto) - Pule por agora, mas essencial para produção
    // const asaasToken = req.headers.get('asaas-webhook-token');
    // if (asaasToken !== process.env.ASAAS_WEBHOOK_SECRET) {
    //   console.warn('[Asaas Webhook] Token de webhook inválido.');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    if (body.event !== 'PAYMENT_RECEIVED' && body.event !== 'PAYMENT_CONFIRMED') {
      console.log(`[Asaas Webhook] Evento '${body.event}' ignorado.`);
      return NextResponse.json({ status: 'event ignored' });
    }

    const payment = body.payment;
    const businessId = payment.externalReference;
    
    if (!businessId) {
      console.warn('[Asaas Webhook] Erro: businessId (externalReference) não encontrado no payload.');
      return NextResponse.json({ error: 'External reference missing' }, { status: 400 });
    }

    // Identificar o plano a partir da descrição da cobrança
    const description = payment.description.toLowerCase();
    let plano: 'INTERMEDIARIO' | 'PREMIUM' | null = null;
    let duration: Duration;

    if (description.includes('intermediário')) {
      plano = 'INTERMEDIARIO';
      duration = { months: 6 };
    } else if (description.includes('premium')) {
      plano = 'PREMIUM';
      duration = { years: 1 };
    } else {
       console.warn(`[Asaas Webhook] Não foi possível determinar o plano pela descrição: "${payment.description}"`);
       return NextResponse.json({ error: 'Plan not identified' }, { status: 400 });
    }

    const businessRef = firestore!.collection('businesses').doc(businessId);
    const businessDoc = await businessRef.get();

    if (!businessDoc.exists) {
      console.error(`[Asaas Webhook] ERRO: Negócio com ID ${businessId} não encontrado no Firestore.`);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    const dataInicio = new Date();
    const dataExpiracao = add(dataInicio, duration);

    await businessRef.update({
      statusPagamento: 'ATIVO',
      plano: plano,
      dataInicio: dataInicio,
      dataExpiracao: dataExpiracao,
      paymentId: payment.id // Salva o ID do pagamento para referência
    });

    console.log(`[Asaas Webhook] Sucesso: Plano '${plano}' ativado para o negócio ${businessId}. Expira em: ${dataExpiracao.toLocaleDateString()}`);

    return NextResponse.json({ status: 'success' });

  } catch (err: any) {
    console.error('[Asaas Webhook] Erro CRÍTICO:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

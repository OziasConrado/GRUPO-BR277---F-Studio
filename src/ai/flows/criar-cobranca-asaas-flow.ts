/**
 * @fileOverview A Genkit flow to create an Asaas payment link.
 */

'use server';

import { ai } from '@/ai'; // Import the central AI instance
import { CriarCobrancaAsaasInputSchema, type CriarCobrancaAsaasInput, CriarCobrancaAsaasOutputSchema, type CriarCobrancaAsaasOutput } from '@/ai/schemas/criar-cobranca-asaas-schemas';
import axios from 'axios';
import { firestore } from '@/lib/firebase/server';

// Preços dos planos (valor em R$)
const planPrices = {
  INTERMEDIARIO: 83.40, 
  PREMIUM: 118.80,
};

// Mapeamento para descrição do plano
const planDescriptions = {
  INTERMEDIARIO: "Plano Intermediário (Semestral) - Guia Comercial BR277",
  PREMIUM: "Plano Premium (Anual) - Guia Comercial BR277",
};

// Define o fluxo do Genkit internamente (SEM EXPORT)
const criarCobrancaAsaasFlow = ai.defineFlow(
  {
    name: 'criarCobrancaAsaasFlow',
    inputSchema: CriarCobrancaAsaasInputSchema,
    outputSchema: CriarCobrancaAsaasOutputSchema,
  },
  async (input) => {
    const { plano, businessId, ownerId } = input;
    console.log('[Asaas Flow] Iniciando criação de cobrança para:', plano, 'Business:', businessId);

    const asaasApiKey = process.env.ASAAS_API_KEY;
    if (!asaasApiKey) {
      console.error("[Asaas Flow] ERRO: Chave de API da Asaas não configurada.");
      throw new Error("Configuração de pagamento do servidor incompleta.");
    }

    try {
      // 1. Buscar dados do cliente (usuário dono do negócio) no Firestore
      const userDocRef = firestore!.collection('users').doc(ownerId);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        throw new Error(`Usuário com ID ${ownerId} não encontrado no banco de dados.`);
      }
      const userData = userDoc.data();
      const customerName = userData?.displayName;
      const customerEmail = userData?.email;
      
      if (!customerName || !customerEmail) {
        throw new Error("Dados do usuário (nome, email) estão incompletos no perfil. Complete o perfil antes de continuar.");
      }

      console.log('[Asaas Flow] Dados do cliente obtidos:', { customerName, customerEmail });

      // 2. Criar ou buscar o cliente na Asaas
      let customerId: string;
      const findCustomerUrl = `https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(customerEmail)}`;
      const existingCustomerResponse = await axios.get(findCustomerUrl, {
        headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
      });

      if (existingCustomerResponse.data.data.length > 0) {
        customerId = existingCustomerResponse.data.data[0].id;
        console.log(`[Asaas Flow] Cliente encontrado na Asaas: ${customerId}`);
      } else {
        const createCustomerUrl = 'https://www.asaas.com/api/v3/customers';
        const newCustomerResponse = await axios.post(createCustomerUrl, {
          name: customerName,
          email: customerEmail,
          externalReference: ownerId, // Associa o cliente Asaas ao nosso ID de usuário
        }, {
          headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
        });
        customerId = newCustomerResponse.data.id;
        console.log(`[Asaas Flow] Cliente criado na Asaas: ${customerId}`);
      }

      // 3. Criar a cobrança
      const createPaymentUrl = 'https://www.asaas.com/api/v3/payments';
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

      const paymentData = {
        customer: customerId,
        billingType: "UNDEFINED", // Permite Boleto, Pix e Cartão
        value: planPrices[plano],
        dueDate: dueDate.toISOString().split('T')[0],
        description: planDescriptions[plano],
        externalReference: businessId, // Associa o pagamento ao nosso ID de negócio
      };
      
      console.log('[Asaas Flow] Enviando dados da cobrança para Asaas:', paymentData);
      const paymentResponse = await axios.post(createPaymentUrl, paymentData, {
        headers: { 'access_token': asaasApiKey, 'Content-Type': 'application/json' },
      });
      
      const paymentUrl = paymentResponse.data.invoiceUrl;
      if (!paymentUrl) {
        throw new Error('A Asaas não retornou uma URL de pagamento.');
      }
      
      console.log(`[Asaas Flow] Link de pagamento gerado com sucesso: ${paymentUrl}`);
      return { paymentUrl };

    } catch (err: any) {
      let errorMessage = 'Um erro inesperado ocorreu ao contatar o serviço de pagamento.';
      if (axios.isAxiosError(err) && err.response) {
        // Tenta extrair a mensagem de erro específica da Asaas
        const asaasError = err.response.data?.errors?.[0]?.description;
        console.error('[Asaas Flow] ERRO da API Asaas:', asaasError || JSON.stringify(err.response.data, null, 2));
        errorMessage = `Erro do sistema de pagamento: ${asaasError || JSON.stringify(err.response.data)}`;
      } else {
        console.error('[Asaas Flow] ERRO CRÍTICO ao criar cobrança:', err.message, err.stack);
        errorMessage = err.message;
      }
      // Lança o erro para que a API de checkout possa capturá-lo e enviá-lo ao cliente
      throw new Error(errorMessage);
    }
  }
);

// Exporta APENAS a função async que encapsula o flow
export async function criarCobrancaAsaas(input: CriarCobrancaAsaasInput): Promise<CriarCobrancaAsaasOutput> {
  return criarCobrancaAsaasFlow(input);
}

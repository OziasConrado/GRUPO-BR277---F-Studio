'use server';
/**
 * @fileOverview A Genkit flow to create an Asaas payment link.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/server'; // Use server-side firebase admin

// Define o esquema de entrada
export const CriarCobrancaAsaasInputSchema = z.object({
  plano: z.enum(["INTERMEDIARIO", "PREMIUM"]),
  businessId: z.string().min(1, "businessId é obrigatório."),
  ownerId: z.string().min(1, "ownerId é obrigatório."),
});
export type CriarCobrancaAsaasInput = z.infer<typeof CriarCobrancaAsaasInputSchema>;

// Define o esquema de saída
export const CriarCobrancaAsaasOutputSchema = z.object({
  paymentUrl: z.string(),
});
export type CriarCobrancaAsaasOutput = z.infer<typeof CriarCobrancaAsaasOutputSchema>;

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

// Exporta a função que será chamada pela API route
export async function criarCobrancaAsaas(input: CriarCobrancaAsaasInput): Promise<CriarCobrancaAsaasOutput> {
  return criarCobrancaAsaasFlow(input);
}

// Define o fluxo do Genkit
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
      const userDocRef = doc(firestore, 'Usuarios', ownerId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error(`Usuário com ID ${ownerId} não encontrado.`);
      }
      const userData = userDoc.data();
      const customerName = userData.displayName;
      const customerEmail = userData.email;
      // O CPF/CNPJ é obrigatório para Asaas, mas pode não estar no perfil inicial.
      // Vamos usar um placeholder ou buscar de um campo específico se existir.
      const customerCpfCnpj = userData.cpfCnpj || "00000000000"; 
      
      if (!customerName || !customerEmail) {
        throw new Error("Dados do usuário (nome, email) estão incompletos.");
      }

      console.log('[Asaas Flow] Dados do cliente obtidos:', { customerName, customerEmail });

      // 2. Criar ou buscar o cliente na Asaas
      let customerId: string;
      const findCustomerUrl = `https://www.asaas.com/api/v3/customers?email=${customerEmail}`;
      const existingCustomerResponse = await axios.get(findCustomerUrl, {
        headers: { 'access_token': asaasApiKey },
      });

      if (existingCustomerResponse.data.data.length > 0) {
        customerId = existingCustomerResponse.data.data[0].id;
        console.log(`[Asaas Flow] Cliente encontrado na Asaas: ${customerId}`);
      } else {
        const createCustomerUrl = 'https://www.asaas.com/api/v3/customers';
        const newCustomerResponse = await axios.post(createCustomerUrl, {
          name: customerName,
          email: customerEmail,
          cpfCnpj: customerCpfCnpj,
        }, {
          headers: { 'access_token': asaasApiKey },
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
        externalReference: businessId, // Vincula a cobrança ao ID do negócio
      };
      
      console.log('[Asaas Flow] Enviando dados da cobrança para Asaas:', paymentData);
      const paymentResponse = await axios.post(createPaymentUrl, paymentData, {
        headers: { 'access_token': asaasApiKey },
      });
      
      const paymentUrl = paymentResponse.data.invoiceUrl;
      if (!paymentUrl) {
        throw new Error('Asaas não retornou uma URL de pagamento.');
      }
      
      console.log(`[Asaas Flow] Link de pagamento gerado: ${paymentUrl}`);
      return { paymentUrl };

    } catch (err: any) {
      console.error('[Asaas Flow] ERRO CRÍTICO ao criar cobrança na Asaas:', err.response ? err.response.data : err.message);
      throw new Error(err.response?.data?.errors?.[0]?.description || 'Um erro inesperado ocorreu ao contatar o serviço de pagamento.');
    }
  }
);

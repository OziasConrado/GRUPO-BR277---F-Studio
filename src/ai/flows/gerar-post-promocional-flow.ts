
'use server';
/**
 * @fileOverview A promotional post generation AI agent.
 *
 * - gerarPostsPromocionais - A function that handles the promotional post generation process.
 * - GerarPostsPromocionaisInput - The input type for the gerarPostsPromocionais function.
 * - GerarPostsPromocionaisOutput - The return type for the gerarPostsPromocionais function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GerarPostsPromocionaisInputSchema,
  type GerarPostsPromocionaisInput,
  GerarPostsPromocionaisOutputSchema,
  type GerarPostsPromocionaisOutput
} from '@/ai/schemas/gerar-post-promocional-schemas';

export type { GerarPostsPromocionaisInput, GerarPostsPromocionaisOutput };

export async function gerarPostsPromocionais(input: GerarPostsPromocionaisInput): Promise<GerarPostsPromocionaisOutput> {
  return gerarPostsPromocionaisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gerarPostsPromocionaisPrompt',
  input: {schema: GerarPostsPromocionaisInputSchema},
  output: {schema: GerarPostsPromocionaisOutputSchema},
  prompt: `
    Você é um especialista em marketing digital e copywriting, mestre em criar posts promocionais altamente engajadores e eficazes para diversas redes sociais.

    Sua tarefa é criar {{numVariations}} variações de um post para promover o produto/serviço: "{{productName}}".

    Detalhes do Produto/Serviço:
    - Características/Benefícios Principais: {{{features}}}
    - Público-Alvo: {{{targetAudience}}}
    {{#if productLink}}
    - Link para o Produto/Serviço: {{{productLink}}} (Considere incluí-lo ou uma chamada para ação que direcione a ele).
    {{/if}}

    Diretrizes para o Post:
    - Tom da Mensagem: {{tone}}. Adapte a linguagem e o estilo para este tom.
    - Plataforma Alvo: {{platform}}. Se for específica (ex: Instagram, LinkedIn), ajuste o post para as melhores práticas dessa plataforma (extensão, estilo, etc.). Se for "Geral", crie um post versátil.
    {{#if addEmojis}}
    - Emojis: Inclua emojis relevantes e estrategicamente posicionados para aumentar o apelo visual e o engajamento. Não exagere.
    {{/if}}
    {{#if includeHashtags}}
    - Hashtags: Sugira de 3 a 5 hashtags relevantes e populares para maximizar o alcance.
    {{/if}}
    - Cada post deve ser conciso, direto ao ponto e persuasivo.
    - Destaque os benefícios mais atraentes para o público-alvo.
    - Crie um forte chamado à ação (CTA), se apropriado.

    Formato da Resposta:
    Gere EXATAMENTE {{numVariations}} variações.
    A saída DEVE ser um objeto JSON contendo uma chave "posts".
    A chave "posts" DEVE ser um array de objetos.
    Cada objeto no array "posts" DEVE ter uma chave "text" (string) com o conteúdo do post.
    Se hashtags forem solicitadas, cada objeto em "posts" DEVE ter uma chave "hashtags" (array de strings).
  `,
});

const gerarPostsPromocionaisFlow = ai.defineFlow(
  {
    name: 'gerarPostsPromocionaisFlow',
    inputSchema: GerarPostsPromocionaisInputSchema,
    outputSchema: GerarPostsPromocionaisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.posts || output.posts.length === 0) {
        // Fallback ou tratamento de erro se a IA não retornar posts
        // ou não seguir o formato esperado.
        console.warn("AI did not return expected posts format or returned empty posts. Input:", input);
        // Tentar um prompt mais simples como fallback
        const fallbackInput = {
            productName: input.productName,
            features: input.features,
            targetAudience: input.targetAudience,
            tone: input.tone,
            includeHashtags: false,
            numVariations: 1,
            addEmojis: false,
            platform: "Geral"
        };
        const fallbackPrompt = ai.definePrompt({
            name: 'gerarPostPromocionalSimplesPrompt',
            input: { schema: z.object({ productName: z.string(), features: z.string()}) },
            output: { schema: z.object({ post: z.string() }) },
            prompt: `Crie um post curto para promover {{productName}} com as seguintes características: {{features}}.`,
        });
        const {output: fallbackOutput} = await fallbackPrompt({productName: input.productName, features: input.features});
        if(fallbackOutput?.post) {
            return { posts: [{ text: fallbackOutput.post }] };
        }
        // Se o fallback também falhar, retornar uma mensagem de erro estruturada.
        return { posts: [{ text: "Desculpe, não consegui gerar o post promocional no momento. Tente refazer sua solicitação com mais detalhes ou um pouco diferente."}] };
    }
    return output;
  }
);

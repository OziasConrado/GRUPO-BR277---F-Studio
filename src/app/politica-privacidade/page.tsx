'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para a página inicial
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Política de Privacidade</CardTitle>
          <CardDescription>Última atualização: 28 de setembro de 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <p>
            Bem-vindo ao Feed Interativo GRUPO BR277 (doravante “Serviço” ou “Feed”). Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas quando você utiliza nosso Serviço.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Informações que Coletamos</h2>
            <p className="mb-2">Coletamos informações para fornecer e melhorar nosso Serviço para você.</p>
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <div>
                <h3 className="font-semibold">Informações fornecidas por você:</h3>
                <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
                  <li><strong>Autenticação com Conta Google:</strong> Coletamos as informações que você autoriza o Google a compartilhar conosco, que podem incluir seu nome, endereço de e-mail e URL da foto do perfil.</li>
                  <li><strong>Conteúdo Gerado pelo Usuário:</strong> Coletamos o conteúdo que você cria e publica no Feed, incluindo postagens de texto, imagens que você carrega e comentários que você faz.</li>
                  <li><strong>Sinalizações de Conteúdo:</strong> Coletamos o motivo da sinalização e quaisquer detalhes adicionais que você fornecer.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Informações coletadas automaticamente:</h3>
                <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
                  <li><strong>Dados de Uso do Firebase:</strong> Utilizamos os serviços do Firebase (Google) para autenticação, armazenamento de dados (Firestore) e armazenamento de arquivos (Storage). O Firebase pode coletar automaticamente certos dados sobre seu dispositivo e uso do serviço. Para mais informações, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade do Google</a>.</li>
                  <li><strong>Preferências de Interface:</strong> Podemos armazenar suas preferências, como a escolha do tema (claro/escuro), localmente em seu navegador (usando LocalStorage) para melhorar sua experiência.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Como Usamos Suas Informações</h2>
            <p>Usamos as informações que coletamos para:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>Fornecer, operar e manter nosso Serviço.</li>
              <li>Permitir que você crie uma conta e faça login.</li>
              <li>Permitir que você crie, publique e interaja com conteúdo (postagens, comentários, reações).</li>
              <li>Exibir seu nome e foto do perfil (se fornecidos pelo Google) junto com suas postagens e comentários.</li>
              <li>Gerenciar e moderar o conteúdo, incluindo o processamento de sinalizações.</li>
              <li>Melhorar e personalizar sua experiência no Feed.</li>
              <li>Comunicarmo-nos com você, se necessário (por exemplo, para suporte ou informações importantes sobre o Serviço).</li>
              <li>Garantir a segurança e a integridade do nosso Serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Compartilhamento de Suas Informações</h2>
            <p>Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes circunstâncias:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li><strong>Com Outros Usuários do Feed:</strong> Seu nome de perfil, foto de perfil (se aplicável) e o conteúdo que você publica (postagens, comentários) são visíveis para outros usuários do Feed.</li>
              <li><strong>Com Provedores de Serviço (Firebase/Google):</strong> Usamos o Firebase/Google para fornecer funcionalidades essenciais do nosso Serviço. Eles têm acesso às informações necessárias para realizar esses serviços, mas são obrigados a não divulgá-las ou usá-las para qualquer outra finalidade.</li>
              <li><strong>Por Obrigações Legais:</strong> Poderemos divulgar suas informações se formos obrigados por lei, intimação, ordem judicial ou outro processo legal, ou se acreditarmos de boa fé que a divulgação é necessária para proteger nossos direitos, sua segurança ou a segurança de outros, investigar fraudes ou responder a uma solicitação governamental.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Segurança de Suas Informações</h2>
            <p>
              Empregamos medidas de segurança para proteger suas informações contra acesso, alteração, divulgação ou destruição não autorizados. Usamos os recursos de segurança fornecidos pelo Firebase. No entanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Seus Direitos (LGPD)</h2>
            <p>Sobre a Lei Geral de Proteção de Dados (LGPD), você tem certos direitos em relação às suas informações pessoais, incluindo:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>O direito de acesso.</li>
              <li>O direito de retificação.</li>
              <li>O direito de exclusão (em certas circunstâncias).</li>
              <li>O direito de restringir o processamento.</li>
              <li>O direito à portabilidade dos dados.</li>
              <li>O direito de se opor ao processamento.</li>
            </ul>
            <p className="mt-2 text-sm">Para exercer esses direitos, entre em contato conosco através do e-mail: <a href="mailto:oziasconrado@opaatec.com.br" className="text-primary hover:underline">oziasconrado@opaatec.com.br</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Retenção de Dados</h2>
            <p>
              Reteremos suas informações pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei. As postagens e comentários que você cria podem permanecer no Serviço mesmo após o encerramento da sua conta, a menos que você solicite a exclusão ou nós os removamos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Crianças</h2>
            <p>
              Nosso Serviço não se destina a crianças menores de 13 anos (ou a idade mínima aplicável em sua jurisdição). Não coletamos intencionalmente informações pessoais de crianças. Se você acredita que coletamos informações de uma criança, entre em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Alterações a Esta Política de Privacidade</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contato</h2>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:</p>
            <p className="font-medium">E-mail: <a href="mailto:oziasconrado@opaatec.com.br" className="text-primary hover:underline">oziasconrado@opaatec.com.br</a></p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
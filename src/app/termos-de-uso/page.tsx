'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TermosDeUsoPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para a página inicial
      </Link>

      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Termos de Uso (Feed BR277)</CardTitle>
          <CardDescription>Última atualização: 28 de setembro de 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <p>
            Bem-vindo ao Feed Interativo GRUPO BR277 (doravante “Serviço” ou “Feed”). Ao acessar ou usar nosso Serviço, você concorda em cumprir e estar vinculado a estes Termos de Uso (“Termos”). Se você não concordar com estes Termos, não utilize o Serviço.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-2">1. Descrição do Serviço</h2>
            <p>
              O Feed BR277 é uma plataforma interativa que permite aos usuários compartilhar e visualizar atualizações sobre o trânsito, interagir com outros usuários, entre outras possibilidades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Elegibilidade e Contas de Usuário</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Para acessar certas funcionalidades do Serviço, você precisará se registrar e criar uma conta usando o login com sua conta Google.</li>
              <li>Você é responsável por manter a confidencialidade das informações da sua conta e por todas as atividades que ocorram sob sua conta.</li>
              <li>Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</li>
              <li>Você deve ter pelo menos 13 anos de idade (ou a idade mínima aplicável em sua jurisdição) para usar o Serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Conduta do Usuário e Conteúdo</h2>
            <p>Você concorda em não usar o Serviço para:</p>
            <ul className="list-disc list-inside space-y-2 mt-2 text-sm">
              <li>Publicar ou transmitir qualquer conteúdo que seja ilegal, prejudicial, ameaçador, abusivo, assediante, difamatório, vulgar, obsceno, odioso, racialmente, etnicamente ou de outra forma questionável.</li>
              <li>Publicar informações falsas, enganosas ou imprecisas.</li>
              <li>Violar os direitos de propriedade intelectual de terceiros.</li>
              <li>Publicar spam, correntes, esquemas de pirâmide ou qualquer outra forma de solicitação não autorizada.</li>
              <li>Personificar qualquer pessoa ou entidade, ou declarar falsamente ou deturpar sua afiliação a uma pessoa ou entidade.</li>
              <li>Interferir ou interromper o Serviço ou servidores ou redes conectadas ao Serviço.</li>
              <li>Coletar ou armazenar dados pessoais sobre outros usuários sem o consentimento deles.</li>
              <li>Violar quaisquer leis ou regulamentos aplicáveis.</li>
            </ul>
            <p className="mt-2 text-sm">
              Reservamo-nos o direito, mas não a obrigação, de monitorar, remover ou editar conteúdo que, a nosso exclusivo critério, viole estes Termos ou seja de outra forma questionável, sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Propriedade do Conteúdo</h2>
            <div className="space-y-2">
              <p><strong>Seu Conteúdo:</strong> Você retém todos os direitos de propriedade sobre o conteúdo que você cria, publica ou exibe no ou através do Serviço (“Seu Conteúdo”). Ao publicar Seu Conteúdo, você nos concede uma licença mundial, não exclusiva, isenta de royalties, sublicenciável e transferível para usar, reproduzir, distribuir, preparar trabalhos derivados, exibir e executar Seu Conteúdo em conexão com o Serviço e nossos negócios.</p>
              <p><strong>Nosso Conteúdo:</strong> O Serviço e todo o seu conteúdo original (excluindo o conteúdo fornecido pelos usuários), recursos e funcionalidades são e permanecerão propriedade exclusiva do (GRUPO BR277) e seu licenciador (oPaaTec).</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Sinalização e Moderação de Conteúdo</h2>
             <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Oferecemos ferramentas para que os usuários possam sinalizar conteúdo que considerem violar estes Termos.</li>
                <li>Analisaremos as sinalizações e tomaremos as medidas apropriadas, que podem incluir a remoção do conteúdo, aviso ao usuário ou suspensão/encerramento da conta, a nosso exclusivo critério.</li>
                <li>Não garantimos que todo o conteúdo sinalizado será removido ou que qualquer ação específica será tomada.</li>
             </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Direitos de Propriedade Intelectual</h2>
            <p>
              Respeitamos os direitos de propriedade intelectual de terceiros. Se você acredita que seu trabalho protegido por direitos autorais foi copiado de uma forma que constitui violação de direitos autorais e está acessível no Serviço, notifique-nos através do e-mail: <a href="mailto:oziasconrado@opaatec.com.br" className="text-primary hover:underline">oziasconrado@opaatec.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Isenção de Garantias</h2>
            <p className="italic">
              O SERVIÇO É FORNECIDO “COMO ESTÁ” E “CONFORME DISPONÍVEL”, SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A, GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM DETERMINADO FIM, NÃO VIOLAÇÃO OU CURSO DE DESEMPENHO. NÃO GARANTIMOS QUE O SERVIÇO FUNCIONARÁ ININTERRUPTAMENTE, SEGURO OU DISPONÍVEL EM QUALQUER MOMENTO OU LOCAL ESPECÍFICO; QUE QUAISQUER ERROS OU DEFEITOS SERÃO CORRIGIDOS; QUE O SERVIÇO ESTÁ LIVRE DE VÍRUS OU OUTROS COMPONENTES PREJUDICIAIS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Limitação de Responsabilidade</h2>
            <p>EM NENHUMA CIRCUNSTÂNCIA O GRUPO BR277, NEM SEUS DIRETORES, FUNCIONÁRIOS, PARCEIROS, AGENTES, FORNECEDORES OU AFILIADOS, SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO, SEM LIMITAÇÃO, PERDA DE LUCROS, DADOS, USO, BOA VONTADE OU OUTRAS PERDAS INTANGÍVEIS, RESULTANTES DE SEU ACESSO OU USO OU INCAPACIDADE DE ACESSAR OU USAR O SERVIÇO.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contato</h2>
            <p>Se você tiver alguma dúvida sobre este Termos de Uso, entre em contato conosco:</p>
            <p className="font-medium">E-mail: <a href="mailto:oziasconrado@opaatec.com.br" className="text-primary hover:underline">oziasconrado@opaatec.com.br</a></p>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}

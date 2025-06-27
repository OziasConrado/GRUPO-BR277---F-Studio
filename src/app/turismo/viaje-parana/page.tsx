
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";

interface RegionData {
  imageUrl: string;
  imageHint: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

const regions: RegionData[] = [
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Frotas-do-pinh%C3%A3o.webp?alt=media',
    imageHint: 'Paisagem com araucárias representando as Rotas do Pinhão',
    title: 'Rotas do Pinhão',
    subtitle: 'UM MUNDO DE OPÇÕES E O PINHÃO COMO ANFITRIÃO',
    description: 'Que tal viajar pelo mundo dentro do Paraná? Isso é possível visitando a região Rotas do Pinhão. O lugar, que compreende Curitiba e grande parte da Região Metropolitana, tem forte influência da imigração europeia, principalmente polonesa, ucraniana, italiana e alemã. Traços distintivos das culturas mineira, paulista e do tropeirismo também ajudam a formar um caleidoscópio de sotaques, sabores e tradições.\n\nA convivência harmônica entre o ritmo frenético da metrópole e o bucolismo das áreas rurais é um atrativo à parte e oferece inúmeras opções de turismo, do cultural ao de aventura, do religioso ao rural.\n\nA culinária? É tanta comida boa, de tantas partes do mundo, que fica difícil escolher o que pedir ou manter a dieta. São muitas opções! Algumas delas temperadas com o sabor inconfundível de um dos maiores patrimônios gastronômicos do Paraná – o pinhão.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Rotas-do-Pinhao',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Flitoral-do-paran%C3%A1.webp?alt=media',
    imageHint: 'Praia do litoral do Paraná',
    title: 'Litoral do Paraná',
    subtitle: 'PRAIAS, ILHAS E MUITA HISTÓRIA PARA CONTAR',
    description: 'São 125 praias e balneários com areias brancas, águas mornas e limpas. Destinos na temperatura certa para a diversão, perfeitos para quem curte o sossego. As mais de 50 ilhas são um caso à parte, verdadeiros paraísos com natureza preservada.\n\nA vida noturna é bem movimentada, com bistrôs, restaurantes e música ao vivo nos bares e baladas. Sobram opções para se divertir. Hotéis e pousadas ao longo da costa dão todo o suporte para o turista.\n\nSeja qual for a sua praia, o seu destino está aqui! Venha viver tudo o que o Litoral do Paraná pode oferecer!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Litoral-do-Parana',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fcampos-gerais.webp?alt=media',
    imageHint: 'Cânion Guartelá nos Campos Gerais',
    title: 'Campos Gerais',
    subtitle: 'A MAGIA E BELEZA DOS CENÁRIOS NATURAIS',
    description: 'Visitar os municípios da região turística paranaense dos Campos Gerais é se encantar com as maravilhas que a natureza proporciona. Entre áreas verdes de preservação, cânions e cachoeiras, o turista terá muitos momentos de lazer e contemplação junto à família e amigos.\n\nNão se esqueça de conhecer também os templos religiosos e saborear as delícias gastronômicas; assim, você aproveita a região em uma experiência completa.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Campos-Gerais',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fterra-dos-pinheirais.webp?alt=media',
    imageHint: 'Pinheirais no Paraná',
    title: 'Terra dos Pinheirais',
    subtitle: 'AS CORES E SABORES DA CULTURA EUROPEIA NA TERRA DOS PINHEIRAIS',
    description: 'Que tal relaxar em um clima agradável, cercado de cultura e ao som de rios caudalosos que deságuam em magníficas cachoeiras? Gostou da ideia? Então os municípios da região turística paranaense Terra dos Pinheirais não podem faltar no seu próximo roteiro de viagens.\n\nSeja no campo ou na cidade, a história dos colonizadores europeus está eternizada na culinária, arquitetura, templos religiosos e museus. O turista pode ainda apreciar a rica cultura trazida pelos pioneiros nas festividades e feiras agroindustriais. Não perca tempo, venha conhecer a região e prepare-se para uma experiência memorável.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Terra-dos-Pinheirais',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fsul-do-paran%C3%A1.webp?alt=media',
    imageHint: 'Paisagem do Sul do Paraná',
    title: 'Sul do Paraná',
    subtitle: 'TRADIÇÃO, PRODUTIVIDADE E BELEZAS NATURAIS',
    description: 'As regiões turísticas do Paraná destacam toda a diversidade natural, cultural e étnica presentes em nosso estado. Definitivamente, a Região Sul do Paraná não foge à regra!\n\nO turismo cultural e histórico apresentam ao viajante uma enorme riqueza de costumes e eventos, resgatando memórias e mantendo as tradições vivas.\n\nAlém disso, as belezas naturais também são destaque dessa região, bem como templos religiosos e grandes festas e festivais, com comidas e bebidas regionais. Se você aprecia viagens tranquilas e inesquecíveis, chegou a hora de descobrir toda a riqueza da Região Sul do Paraná!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Sul-do-Parana',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fnorte-pioneiro.webp?alt=media',
    imageHint: 'Plantação de café no Norte Pioneiro',
    title: 'Norte Pioneiro',
    subtitle: 'NATUREZA, CULTURA E PIONEIRISMO EM HARMONIA PARA ENCANTAR VOCÊ',
    description: 'Seguindo o cheirinho do café, chega-se ao Norte Pioneiro. Localizada na divisa com São Paulo, a região transformou o grão em esteio da economia e símbolo da história e da cultura locais. Graças à atividade cafeeira, foi ainda uma das portas de entrada para a colonização do estado.\n\nA mesma natureza que abençoou as terras com a fertilidade que gerou riqueza também deu vida a paisagens que se tornaram verdadeiros cartões-postais e impulsionaram o turismo regional. São rios, cachoeiras, represas, termas e muitas áreas verdes, que atraem inúmeros turistas durante todo o ano.\n\nMas nem só de paraísos naturais vive o Norte Pioneiro. A saga do café e a reunião de diferentes povos, como paulistas, mineiros, italianos e japoneses, originou um grande patrimônio cultural manifestado no dia a dia e eternizado em museus e obras arquitetônicas.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Norte-Pioneiro',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fnorte-do-paran%C3%A1.webp?alt=media',
    imageHint: 'Catedral de Maringá no Norte do Paraná',
    title: 'Norte do Paraná',
    subtitle: 'DIVERSÃO E NEGÓCIOS O AGUARDAM NO NORTE DO PARANÁ',
    description: 'Seja para apreciar belas paisagens ou frequentar eventos de negócios, nos municípios da região turística Norte do Paraná você terá ótimas oportunidades de estreitar os laços comerciais e desfrutar de locais magníficos para descanso.\n\nNão perca tempo e inclua nas próximas viagens as cidades dessa região que abriga a maior parte da Rota do Café. De cachoeiras a templos religiosos, tudo isso regado à boa comida, as atividades agradarão a toda família.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Norte-do-Parana',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fvale-do-iva%C3%AD.webp?alt=media',
    imageHint: 'Rio Ivaí',
    title: 'Vale do Ivaí',
    subtitle: 'DA CALMARIA À EMOÇÃO',
    description: 'Lugar de fé e trabalho, o Vale do Ivaí é um importante destino de turismo religioso, rural e de aventura. Com santuários, monumentos e templos, a região atrai fiéis para momentos de paz e reflexão. Também tem belas e vastas áreas verdes e uma cultura rica, que conserva memórias de um passado de prosperidade garantida pelo “ouro verde” - o café.\n\nMas a mesma natureza que gera riqueza e inspira contemplação e tranquilidade também convida à aventura. Com muitas cachoeiras e formações rochosas, o Vale do Ivaí oferece momentos de adrenalina na terra, na água e no ar. Tem de tudo por aqui! Venha conhecer!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Vale-do-Ivai',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fentre-matas-morros-e-rios.webp?alt=media',
    imageHint: 'Morros e rios da região',
    title: 'Entre Matas, Morros e Rios',
    subtitle: 'AS BELEZAS NATURAIS PELOS CAMINHOS HISTÓRICOS',
    description: 'Procurando por locais tranquilos para relaxar, que resgatem as tradições e tenham belas paisagens? Nas cidades da região turística paranaense Entre Matas, Morros e Rios, você encontra tudo isso e muito mais. Nelas o turista pode visitar espaços religiosos, museus que contam a história dos pioneiros, eventos tradicionais com muita comida típica e, claro, maravilhas naturais como cachoeiras e trilhas para caminhada.\n\nA peregrinação do Monge João Maria de Jesus, que transitou pelo Sul do Brasil nos séculos XIX e XX, é retratada nos municípios em atividades e espaços religiosos. Em relação à história do estado, vale destacar o Caminho do Peabiru, trajeto lendário que ligava a Cordilheira dos Andes ao Oceano Atlântico, cujos vestígios podem ser encontrados em diversas cidades da região.\n\nNão importa se o passeio é sozinho, com a família ou ao lado de amigos; muitas aventuras e belos cliques o aguardam nesse roteiro inesquecível.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Entre-Matas-Morros-e-Rios',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Flagos-e-colinas.webp?alt=media',
    imageHint: 'Lagos da região de usinas hidrelétricas',
    title: 'Lagos e Colinas',
    subtitle: 'NOS RIOS DA MEMÓRIA',
    description: 'Às margens do rio Iguaçu, a região dos Lagos e Colinas é conhecida pelas inúmeras usinas hidrelétricas que impulsionam a economia dos municípios. Mas, se a força das águas aponta para o futuro, o passado local está bem preservado em museus e acervos, que se encarregam de manter viva a memória do lugar.\n\nNesse jogo entre passado e futuro, as belezas naturais são como um presente aos visitantes. Ao mesmo tempo em que encantam pelas paisagens, lagos e balneários são muito procurados para atividades náuticas.\n\nTem ainda turismo religioso, eventos variados e uma gastronomia de dar água na boca! Venha e confira!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Lagos-e-Colinas',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fvale-do-igua%C3%A7u.webp?alt=media',
    imageHint: 'Vale do Rio Iguaçu',
    title: 'Vales do Iguaçu',
    subtitle: 'DAS FESTIVIDADES ÀS BELAS PAISAGENS',
    description: 'Se você procura por diversão, boa comida e cultura, visitar os municípios da região turística paranaense Vales do Iguaçu renderá ótimas memórias a você. O clima frio e as belas paisagens proporcionadas pelo rio Iguaçu atraem durante o ano turistas de diversas partes do país.\n\nTraços da cultura indígena, italiana e gaúcha estão presentes nos costumes da região. Vale destacar também as festividades locais regadas a muita música e culinária típica.\n\nVenha conferir as atrações dessa região, localizada no Sudoeste paranaense, e prepare-se para registrar nos cliques momentos inesquecíveis.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Vales-do-Iguacu',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fencantos-dos-ipes.webp?alt=media',
    imageHint: 'Ipês floridos em Maringá',
    title: 'Encanto dos Ipês',
    subtitle: 'ABERTA AO PÚBLICO, DURANTE O ANO INTEIRO',
    description: 'Capitaneada por Maringá, considerada a melhor cidade para ser viver no Brasil, a região Encantos dos Ipês se destaca pela riqueza histórica, pela beleza das floradas da árvore símbolo, pelo povo acolhedor e pela privilegiada localização geográfica. O conjunto de 31 municípios oferece uma paisagem, onde convivem, de forma sustentável, o progresso socioeconômico e a preservação e conservação da natureza.\n\nAo transitar por este cenário, o turista encontra espaço para contemplar igrejas, santuários, e templos famosos pela grandiosidade e requinte da arquitetura; para praticar esportes; para fazer negócios; para provar um amplo cardápio gastronômico e degustar as mais expressivas cervejas artesanais premiadas do País; além de opções de lazer e para as famílias que desejam estar em contato direto com as raízes, a tradição, e os sabores do campo. A região é fértil, empreendedora, inovadora e inclusiva. Aberta ao público, durante o ano inteiro.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Encanto-dos-Ipes',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fecoaventuras.webp?alt=media',
    imageHint: 'Aventura em meio à natureza',
    title: 'Ecoaventuras',
    subtitle: 'VIAJE E SINTA-SE EM CASA',
    description: 'Belezas e riquezas naturais, culinária para todos os gostos e muita diversidade religiosa e cultural. Com atrativos para os mais diversos perfis de visitantes, a região Ecoaventuras, Histórias e Sabores proporciona aquela deliciosa sensação de viajar sem sair de casa, já que tudo - a comida, a hospedagem, o povo - tem aquele gostinho de aconchego e familiaridade. É como se estivéssemos mesmo na casa da gente. Não perca essa experiência singular!',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Ecoaventuras-Historias-e-Sabores',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Friquezas-do-oeste.webp?alt=media',
    imageHint: 'Campo de soja no Oeste do Paraná',
    title: 'Riquezas do Oeste',
    subtitle: 'DA RIQUEZA DO AGRONEGÓCIO À MAGIA DAS FLORES E FESTAS',
    description: 'Conhecer os municípios da região turística paranaense Riquezas do Oeste é se encantar com a hospitalidade em cada parada. Os recantos naturais transmitem a paz e tranquilidade da vida no campo, as festas resgatam a cultura local com muita descontração e alegria e as agroindústrias familiares ressaltam o potencial econômico regional ao mesmo tempo em que propiciam ao turista vivenciar a rotina de trabalho.\n\nVenha prestigiar o que de melhor cada lugar tem a oferecer e aproveite para degustar as maravilhas gastronômicas entre um clique e outro.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Riquezas-do-Oeste',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fcataratas-do-igua%C3%A7u.webp?alt=media',
    imageHint: 'Cataratas do Iguaçu',
    title: 'Cataratas do Iguaçu',
    subtitle: 'DA BELEZA DAS ÁGUAS ÀS MARAVILHAS CULTURAIS',
    description: 'Está planejando um roteiro nacional de viagem? Então não deixe de colocar na lista os passeios pela região paranaense das Cataratas do Iguaçu e Caminhos ao Lago de Itaipu, local de belezas naturais e riqueza cultural.\n\nAs águas dos rios Paraná e Iguaçu, do aquífero Botucatu, e do Lago de Itaipu cortam o território e tornam-se protagonistas nas inúmeras opções de lazer disponíveis. Nelas é possível pescar, praticar esportes radicais e náuticos, sem falar nos seus trechos que passam pelos parques e áreas de preservação ambiental abertos a visitação.\n\nVale a pena conhecer essa região repleta de boa gastronomia, lindas paisagens e manifestações artísticas e culturais; é diversão para todas as idades.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Cataratas-do-Iguacu-e-Caminhos-ao-Lago-de-Itaipu',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fcintur%C3%A3o-verde.webp?alt=media',
    imageHint: 'Área verde no noroeste do Paraná',
    title: 'Cinturão Verde',
    subtitle: 'DA CALMARIA À EMOÇÃO',
    description: 'Localizada no Noroeste do Paraná, a acolhedora região Cinturão Verde se destaca pelas belezas naturais e a vocação de sua gente para o empreendedorismo e hospitalidade. Seus 11 municípios contam com maravilhas ambientais, charme rural, atividades ao ar livre, espiritualidade e produtos de fabricação própria, rendendo aos visitantes experiências incríveis, lindas fotografias e ótimas compras, em qualquer época do ano.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Cinturao-Verde',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fencontro-das-aguas-e-biomas.webp?alt=media',
    imageHint: 'Encontro dos rios Paraná e Paranapanema',
    title: 'Encontro das Águas',
    subtitle: 'PRAIAS DE ÁGUA DOCE, CORREDOR DE AVENTURA, GASTRONOMIA E CULTURA',
    description: 'Localizado no Noroeste do Paraná, o Encontro das Águas e Biomas é um polo turístico de lazer, gastronomia, aventura e cultura. O nome tem origem nos encontros dos rios Paranapanema e rio Ivaí com o rio Paraná e pela diversidade de seu ecossistema, o encontro dos biomas como: Mata Atlântica, Pantanal e Cerrado.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Encontro-das-Aguas-e-Biomas',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Faguas-do-arenito-caiu%C3%A1.webp?alt=media',
    imageHint: 'Rio no noroeste do Paraná',
    title: 'Águas do Arenito Caiuá',
    subtitle: 'O CANTO DAS ÁGUAS DO NOROESTE DO PARANÁ',
    description: 'O som das águas transmite poesia e embala o coração de moradores e turistas. Banhada pelos rios Paraná e Paranapanema, a Região Noroeste tem na diversidade de fauna e flora atrativos para quem enxerga, na plenitude da vida, um verdadeiro espetáculo.\n\nPrainhas de água doce, cachoeiras, morros que permitem alçar voos de parapente, trilhas na área rural por onde é possível caminhar, correr e pedalar. Pesqueiros que colocam o visitante em contato com o meio ambiente e servem delícias de dar água na boca.\n\nAs incontáveis atividades se apresentam nesse grande palco e fazem da região um importante polo turístico do Paraná. Venha conhecer e desfrutar de momentos inesquecíveis.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Aguas-do-Arenito-Caiua',
  },
  {
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fcaminho-das-aguas.webp?alt=media',
    imageHint: 'Cachoeira na região do Caminho das Águas',
    title: 'Caminho das Águas',
    subtitle: 'PERMITA-SE VIVER ESSA EXPERIÊNCIA, COLECIONANDO MEMÓRIAS',
    description: 'Com natureza exuberante, o Caminho das Águas é um dos destinos mais atraentes do Paraná e parada certa aos amantes do ecoturismo. Os rios Paraná, Piquiri, Ivaí e Goioerê banham a região por aproximadamente 420 km, resultando em belas praias de água doce, cachoeiras e piscinas naturais.\n\nEsse misto de povo acolhedor e contemplação da natureza com a simplicidade, charme, aromas e sabores, faz do Caminho das Águas uma viagem espetacular e inesquecível.',
    buttonText: 'Ver mais no site oficial',
    buttonUrl: 'https://www.viajeparana.com/Caminho-das-Aguas',
  },
];

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

const RegionCard = ({ region }: { region: RegionData }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-white dark:bg-card border cursor-pointer hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-4 flex flex-row items-start gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={region.imageUrl}
                alt={region.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={region.imageHint}
              />
            </div>
            <div className="flex flex-col flex-grow min-w-0">
              <h3 className="font-headline text-lg mb-1 line-clamp-1">{region.title}</h3>
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wide line-clamp-2">{region.subtitle}</p>
              
              <div className="text-sm text-foreground/80 flex-grow">
                <p className="line-clamp-3">
                  {region.description}
                </p>
              </div>

              <div className="mt-auto pt-1">
                <p className="text-xs text-primary font-semibold hover:underline">
                  Ver detalhes...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col h-[90vh] max-h-[700px] rounded-xl">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="font-headline text-xl">{region.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">{region.subtitle}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="p-4 pt-2">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                      src={region.imageUrl}
                      alt={region.title}
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint={region.imageHint}
                  />
              </div>
              <p className="text-base text-foreground/90 whitespace-pre-line">{region.description}</p>
          </div>
        </ScrollArea>
        <div className="p-4 border-t shrink-0 space-y-3 bg-background">
            <Button asChild className="w-full">
              <a href={region.buttonUrl} target="_blank" rel="noopener noreferrer">
                {region.buttonText} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <AdPlaceholder />
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function ViajeParanaPage() {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const mapUrl = "https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fmapa-regioes-turisticas-do-parana.jpg?alt=media";

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center mb-0">
          <Link href="/turismo" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Turismo
          </Link>
           <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Map className="mr-2 h-4 w-4" /> Ver Mapa
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl p-2">
                    <DialogHeader>
                        <DialogTitle>Mapa das Regiões Turísticas do Paraná</DialogTitle>
                        <DialogDescription>Mapa mostrando as diferentes regiões turísticas do estado do Paraná.</DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full aspect-[4/3]">
                        <Image src={mapUrl} alt="Mapa das Regiões Turísticas do Paraná" layout="fill" objectFit="contain" />
                    </div>
                </DialogContent>
            </Dialog>
      </div>

      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative w-48 h-24">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fviaje-parana.webp?alt=media"
            alt="Logo Viaje Paraná"
            layout="fill"
            objectFit="contain"
            data-ai-hint="viaje parana logo"
          />
        </div>
        <p className="max-w-2xl text-muted-foreground">
          O Paraná te convida a desvendar um leque de experiências inesquecíveis. De paisagens exuberantes a rica herança cultural, há algo para todos os gostos.
        </p>
      </header>
      
      <AdPlaceholder />

      <main className="space-y-6">
        {regions.map((region) => (
          <RegionCard key={region.title} region={region} />
        ))}
      </main>
    </div>
  );
}

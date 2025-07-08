# Como Adicionar Publicidade (AdMob) ao Aplicativo

Este guia fornece um passo a passo para integrar anúncios do Google AdMob ao projeto. A integração será feita usando o plugin `admob-plus-capacitor`, que é uma solução robusta para aplicativos híbridos.

**Pré-requisitos:**
*   Uma conta no [Google AdMob](https://admob.google.com/).
*   Node.js e Capacitor instalados no seu ambiente de desenvolvimento.

---

### Passo 1: Configuração no Google AdMob

1.  **Crie um Aplicativo no AdMob:**
    *   Acesse sua conta AdMob.
    *   Vá para `Apps` > `Adicionar app`.
    *   Selecione a plataforma (Android ou iOS). Se o app não estiver publicado, selecione "Não" e dê um nome a ele.
    *   Após criar o app, anote o **ID do aplicativo AdMob**. Ele terá um formato como `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`.

2.  **Crie Blocos de Anúncios:**
    *   Dentro do seu app no AdMob, vá para `Blocos de anúncios`.
    *   Crie os blocos que você irá utilizar. Recomendamos:
        *   **Banner:** Para os espaços de publicidade fixos nas telas (`AdPlaceholder`). Anote o **ID do Bloco de Anúncios** (ex: `ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ`).
        *   **Intersticial (Opcional):** Anúncios de tela cheia para exibir entre transições de tela. Anote o ID.
        *   **Premiado (Opcional):** Anúncios que os usuários podem escolher assistir em troca de uma recompensa. Anote o ID.

---

### Passo 2: Instalar e Configurar o Plugin no Projeto

1.  **Instale o Plugin do AdMob:**
    No terminal, na raiz do seu projeto, execute:
    ```bash
    npm install admob-plus-capacitor
    npx cap sync
    ```

2.  **Configure para Android (`android/app/src/main/AndroidManifest.xml`):**
    Adicione as seguintes meta-data dentro da tag `<application>`:
    ```xml
    <application ...>
        ...
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="SEU_ID_DO_APLICATIVO_ADMOB_AQUI"/>
    </application>
    ```
    *Substitua `SEU_ID_DO_APLICATIVO_ADMOB_AQUI` pelo ID que você anotou no Passo 1.*

3.  **Configure para iOS (`ios/App/App/Info.plist`):**
    Adicione a seguinte chave e valor ao dicionário principal:
    ```xml
    <key>GADApplicationIdentifier</key>
    <string>SEU_ID_DO_APLICATIVO_ADMOB_AQUI</string>
    ```
    *Substitua pelo seu ID do AdMob.*

---

### Passo 3: Criar um Serviço de Anúncios no Código

Para gerenciar a exibição dos anúncios de forma centralizada, é uma boa prática criar um serviço.

1.  **Crie o arquivo `src/services/ad-service.ts` (exemplo):**
    ```typescript
    import { AdMob, BannerAd, AdOptions, BannerAdOptions, BannerAdSize, BannerAdPosition } from 'admob-plus-capacitor';

    class AdService {
      private bannerAd: BannerAd | null = null;
      private bannerAdId = 'SEU_ID_DO_BLOCO_DE_ANUNCIO_BANNER_AQUI'; // Substitua

      constructor() {
        AdMob.initialize();
      }

      async showBanner() {
        if (this.bannerAd) {
          await this.bannerAd.show();
          return;
        }

        const options: BannerAdOptions = {
          adId: this.bannerAdId,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: process.env.NODE_ENV !== 'production', // Use anúncios de teste em desenvolvimento
        };

        this.bannerAd = new BannerAd(options);
        await this.bannerAd.show();

        this.bannerAd.on('impression', async (evt) => {
          console.log('Banner impression:', evt);
        });
      }

      async hideBanner() {
        if (this.bannerAd) {
          await this.bannerAd.hide();
        }
      }
    }

    export const adService = new AdService();
    ```
    *Não se esqueça de substituir o `bannerAdId` pelo ID do seu bloco de anúncios de banner.*

---

### Passo 4: Exibir os Anúncios nos Componentes

Agora, você pode usar o `adService` para mostrar os anúncios. A forma mais comum seria usar um Contexto (`AdContext`) para controlar a visibilidade dos banners.

1.  **Criar o `AdPlaceholder` real:**
    O componente `AdPlaceholder` que usamos até agora era apenas visual. O banner do AdMob é exibido como um *overlay* sobre o aplicativo. O `AdPlaceholder` agora servirá como um espaço reservado no layout, enquanto o banner real flutua na parte inferior.

2.  **Controlar a Exibição:**
    Em um componente de layout principal, como `src/components/layout/app-layout.tsx`, você pode controlar quando o banner deve aparecer ou ser escondido.

    ```tsx
    // Em app-layout.tsx
    import { adService } from '@/services/ad-service';
    import { usePathname } from 'next/navigation';
    import { useEffect } from 'react';

    export default function AppLayout({ children }: AppLayoutProps) {
      const pathname = usePathname();

      useEffect(() => {
        // Lista de rotas onde você NÃO quer exibir o banner
        const noAdRoutes = ['/login', '/register', '/streaming'];

        if (noAdRoutes.includes(pathname)) {
          adService.hideBanner();
        } else {
          adService.showBanner();
        }
      }, [pathname]);

      // ... resto do seu componente
    }
    ```

Este guia é um ponto de partida. Para anúncios intersticiais e premiados, você criaria métodos similares no `adService` (`showInterstitial`, `showRewarded`) e os chamaria em momentos estratégicos do seu aplicativo (ex: após completar uma ação, antes de navegar para uma nova tela, etc.). Consulte a [documentação do `admob-plus`](https://admob-plus.github.io/) para mais detalhes.
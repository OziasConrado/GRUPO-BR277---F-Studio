# Como Adicionar Publicidade (Google AdSense) ao Web App

Você está correto! Para um Web App, a ferramenta certa é o Google AdSense, não o AdMob. Este guia fornece o passo a passo para integrar anúncios do AdSense ao projeto Next.js.

**Pré-requisitos:**
*   Uma conta no [Google AdSense](https://www.google.com/adsense/start/).
*   Seu site/domínio aprovado pelo AdSense.

---

### Passo 1: Configuração no Google AdSense

1.  **Obtenha seu ID de Editor (Publisher ID):**
    *   Após a aprovação da sua conta, você receberá um ID de Editor (Publisher ID). Ele se parece com `pub-XXXXXXXXXXXXXXXX`. Anote-o.

2.  **Crie Blocos de Anúncios:**
    *   Na sua conta AdSense, vá para `Anúncios` > `Por bloco de anúncios`.
    *   Crie um bloco de "Anúncios de display".
    *   Dê um nome e escolha o formato (recomendamos "Responsivo" para melhor adaptação).
    *   Após criar, o AdSense fornecerá um código. Anote o **ID do bloco de anúncios** (Data Ad Slot). Ele se parece com `YYYYYYYYYY`.

---

### Passo 2: Adicionar o Script do AdSense ao Projeto

A melhor forma de adicionar o script principal do AdSense é no layout raiz da aplicação, para que ele seja carregado em todas as páginas.

1.  **Edite o arquivo `src/app/layout.tsx`:**
    Adicione o componente `<Script>` do Next.js dentro da tag `<head>`. Você precisará substituir `SEU_PUBLISHER_ID_AQUI` pelo seu ID.

    ```tsx
    // Em src/app/layout.tsx
    import Script from 'next/script'; // Importe o Script
    
    // ... dentro do componente RootLayout
    
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-SEU_PUBLISHER_ID_AQUI`}
          crossOrigin="anonymous"
          strategy="afterInteractive" // Carrega após a página se tornar interativa
        />
      </head>
      <body>
        {/* ... resto do seu layout ... */}
      </body>
    </html>
    ```

---

### Passo 3: Criar um Componente de Anúncio Reutilizável

Para gerenciar a exibição dos anúncios de forma limpa, criaremos um componente específico.

1.  **Crie o arquivo `src/components/ads/adsense-ad.tsx`:**

    ```tsx
    'use client';
    
    import { useEffect } from 'react';
    
    interface AdSenseAdProps {
      adSlot: string; // O ID do seu bloco de anúncios
      className?: string;
    }
    
    declare global {
      interface Window {
        adsbygoogle?: {
          push: (props: object) => void;
        }[];
      }
    }
    
    const AdSenseAd = ({ adSlot, className }: AdSenseAdProps) => {
      useEffect(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error('AdSense error:', err);
        }
      }, []);
    
      if (process.env.NODE_ENV !== 'production') {
        return (
          <div
            className={`flex items-center justify-center bg-muted/30 border border-dashed text-muted-foreground text-sm h-24 rounded-lg ${className}`}
          >
            Anúncio do AdSense (Visível em Produção)
          </div>
        );
      }
    
      return (
        <div className={className}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={`ca-SEU_PUBLISHER_ID_AQUI`} // Substitua
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      );
    };
    
    export default AdSenseAd;
    ```
    *Não se esqueça de substituir `SEU_PUBLISHER_ID_AQUI` também neste arquivo.*

---

### Passo 4: Usar o Componente de Anúncio

Agora, substitua os `AdPlaceholder`s existentes pelo novo componente `AdSenseAd`.

1.  **Exemplo de uso em `src/app/alertas/page.tsx`:**

    Primeiro, importe o novo componente:
    ```tsx
    import AdSenseAd from '@/components/ads/adsense-ad';
    ```

    Depois, substitua `AdPlaceholder` por `AdSenseAd`, passando o `adSlot` do anúncio que você criou.
    ```tsx
    // Antes:
    <AdPlaceholder />
    
    // Depois:
    <AdSenseAd adSlot="SEU_AD_SLOT_ID_AQUI" className="my-6" /> // Substitua
    ```

2.  **Repita o processo** para todos os outros locais onde `AdPlaceholder` é usado (`ferramentas/*`, `sau/page.tsx`, etc.), sempre fornecendo o ID do seu bloco de anúncios.

---

Este guia é o ponto de partida. Lembre-se que os anúncios do AdSense podem demorar um pouco para aparecer após a configuração e só serão exibidos no ambiente de produção (quando o app estiver publicado no seu domínio aprovado). Em desenvolvimento, você verá o aviso que configuramos no componente.

# Como Adicionar Publicidade (Google AdSense) ao Web App

Este guia fornece o passo a passo para integrar anúncios do AdSense ao projeto Next.js. O AdMob é para aplicativos nativos, enquanto o AdSense é para Web Apps.

**Pré-requisitos:**
*   Uma conta no [Google AdSense](https://www.google.com/adsense/start/).
*   Seu site/domínio aprovado pelo AdSense.
*   Seu ID de Editor (Publisher ID) do AdSense, que se parece com `pub-XXXXXXXXXXXXXXXX`.

---

### Passo 1: Adicionar o Script do AdSense ao Projeto (Já realizado)

O script principal do AdSense já foi adicionado ao layout raiz da aplicação (`src/app/layout.tsx`). O ID do Editor (`ca-pub-3646331718909935`) também já foi configurado.

```tsx
// Em src/app/layout.tsx
import Script from 'next/script';

<head>
  <Script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3646331718909935`}
    crossOrigin="anonymous"
    strategy="afterInteractive"
  />
</head>
```

---

### Passo 2: Usar o Componente de Anúncio (`AdSenseAd`)

Para exibir anúncios, utilizamos um componente reutilizável chamado `AdSenseAd`. Você só precisa importá-lo e passar o **ID do Bloco de Anúncios** (Ad Slot ID) que você criou na sua conta AdSense.

1.  **Crie um Bloco de Anúncios no AdSense:**
    *   Na sua conta AdSense, vá para `Anúncios` > `Por bloco de anúncios`.
    *   Crie um bloco de "Anúncios de display".
    *   Dê um nome e escolha o formato (recomendamos "Responsivo").
    *   Após criar, o AdSense fornecerá um código. Anote o **ID do bloco de anúncios** (Data Ad Slot). Ele é uma sequência de números, como `1234567890`.

2.  **Importe e Use o Componente na Página Desejada:**
    Abra o arquivo onde você quer exibir o anúncio (por exemplo, `src/app/alertas/page.tsx`).

    *   **Importe o componente:**
        ```tsx
        import AdSenseAd from '@/components/ads/adsense-ad';
        ```

    *   **Substitua o placeholder `AdPlaceholder` pelo `AdSenseAd`, fornecendo seu Ad Slot ID:**
        ```tsx
        // Antes:
        <AdPlaceholder />

        // Depois (substitua 'SEU_AD_SLOT_ID_AQUI' pelo seu número):
        <AdSenseAd adSlot="SEU_AD_SLOT_ID_AQUI" className="my-6" />
        ```

---

**Importante:**
*   Os anúncios só serão exibidos no ambiente de **produção**, ou seja, quando o app estiver publicado no seu domínio aprovado pelo AdSense.
*   Em desenvolvimento, você verá um componente cinza com a mensagem "Anúncio do AdSense (Visível em Produção)".
*   Pode levar algum tempo para os anúncios começarem a aparecer após a configuração inicial.

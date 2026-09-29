# Exemplos do Spalla React Native SDK

Coleção de exemplos **prontos para rodar** do SDK [`spalla-react-native`](https://www.npmjs.com/package/spalla-react-native). Cada pasta é um **app Expo independente** que demonstra **uma** capacidade do player (VoD vertical, multi-legenda, multi-áudio, live com DAI, DVR, LL-HLS, AES-128, thumbnails…).

> Cada exemplo é enxuto de propósito: foca só no recurso que o título descreve, para servir de referência copiável.

## Índice de exemplos

| Exemplo | O que demonstra |
| :------ | :-------------- |
| [vod-vertical](./vod-vertical) | Vídeo 9:16, `metadataLoaded.isVertical` e layout em pé |
| [vod-multi-legenda](./vod-multi-legenda) | Seleção de legenda por nome + preview de thumbnail (VTT) |
| [vod-legenda-embutida](./vod-legenda-embutida) | Legenda embutida no manifest (`EXT-X-MEDIA TYPE=SUBTITLES`) |
| [vod-multi-audio-4-trilhas](./vod-multi-audio-4-trilhas) | 4 trilhas de áudio embutidas (`audioTracksAvailable`) |
| [vod-multi-audio-pt-es](./vod-multi-audio-pt-es) | Troca de idioma de áudio (Português/Español) |
| [live-google-dai](./live-google-dai) | Ao vivo com Google DAI e todos os eventos de anúncio (ciclo de vida + `adEvent` cru do IMA) |
| [live-dvr](./live-dvr) | Janela DVR, `seekableDuration`, scrub e `seekToLive()` |
| [vod-aes-128](./vod-aes-128) | Playback transparente de HLS cifrado (AES-128) |
| [live-ll-hls](./live-ll-hls) | Ao vivo de baixa latência (LL-HLS) |
| [vod-thumbnails-image-stream](./vod-thumbnails-image-stream) | Thumbnails via `EXT-X-IMAGE-STREAM-INF` no scrub |

## Como rodar qualquer exemplo

Cada pasta é um projeto Expo autossuficiente. A partir da pasta do exemplo:

```sh
cd vod-vertical            # ou qualquer outra pasta
npm install
```

Antes de rodar, abra `src/App.tsx` e troque os **placeholders**:

- `SEU_TOKEN` — o token da API da Spalla (autentica as chamadas do SDK).
- `SEU_APP_ID` — o App ID do Chromecast (também em `app.json`, no plugin `react-native-google-cast`, campo `receiverAppId`).

Depois, gere os projetos nativos e rode em um dispositivo/simulador:

```sh
npx expo prebuild          # gera ios/ e android/ a partir do app.json
npx expo run:ios           # ou: npx expo run:android
```

> **Não** use Expo Go: o SDK inclui um core nativo (C++ TurboModule) e depende de New Architecture. Use um dev client / prebuild.

> Cada exemplo já traz o `postinstall` que aplica os patches nativos do `react-native-video` — eles são **obrigatórios** (veja [Obrigatório: aplicar os patches nativos](#obrigatório-aplicar-os-patches-nativos)). Ao copiar o código para um app seu, replique esse script e confirme com `npx spalla-doctor`.

---

## Usando o SDK

### Instalação

```sh
npm install spalla-react-native react-native-video @react-native-async-storage/async-storage react-native-uuid react-native-google-cast
```

A UI do player é implementada em JS sobre o `react-native-video`. Telemetria e failover de CDN são um core nativo pré-compilado (C++ TurboModule), então o pacote **exige React Native 0.76+ com New Architecture** e **não roda no Expo Go**.

### Obrigatório: aplicar os patches nativos

O SDK depende de correções no `react-native-video` que ainda não estão no upstream:

- **Android** — o player criado para o pre-roll era reaproveitado na fase DAI sem o ads loader de server-side, e o tratamento de erro estourava `NullPointerException` (`DaiAdsLoader is null`). Sem o patch, **toda live com Google DAI + pre-roll trava na inicialização**.
- **iOS** — o container de anúncio do IMA engolia todos os toques (os controles ficavam inertes) e havia um loop de layout entre o overlay do player e a safe area.

Os patches acompanham o pacote e são aplicados pelo `patch-package`. Adicione o hook ao `package.json` **do seu app** e reinstale:

```json
{
  "scripts": {
    "postinstall": "spalla-apply-patches"
  }
}
```

Depois **recompile o app nativo** — corrigir o `node_modules` não altera um binário já compilado.

Para conferir a qualquer momento:

```sh
npx spalla-doctor
```

O comando sai com código diferente de zero e diz exatamente o que falta. Ele verifica **todas** as cópias instaladas: em monorepos cada workspace mantém seu próprio `node_modules`, e patchear só a raiz deixa de fora justamente a cópia que o app empacota.

Sem os patches, anúncios e lives com DAI falham de um jeito que **parece problema de conteúdo ou de CDN**. Por isso o SDK também avisa em tempo de execução: registra um erro no console, emite o evento [`integrationWarning`](#eventos-do-player) e expõe `checkIntegration()` para o seu próprio health check na inicialização.

> **Expo/EAS:** funciona com prebuild/CNG e EAS Build. Se o cache do build pular o `postinstall`, rode `npx spalla-doctor` como etapa do build para falhar cedo em vez de publicar um app quebrado.

> O npm recente pode avisar que `spalla-react-native` tem um install script não aprovado (`install-scripts not yet covered by allowScripts`). Pode ignorar: quem aplica os patches é o `postinstall` **do seu app**, e ele roda normalmente. O `spalla-doctor` confirma.

> O `react-native-video` fica **fixado em 6.19.2** nos exemplos: o patch é gerado contra essa versão exata e um range como `^6.19.1` pode resolver para uma versão em que ele não aplica.

### Configuração (Expo)

No `app.json`, registre os config plugins (é o que estes exemplos fazem):

```json
{
  "expo": {
    "newArchEnabled": true,
    "plugins": [
      "spalla-react-native/app.plugin.js",
      [
        "react-native-video",
        {
          "enableADSExtension": true,
          "androidExtensions": { "useExoplayerHls": true }
        }
      ],
      ["react-native-google-cast", { "receiverAppId": "SEU_APP_ID" }]
    ]
  }
}
```

- `spalla-react-native/app.plugin.js` habilita o Picture-in-Picture no Android (`supportsPictureInPicture`).
- `react-native-video` com `enableADSExtension`/`useExoplayerHls` liga IMA (ads) e HLS.
- `react-native-google-cast` configura o Chromecast; o `receiverAppId` é o App ID do seu receiver.

Depois: `npx expo prebuild && npx expo run:ios` (ou `run:android`).

### Configuração (bare React Native)

- **iOS** — no `ios/Podfile`, antes de `use_react_native!`: `$RNVideoUseGoogleIMA = true`, depois `pod install`.
- **Android** — em `android/build.gradle` (`buildscript.ext`): `useExoplayerIMA = true` e `useExoplayerHls = true`.
- **Picture-in-Picture** — mantenha `android:supportsPictureInPicture="true"` na `MainActivity` do `AndroidManifest.xml`.

### Uso

```tsx
import SpallaPlayer, { initialize } from 'spalla-react-native';

// Chame initialize() o quanto antes (topo do index.js/App.tsx), ANTES de
// montar qualquer SpallaPlayer. O 2º parâmetro é o App ID do Chromecast.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const playerRef = React.useRef<SpallaPlayer | null>(null);
const [playing, setPlaying] = React.useState(true);

<SpallaPlayer
  ref={playerRef}
  style={{ flex: 1 }}
  contentId="SEU_CONTENT_ID"
  hideUI={false}
  onPlayerEvent={({ nativeEvent }) => {
    switch (nativeEvent.event) {
      case 'play':
      case 'playing':
        setPlaying(true);
        break;
      case 'pause':
        setPlaying(false);
        break;
      case 'metadataLoaded':
        console.log('isLive', nativeEvent.isLive, 'duration', nativeEvent.duration);
        break;
      default:
        break;
    }
  }}
/>;
```

### Props

| Propriedade | Tipo | Descrição |
| :---------- | :--: | :-------- |
| `contentId` | string | contentId da Spalla a reproduzir |
| `hideUI` | boolean | esconde/mostra a UI nativa (só pode ser definido uma vez) |
| `muted` | boolean | muta/desmuta o vídeo |
| `startTime` | number | tempo inicial em segundos (padrão 0) |
| `onPlayerEvent` | callback | função chamada com os eventos do player |
| `subtitle` | string \| null | legenda a ativar (nome/idioma de `subtitlesAvailable`); `null` desliga |
| `audioTrack` | string \| null | faixa de áudio a ativar (de `audioTracksAvailable`); `null` usa a padrão |
| `playbackRate` | number | velocidade de reprodução (0.5, 1.0, 1.5, 2.0) |
| `aspectRatio` | string | `"fit"` \| `"fill"` \| `"aspectFill"` (só pode ser definido uma vez) |
| `customImaParams` | Map | parâmetros extras para tags IMA (chave e valor string) |
| `customAds` | Array | anúncios VAST/VMAP customizados |
| `pipEnabled` | boolean | habilita Picture-in-Picture |
| `subtitleAppearance` | object | customiza tamanho/margem da legenda. Ver [Aparência da legenda](#aparência-da-legenda) |

### Métodos imperativos (via ref)

| Método | Descrição |
| :----- | :-------- |
| `play()` / `pause()` | retomar / pausar |
| `seekTo(time)` | buscar um instante (segundos) |
| `seekToLive()` | voltar à borda ao vivo (live com DVR) |
| `setSubtitle(lang \| null)` / `getSubtitle()` / `getAvailableSubtitles()` | legendas |
| `setAudioTrack(track \| null)` / `getAudioTrack()` / `getAvailableAudioTracks()` | faixas de áudio |
| `setPlaybackRate(rate)` / `getPlaybackRate()` / `getAvailablePlaybackRates()` | velocidade |
| `setBitrate(bps \| null)` / `getBitrate()` / `getAvailableBitrates()` | qualidade (ABR) |
| `enterFullscreen()` / `exitFullscreen()` / `isFullscreen()` | tela cheia nativa |
| `enterPiP()` / `exitPiP()` / `isInPiP()` | Picture-in-Picture |
| `checkIntegration()` | `{ ok, issue?, message? }` — se os patches do `react-native-video` estão ativos |

> Setters convivem com as props equivalentes: a mudança mais recente vence.

> Argumentos inválidos (seek `NaN`/negativo, velocidade fora da lista, bitrate não positivo) são rejeitados e reportados por telemetria, em vez de chegarem ao player nativo.

### Eventos do player

Todos chegam por `onPlayerEvent` como `{ nativeEvent }`:

| Evento | Payload | Descrição |
| :----- | :-----: | :-------- |
| `play` / `pause` / `playing` / `buffering` / `ended` | — | mudanças de estado |
| `muted` / `unmuted` | — | estado de mudo |
| `timeUpdate` | `time`, `seekableDuration` | posição atual; `seekableDuration` = fim da faixa buscável (janela DVR no live) |
| `durationUpdate` | `duration` | duração do conteúdo (segundos) |
| `metadataLoaded` | `isLive`, `duration`, `isVertical`, `dvrEnabled` | metadados do stream. Com pre-roll, dispara logo que o ad break começa (a partir do config) e de novo com as dimensões reais quando o conteúdo carrega — assim o app nunca espera o anúncio para chamar `play()` |
| `subtitlesAvailable` | `subtitles: string[]` | legendas disponíveis para `subtitle` |
| `subtitleSelected` | `subtitle` | ecoa a prop `subtitle` |
| `audioTracksAvailable` | `audioTracks: string[]` | faixas de áudio disponíveis |
| `audioTrackSelected` | `audioTrack` | ecoa a prop `audioTrack` |
| `thumbnailsAvailable` | `thumbnails: ThumbnailCue[]` | cues de preview do scrub |
| `playbackRateSelected` | `rate` | ecoa a velocidade |
| `enterPiP` / `exitPiP` | — | transições de Picture-in-Picture |
| `onEnterFullScreen` / `onExitFullScreen` | — | transições de tela cheia |
| `adBreakBegin` / `adBreakEnd` / `adBegin` / `adEnd` | — | ciclo de vida de anúncios |
| `adError` | `error`, `data` | um anúncio falhou; `error` vem como `"<código>: <motivo>"` e `data` é o payload de erro cru do IMA, quando a plataforma manda um. O conteúdo continua tocando |
| `adEvent` | `name`, `data` | todo evento de anúncio reportado pelo SDK do IMA, repassado sem filtro (ver [Eventos de anúncio](#eventos-de-anúncio)) |
| `integrationWarning` | `code`, `message` | os patches do `react-native-video` estão ausentes, desatualizados ou fora do build nativo (ver [Instalação](#obrigatório-aplicar-os-patches-nativos)) |
| `error` | `message`, `canRetry` | falha de playback/carregamento |

### Eventos de anúncio

Os eventos de ciclo de vida acima cobrem só o intervalo comercial: eles resumem
os ~38 tipos de evento do IMA em pares de começo/fim. Para todo o resto —
quartis, impressões, cliques, pausas, mudança de estado de skip — escute
`adEvent`, que repassa cada evento reportado pelo IMA, inclusive os que o SDK
também mapeia para um evento de ciclo de vida:

```tsx
<SpallaPlayer
  contentId="SEU_CONTENT_ID"
  onPlayerEvent={({ nativeEvent }) => {
    if (nativeEvent.event === 'adEvent') {
      // 'LOADED' | 'STARTED' | 'IMPRESSION' | 'FIRST_QUARTILE' | 'MIDPOINT' |
      // 'THIRD_QUARTILE' | 'COMPLETED' | 'CLICK' | 'AD_PROGRESS' | ...
      analytics.track(nativeEvent.name, nativeEvent.data);
    }
  }}
/>
```

`name` é o nome cru do evento do IMA — a lista completa é o enum `AdEvent` do
[`react-native-video`](https://github.com/TheWidlarzGroup/react-native-video/blob/master/src/types/Ads.ts).
`data` é o payload do IMA sem tratamento: o formato muda conforme o evento e a
plataforma (no iOS, por exemplo, `ERROR` traz `{ message, code, type }`), então
trate como opaco e proteja cada campo que for ler.

`adEvent` é emitido antes de qualquer heurística de anúncio do próprio SDK, de
modo que nenhum evento é engolido pela proteção contra loop de pre-roll nem pelo
watchdog. `AD_PROGRESS` dispara várias vezes por segundo enquanto o anúncio toca
— não guarde no state do React.

### Aparência da legenda

Por padrão o SDK aumenta a legenda em tela cheia (vídeo vertical ou `aspectRatio="aspectFill"`, já que recortar o quadro encolhe o tamanho nativo da legenda) e mantém uma margem da borda inferior. Para customizar, use `subtitleAppearance`:

```tsx
<SpallaPlayer
  contentId="SEU_CONTENT_ID"
  subtitleAppearance={{
    fontSize: 18, // tamanho inline (vídeo vertical); padrão 16
    bottomPaddingRatio: 1.8, // margem = fontSize * ratio; padrão 1.8
    // bottomPadding: 24, // margem fixa em pontos, sobrepõe bottomPaddingRatio
    fullscreen: {
      fontSize: 28, // tamanho fixo em tela cheia; padrão escala com a tela
      // bottomPaddingRatio / bottomPadding também aceitos aqui
    },
  }}
/>
```

Todo campo é opcional e cai no padrão do SDK; os campos de `fullscreen` caem nos da base (exceto `fontSize`, que mantém seu próprio padrão responsivo quando omitido).

O `subtitleAppearance` é ignorado em Picture-in-Picture: a janela minúscula sempre usa o tamanho padrão do SDK, já que um tamanho customizado ficaria ilegível ou não caberia nela.

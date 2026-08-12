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
| [live-google-dai](./live-google-dai) | Ao vivo com Google DAI e eventos de ad break |
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

---

## Usando o SDK

### Instalação

```sh
npm install spalla-react-native react-native-video @react-native-async-storage/async-storage react-native-uuid react-native-google-cast
```

A UI do player é implementada em JS sobre o `react-native-video`. Telemetria e failover de CDN são um core nativo pré-compilado (C++ TurboModule), então o pacote **exige React Native 0.76+ com New Architecture** e **não roda no Expo Go**.

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

> Setters convivem com as props equivalentes: a mudança mais recente vence.

### Eventos do player

Todos chegam por `onPlayerEvent` como `{ nativeEvent }`:

| Evento | Payload | Descrição |
| :----- | :-----: | :-------- |
| `play` / `pause` / `playing` / `buffering` / `ended` | — | mudanças de estado |
| `muted` / `unmuted` | — | estado de mudo |
| `timeUpdate` | `time`, `seekableDuration` | posição atual; `seekableDuration` = fim da faixa buscável (janela DVR no live) |
| `durationUpdate` | `duration` | duração do conteúdo (segundos) |
| `metadataLoaded` | `isLive`, `duration`, `isVertical`, `dvrEnabled` | disparado quando o stream carrega |
| `subtitlesAvailable` | `subtitles: string[]` | legendas disponíveis para `subtitle` |
| `subtitleSelected` | `subtitle` | ecoa a prop `subtitle` |
| `audioTracksAvailable` | `audioTracks: string[]` | faixas de áudio disponíveis |
| `audioTrackSelected` | `audioTrack` | ecoa a prop `audioTrack` |
| `thumbnailsAvailable` | `thumbnails: ThumbnailCue[]` | cues de preview do scrub |
| `playbackRateSelected` | `rate` | ecoa a velocidade |
| `enterPiP` / `exitPiP` | — | transições de Picture-in-Picture |
| `onEnterFullScreen` / `onExitFullScreen` | — | transições de tela cheia |
| `adBreakBegin` / `adBreakEnd` / `adBegin` / `adEnd` / `adError` | — | ciclo de vida de anúncios |
| `error` | `message`, `canRetry` | falha de playback/carregamento |

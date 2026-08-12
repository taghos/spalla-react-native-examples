# Live LL-HLS (baixa latência)

Ao vivo low-latency (`EXT-X-PART`, blocking reload, `PART-TARGET` ~1s), sem DAI — toca direto do CDN.

## O que este exemplo cobre

- Playback de um live LL-HLS direto do CDN (sem server-side ad insertion).
- Evento `metadataLoaded` exibindo as características do stream (`isLive`, `dvrEnabled`, `duration`).
- Controles nativos do player.

> A baixa latência é servida pelo próprio manifest LL-HLS; do lado do app basta apontar o `contentId`. Um painel em tela mostra os metadados anunciados.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

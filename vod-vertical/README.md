# VoD vertical

Vídeo 9:16 (1080x1920). Demonstra `sp_vertical` no config, o evento `metadataLoaded.isVertical` e como adaptar o layout do app para vídeo em pé.

## O que este exemplo cobre

- Ler `metadataLoaded.isVertical` para saber que o conteúdo é vertical.
- Trocar o container do `SpallaPlayer` para `aspectRatio: 9/16` quando o vídeo é vertical.
- Controles nativos do player (sem `hideUI`).

## Trechos relevantes

- Prop `contentId` apontando para um VoD vertical.
- `onPlayerEvent` tratando `metadataLoaded` para ajustar o layout.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

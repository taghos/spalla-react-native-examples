# VoD legenda embutida no manifest

HLS com `EXT-X-MEDIA TYPE=SUBTITLES` (Português). Demonstra o caminho nativo de legendas ("embutida vence") e o dedupe com o config.

## O que este exemplo cobre

- Evento `subtitlesAvailable` com a legenda embutida no manifest.
- Prop `subtitle` alternando entre desligado e cada idioma disponível.
- Controles nativos do player (sem `hideUI`); um botão em JS cicla a legenda pela prop.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

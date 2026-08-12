# VoD multi-áudio (4 trilhas)

Trilhas de áudio embutidas no HLS (Audio 1..4, sem `LANGUAGE`). Demonstra `audioTracksAvailable` e a seleção por nome.

## O que este exemplo cobre

- Evento `audioTracksAvailable` listando as 4 trilhas embutidas.
- Prop `audioTrack` para trocar de faixa por nome; `null` volta à padrão.
- Controles nativos do player; um botão em JS cicla as trilhas.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

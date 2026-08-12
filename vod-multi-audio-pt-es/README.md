# VoD multi-áudio (Português/Español)

Duas trilhas de áudio nomeadas no manifest. Demonstra a troca de idioma de áudio durante o playback.

## O que este exemplo cobre

- Evento `audioTracksAvailable` com as duas trilhas nomeadas.
- Prop `audioTrack` trocando o idioma durante a reprodução; `null` volta à padrão.
- Controles nativos do player; um botão em JS alterna os idiomas.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

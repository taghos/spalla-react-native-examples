# Live com Google DAI

Ao vivo com server-side ad insertion (DAI). Demonstra os eventos de ad break e o playback contínuo (os anúncios vêm costurados no próprio stream).

## O que este exemplo cobre

- Eventos `adBreakBegin` / `adBreakEnd` / `adBegin` / `adEnd` / `adError` no `onPlayerEvent`.
- Um log em tela mostrando o ciclo de vida dos anúncios enquanto o live roda.
- Controles nativos do player.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go. O IMA/ads vem do plugin `react-native-video` (`enableADSExtension`).

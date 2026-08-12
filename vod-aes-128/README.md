# VoD com criptografia AES-128

Segmentos cifrados (`EXT-X-KEY`) com a chave entregue por URI assinada. Demonstra o playback **transparente** de conteúdo protegido.

## O que este exemplo cobre

- Reproduzir um HLS AES-128 sem nenhuma configuração extra no app — o SDK resolve a chave e decifra os segmentos.
- Controles nativos do player.

Este exemplo é intencionalmente mínimo: o objetivo é mostrar que conteúdo cifrado toca igual a qualquer outro `contentId`.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

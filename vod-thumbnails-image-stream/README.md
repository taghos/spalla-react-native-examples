# VoD com EXT-X-IMAGE-STREAM-INF

Thumbnails declarados no manifest (extensão Roku: `EXT-X-TILES` 14x16) + trick play via `EXT-X-I-FRAME-STREAM-INF` nos controles nativos do iOS. O preview no scrub vem do image stream.

## O que este exemplo cobre

- Evento `thumbnailsAvailable` com os cues do image stream (grade `EXT-X-TILES`).
- Controles customizados (`hideUI`) mostrando o **preview de thumbnail** durante o scrub, recortando o sprite (técnica de sprite sheet 2D).
- Barra de progresso e seek em JS.

## Arquivos

- `src/App.tsx` — integração do player e estado dos thumbnails.
- `src/CustomControls.tsx` — overlay JS com barra de scrub e preview do sprite.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go. Nos controles nativos do iOS, o trick play usa `EXT-X-I-FRAME-STREAM-INF`.

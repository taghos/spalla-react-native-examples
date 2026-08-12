# VoD multi-legenda (Español/Português)

Legendas embutidas no manifest HLS + `sp_player_legendas_idiomas` no config. Demonstra a seleção nativa por nome, o dedupe embutida×config e o preview de thumbnail VTT no scrub.

## O que este exemplo cobre

- Evento `subtitlesAvailable` reunindo legendas embutidas no manifest e do config (dedupe).
- Prop `subtitle` para ativar/trocar a legenda por nome; `null` desliga.
- Controles customizados (`hideUI`) com barra de progresso e **preview de thumbnail** durante o scrub, a partir do evento `thumbnailsAvailable`.

## Arquivos

- `src/App.tsx` — integração do player, estado de legendas e thumbnails.
- `src/CustomControls.tsx` — overlay JS com barra de scrub, preview de thumbnail e seletor de legenda (usado com `hideUI`).

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

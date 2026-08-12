# Live com janela DVR (~1h)

Ao vivo com DVR. Demonstra `seekableDuration` no `timeUpdate`, scrub para trás na janela e o botão **AO VIVO** (`seekToLive()`).

## O que este exemplo cobre

- Evento `metadataLoaded` com `isLive` e `dvrEnabled`.
- Evento `timeUpdate` com `seekableDuration` (tamanho da janela DVR).
- Controles customizados (`hideUI`) com barra de scrub relativa à janela DVR, indicador de "quanto atrás do vivo" e botão **AO VIVO** que chama `seekToLive()`.

## Arquivos

- `src/App.tsx` — integração do player e estado do live/DVR.
- `src/CustomControls.tsx` — overlay JS; mostra o botão AO VIVO quando `isLive && dvrEnabled`.

## Como rodar

```sh
npm install
# edite src/App.tsx: troque SEU_TOKEN e SEU_APP_ID (e receiverAppId no app.json)
npx expo prebuild
npx expo run:ios   # ou: npx expo run:android
```

> Requer New Architecture; não roda no Expo Go.

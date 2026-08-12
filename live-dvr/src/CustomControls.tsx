import React from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ThumbnailCue } from 'spalla-react-native';

/**
 * Exemplo de controles customizados 100% em JS, para usar com hideUI={true}.
 *
 * Renderize este componente como children do <SpallaPlayer> — ele vira um
 * overlay sobre o vídeo. Tudo aqui usa apenas dados que o próprio player
 * anuncia via onPlayerEvent (tempo, duração, faixas, thumbnails) e as
 * ações do ref (seekTo, seekToLive, play/pause...), repassadas por props.
 *
 * Inclui: play/pause, barra de progresso com preview de thumbnail no
 * scrub, indicador/retorno ao AO VIVO (DVR), e seletores de legenda/áudio.
 */
const PREVIEW_SCALE = 1.6;

type Props = {
  playing: boolean;
  time: number;
  duration: number;
  seekableDuration: number;
  isLive: boolean;
  dvrEnabled: boolean;
  subtitles: string[];
  subtitle: string | null;
  audioTracks: string[];
  audioTrack: string | null;
  thumbnails: ThumbnailCue[];
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSeekToLive: () => void;
  onSelectSubtitle: (subtitle: string | null) => void;
  onSelectAudioTrack: (audioTrack: string | null) => void;
};

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Acha o cue de thumbnail que cobre o instante do scrub. Os cues vêm do
// evento thumbnailsAvailable; cada um aponta um recorte (x,y,w,h) num sprite.
function findThumbnail(
  thumbnails: ThumbnailCue[],
  time: number
): ThumbnailCue | null {
  for (const cue of thumbnails) {
    if (time >= cue.start && time <= cue.end) {
      return cue;
    }
  }
  return null;
}

export default function CustomControls(props: Props) {
  const {
    playing,
    time,
    duration,
    seekableDuration,
    isLive,
    dvrEnabled,
    subtitles,
    subtitle,
    audioTracks,
    audioTrack,
    thumbnails,
    onPlayPause,
    onSeek,
    onSeekToLive,
    onSelectSubtitle,
    onSelectAudioTrack,
  } = props;

  // Em lives, a "duração" da barra é a janela buscável (DVR);
  // em VoD, a duração do conteúdo.
  const total = isLive ? seekableDuration : duration;
  const [scrubTime, setScrubTime] = React.useState<number | null>(null);
  const [barWidth, setBarWidth] = React.useState(0);
  const [spriteSize, setSpriteSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  // Refs so the PanResponder always sees current values without re-creation.
  const totalRef = React.useRef(total);
  totalRef.current = total;
  const barWidthRef = React.useRef(barWidth);
  barWidthRef.current = barWidth;
  const scrubTimeRef = React.useRef(scrubTime);
  scrubTimeRef.current = scrubTime;

  // O recorte do preview precisa do tamanho real do sprite (os cues trazem
  // só o retângulo de cada tile). Carregamos uma vez por sprite.
  const spriteUri = thumbnails.length > 0 ? thumbnails[0]!.uri : null;
  React.useEffect(() => {
    if (!spriteUri) {
      setSpriteSize(null);
      return;
    }
    let cancelled = false;
    Image.getSize(
      spriteUri,
      (width, height) => {
        if (!cancelled) {
          setSpriteSize({ width, height });
        }
      },
      () => {}
    );
    return () => {
      cancelled = true;
    };
  }, [spriteUri]);

  // Barra de progresso "na mão" com PanResponder: arrastar mostra o preview
  // (scrubTime); soltar chama onSeek. Sem dependências externas.
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const ratio = evt.nativeEvent.locationX / (barWidthRef.current || 1);
          setScrubTime(Math.min(1, Math.max(0, ratio)) * totalRef.current);
        },
        onPanResponderMove: (evt) => {
          const ratio = evt.nativeEvent.locationX / (barWidthRef.current || 1);
          setScrubTime(Math.min(1, Math.max(0, ratio)) * totalRef.current);
        },
        onPanResponderRelease: () => {
          if (scrubTimeRef.current != null) {
            onSeek(scrubTimeRef.current);
          }
          setScrubTime(null);
        },
        onPanResponderTerminate: () => setScrubTime(null),
      }),
    [onSeek]
  );

  const displayTime = scrubTime ?? time;
  const progress = total > 0 ? Math.min(1, displayTime / total) : 0;
  const previewCue =
    scrubTime != null ? findThumbnail(thumbnails, scrubTime) : null;
  // Quão atrás da borda ao vivo estamos; <15s consideramos "no ao vivo".
  const behindLive = isLive ? Math.max(0, seekableDuration - time) : 0;
  const atLiveEdge = behindLive < 15;

  // null = legendas desligadas; os demais valores vêm de subtitlesAvailable.
  const cycleSubtitle = () => {
    const options: Array<string | null> = [null, ...subtitles];
    const index = options.findIndex((o) => o === subtitle);
    onSelectSubtitle(options[(index + 1) % options.length] ?? null);
  };

  const cycleAudioTrack = () => {
    const options: Array<string | null> = [null, ...audioTracks];
    const index = options.findIndex((o) => o === audioTrack);
    onSelectAudioTrack(options[(index + 1) % options.length] ?? null);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bottom}>
        {/* Preview do scrub: recorte do sprite via container overflow:hidden
            deslocando a imagem inteira em -x/-y (técnica de sprite sheet).
            Funciona para sprites de linha única (thumbnail.vtt#xywh) e
            grades 2D (EXT-X-IMAGE-STREAM-INF com EXT-X-TILES). */}
        {previewCue && spriteSize ? (
          <View
            style={[
              styles.previewWrapper,
              {
                left: Math.min(
                  Math.max(0, progress * barWidth - 50 * PREVIEW_SCALE),
                  Math.max(0, barWidth - 100 * PREVIEW_SCALE)
                ),
              },
            ]}
            pointerEvents="none"
          >
            <View
              style={{
                width: (previewCue.width ?? spriteSize.width) * PREVIEW_SCALE,
                height:
                  (previewCue.height ?? spriteSize.height) * PREVIEW_SCALE,
                overflow: 'hidden',
              }}
              testID="thumbnail-preview"
            >
              <Image
                source={{ uri: previewCue.uri }}
                style={{
                  position: 'absolute',
                  left: -(previewCue.x ?? 0) * PREVIEW_SCALE,
                  top: -(previewCue.y ?? 0) * PREVIEW_SCALE,
                  width: spriteSize.width * PREVIEW_SCALE,
                  height: spriteSize.height * PREVIEW_SCALE,
                }}
              />
            </View>
            <Text style={styles.previewTime}>{formatTime(displayTime)}</Text>
          </View>
        ) : null}

        <View
          style={styles.seekBarTouchArea}
          testID="ctl-seekbar"
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View style={styles.seekBarTrack}>
            <View
              style={[styles.seekBarFill, { flex: progress }]}
              pointerEvents="none"
            />
            <View style={{ flex: 1 - progress }} pointerEvents="none" />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={onPlayPause}
            style={styles.button}
            testID="ctl-playpause"
          >
            <Text style={styles.buttonText}>{playing ? '⏸' : '▶️'}</Text>
          </Pressable>

          <Text style={styles.timeText} testID="ctl-time">
            {isLive
              ? atLiveEdge && scrubTime == null
                ? 'AO VIVO'
                : `-${formatTime(seekableDuration - displayTime)}`
              : `${formatTime(displayTime)} / ${formatTime(duration)}`}
          </Text>

          <View style={styles.buttonGroup}>
            {isLive && dvrEnabled ? (
              <Pressable
                onPress={onSeekToLive}
                style={styles.button}
                testID="ctl-live"
              >
                <Text
                  style={[
                    styles.buttonText,
                    atLiveEdge ? styles.liveActive : styles.liveBehind,
                  ]}
                >
                  ● AO VIVO
                </Text>
              </Pressable>
            ) : null}
            {subtitles.length > 0 ? (
              <Pressable
                onPress={cycleSubtitle}
                style={styles.button}
                testID="ctl-subtitle"
              >
                <Text style={styles.buttonText}>CC: {subtitle ?? 'off'}</Text>
              </Pressable>
            ) : null}
            {audioTracks.length > 1 ? (
              <Pressable
                onPress={cycleAudioTrack}
                style={styles.button}
                testID="ctl-audio"
              >
                <Text style={styles.buttonText}>🔊 {audioTrack ?? 'auto'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // equivalente a absoluteFillObject (removido dos typings no RN 0.86)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  bottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  seekBarTouchArea: {
    height: 28,
    justifyContent: 'center',
  },
  seekBarTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  seekBarFill: {
    backgroundColor: '#ff3b30',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  liveActive: {
    color: '#ff3b30',
  },
  liveBehind: {
    color: '#bbb',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  previewWrapper: {
    position: 'absolute',
    bottom: 76,
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 4,
    padding: 2,
  },
  previewTime: {
    color: '#fff',
    fontSize: 11,
    paddingTop: 2,
  },
});

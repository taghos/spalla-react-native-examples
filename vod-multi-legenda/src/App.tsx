import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, {
  SpallaCastButton,
  initialize,
  type ThumbnailCue,
} from 'spalla-react-native';
import CustomControls from './CustomControls';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders pelos seus valores.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '019ff62e-1f07-750f-a304-45888f7140e0';

export default function App() {
  const ref = React.useRef<SpallaPlayer | null>(null);
  const [playing, setPlaying] = React.useState(true);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  // Idiomas anunciados por subtitlesAvailable (embutida no manifest + config).
  const [subtitles, setSubtitles] = React.useState<string[]>([]);
  const [subtitle, setSubtitle] = React.useState<string | null>(null);
  // Cues de preview do scrub (thumbnail.vtt).
  const [thumbnails, setThumbnails] = React.useState<ThumbnailCue[]>([]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>VoD multi-legenda</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            ref={ref}
            style={styles.video}
            contentId={CONTENT_ID}
            // hideUI liga os controles customizados (CustomControls).
            hideUI
            subtitle={subtitle}
            onPlayerEvent={({ nativeEvent }) => {
              switch (nativeEvent.event) {
                case 'timeUpdate':
                  setTime(nativeEvent.time);
                  break;
                case 'durationUpdate':
                case 'metadataLoaded':
                  setDuration(nativeEvent.duration);
                  break;
                case 'play':
                case 'playing':
                  setPlaying(true);
                  break;
                case 'pause':
                case 'ended':
                  setPlaying(false);
                  break;
                case 'subtitlesAvailable':
                  setSubtitles(nativeEvent.subtitles.map(String));
                  break;
                case 'thumbnailsAvailable':
                  setThumbnails(nativeEvent.thumbnails);
                  break;
                default:
                  break;
              }
            }}
          >
            <CustomControls
              playing={playing}
              time={time}
              duration={duration}
              seekableDuration={0}
              isLive={false}
              dvrEnabled={false}
              subtitles={subtitles}
              subtitle={subtitle}
              audioTracks={[]}
              audioTrack={null}
              thumbnails={thumbnails}
              onPlayPause={() =>
                playing ? ref.current?.pause() : ref.current?.play()
              }
              onSeek={(t) => ref.current?.seekTo(t)}
              onSeekToLive={() => ref.current?.seekToLive()}
              onSelectSubtitle={setSubtitle}
              onSelectAudioTrack={() => {}}
            />
          </SpallaPlayer>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#222',
  },
  title: { color: '#fff', fontSize: 14, fontWeight: '600' },
  videoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  video: { flex: 1, width: '100%', backgroundColor: 'black' },
});

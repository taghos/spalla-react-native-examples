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

const CONTENT_ID = '019a5573-adff-7961-ae93-aa8c9314200d';

export default function App() {
  const ref = React.useRef<SpallaPlayer | null>(null);
  const [playing, setPlaying] = React.useState(true);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  // Cues do image stream (EXT-X-IMAGE-STREAM-INF / EXT-X-TILES).
  const [thumbnails, setThumbnails] = React.useState<ThumbnailCue[]>([]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>VoD com thumbnails (image stream)</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            ref={ref}
            style={styles.video}
            contentId={CONTENT_ID}
            hideUI
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
                case 'thumbnailsAvailable':
                  // Cues vindos do EXT-X-IMAGE-STREAM-INF (grade EXT-X-TILES).
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
              subtitles={[]}
              subtitle={null}
              audioTracks={[]}
              audioTrack={null}
              thumbnails={thumbnails}
              onPlayPause={() =>
                playing ? ref.current?.pause() : ref.current?.play()
              }
              onSeek={(t) => ref.current?.seekTo(t)}
              onSeekToLive={() => ref.current?.seekToLive()}
              onSelectSubtitle={() => {}}
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

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

const CONTENT_ID = '019ff7ee-d5c3-77e6-ad83-aad52fad1353';

export default function App() {
  const ref = React.useRef<SpallaPlayer | null>(null);
  const [playing, setPlaying] = React.useState(true);
  const [time, setTime] = React.useState(0);
  // Fim da faixa buscável = tamanho da janela DVR.
  const [seekableDuration, setSeekableDuration] = React.useState(0);
  const [isLive, setIsLive] = React.useState(false);
  const [dvrEnabled, setDvrEnabled] = React.useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live com janela DVR</Text>
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
                  if (nativeEvent.seekableDuration != null) {
                    setSeekableDuration(nativeEvent.seekableDuration);
                  }
                  break;
                case 'metadataLoaded':
                  setIsLive(nativeEvent.isLive);
                  setDvrEnabled(nativeEvent.dvrEnabled ?? false);
                  break;
                case 'play':
                case 'playing':
                  setPlaying(true);
                  break;
                case 'pause':
                case 'ended':
                  setPlaying(false);
                  break;
                default:
                  break;
              }
            }}
          >
            <CustomControls
              playing={playing}
              time={time}
              duration={0}
              seekableDuration={seekableDuration}
              isLive={isLive}
              dvrEnabled={dvrEnabled}
              subtitles={[]}
              subtitle={null}
              audioTracks={[]}
              audioTrack={null}
              thumbnails={[] as ThumbnailCue[]}
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

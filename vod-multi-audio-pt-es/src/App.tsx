import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, { SpallaCastButton, initialize } from 'spalla-react-native';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders pelos seus valores.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '019ff62e-1f07-750f-a304-45888f7140e0';

export default function App() {
  // Duas trilhas nomeadas no manifest (ex.: Português/Español).
  const [audioTracks, setAudioTracks] = React.useState<string[]>([]);
  const [audioTrack, setAudioTrack] = React.useState<string | null>(null);

  // Cicla: faixa padrão (null) -> cada idioma -> padrão ...
  const cycleAudioTrack = () => {
    const options: Array<string | null> = [null, ...audioTracks];
    const index = options.findIndex((o) => o === audioTrack);
    setAudioTrack(options[(index + 1) % options.length] ?? null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>VoD multi-áudio (PT/ES)</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            style={styles.video}
            contentId={CONTENT_ID}
            audioTrack={audioTrack}
            onPlayerEvent={({ nativeEvent }) => {
              if (nativeEvent.event === 'audioTracksAvailable') {
                setAudioTracks(nativeEvent.audioTracks.map(String));
              }
            }}
          />
        </View>
        <View style={styles.bar}>
          <Button
            title={`Idioma do áudio: ${audioTrack ?? 'auto'}`}
            onPress={cycleAudioTrack}
          />
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
  bar: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#111' },
});

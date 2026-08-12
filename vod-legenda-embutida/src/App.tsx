import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, { SpallaCastButton, initialize } from 'spalla-react-native';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders pelos seus valores.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '01870fa7-487f-7acd-9b27-a4d86d392368';

export default function App() {
  const [subtitles, setSubtitles] = React.useState<string[]>([]);
  const [subtitle, setSubtitle] = React.useState<string | null>(null);

  // Cicla: legendas off -> cada idioma disponível -> off ...
  const cycleSubtitle = () => {
    const options: Array<string | null> = [null, ...subtitles];
    const index = options.findIndex((o) => o === subtitle);
    setSubtitle(options[(index + 1) % options.length] ?? null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>VoD legenda embutida</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            style={styles.video}
            contentId={CONTENT_ID}
            subtitle={subtitle}
            onPlayerEvent={({ nativeEvent }) => {
              if (nativeEvent.event === 'subtitlesAvailable') {
                // Legenda embutida no manifest ("embutida vence") + dedupe.
                setSubtitles(nativeEvent.subtitles.map(String));
              }
            }}
          />
        </View>
        <View style={styles.bar}>
          <Button
            title={`Legenda: ${subtitle ?? 'off'}`}
            onPress={cycleSubtitle}
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
  bar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111',
  },
});

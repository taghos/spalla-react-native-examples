import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, { SpallaCastButton, initialize } from 'spalla-react-native';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders pelos seus valores.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '019ff7f6-b123-7bbe-a667-085b1a0b0fc8';

export default function App() {
  // Metadados do stream chegam em metadataLoaded. LL-HLS toca direto do
  // CDN (sem DAI); aqui mostramos as características anunciadas.
  const [meta, setMeta] = React.useState<{
    isLive: boolean;
    dvrEnabled: boolean;
    lowLatency: boolean;
    duration: number;
  } | null>(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live LL-HLS (baixa latência)</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            style={styles.video}
            contentId={CONTENT_ID}
            onPlayerEvent={({ nativeEvent }) => {
              if (nativeEvent.event === 'metadataLoaded') {
                setMeta({
                  isLive: nativeEvent.isLive,
                  dvrEnabled: nativeEvent.dvrEnabled ?? false,
                  lowLatency: nativeEvent.lowLatency ?? false,
                  duration: nativeEvent.duration,
                });
              }
            }}
          />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelText}>
            {meta
              ? `isLive: ${meta.isLive}  ·  lowLatency: ${meta.lowLatency}  ·  dvrEnabled: ${meta.dvrEnabled}`
              : 'Carregando metadados…'}
          </Text>
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
  panel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#000',
  },
  panelText: { color: '#7fff7f', fontSize: 11, fontFamily: 'monospace' },
});

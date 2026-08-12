import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, { SpallaCastButton, initialize } from 'spalla-react-native';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders pelos seus valores.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '019ff798-b4d6-75ce-b87c-5cfb35353287';

// Eventos do ciclo de vida de anúncios (server-side ad insertion / DAI).
const AD_EVENTS = [
  'adBreakBegin',
  'adBreakEnd',
  'adBegin',
  'adEnd',
  'adError',
];

export default function App() {
  const [adLog, setAdLog] = React.useState<string[]>([]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live com Google DAI</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            style={styles.video}
            contentId={CONTENT_ID}
            onPlayerEvent={({ nativeEvent }) => {
              if (AD_EVENTS.includes(nativeEvent.event)) {
                const stamp = new Date().toLocaleTimeString();
                setAdLog((prev) => [
                  ...prev.slice(-8),
                  `${stamp} ${nativeEvent.event}`,
                ]);
              }
            }}
          />
        </View>
        <ScrollView style={styles.log}>
          {adLog.length === 0 ? (
            <Text style={styles.logText}>Aguardando ad breaks…</Text>
          ) : (
            adLog.map((line, i) => (
              <Text key={i} style={styles.logText}>
                {line}
              </Text>
            ))
          )}
        </ScrollView>
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
  log: {
    maxHeight: 130,
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logText: { color: '#7fff7f', fontSize: 11, fontFamily: 'monospace' },
});

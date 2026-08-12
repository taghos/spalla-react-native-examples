import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpallaPlayer, { SpallaCastButton, initialize } from 'spalla-react-native';

// Chame initialize() antes de montar qualquer SpallaPlayer. Troque os
// placeholders: o token autentica na API da Spalla; o 2º parâmetro é o
// App ID do Chromecast.
initialize('SEU_TOKEN', 'SEU_APP_ID');

const CONTENT_ID = '019fddce-fc67-73f7-aadf-d1370ab381f0';

export default function App() {
  // isVertical vem de metadataLoaded (sp_vertical no config ou a resolução);
  // usamos para trocar o container do player para 9:16.
  const [isVertical, setIsVertical] = React.useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>VoD vertical</Text>
          <SpallaCastButton tintColor="white" />
        </View>
        <View style={styles.videoArea}>
          <SpallaPlayer
            style={isVertical ? styles.videoVertical : styles.video}
            contentId={CONTENT_ID}
            onPlayerEvent={({ nativeEvent }) => {
              if (nativeEvent.event === 'metadataLoaded') {
                setIsVertical(nativeEvent.isVertical ?? false);
              }
            }}
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
  videoVertical: {
    height: '100%',
    aspectRatio: 9 / 16,
    alignSelf: 'center',
    backgroundColor: 'black',
  },
});

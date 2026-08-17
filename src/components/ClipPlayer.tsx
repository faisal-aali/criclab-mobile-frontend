import { useVideoPlayer, VideoView } from 'expo-video'
import { Text, View } from 'react-native'
import { colors } from '../theme'

export function ClipPlayer({ uri, label }: { uri: string; label: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false
  })

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: '#000',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.pitchDeep,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>
          {label.toUpperCase()}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '700' }}>CRIC-LAB AI</Text>
      </View>
      <VideoView
        player={player}
        style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}
        nativeControls
        contentFit="contain"
      />
    </View>
  )
}

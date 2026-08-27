import type { ReactNode } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Text, View } from 'react-native'
import { colors } from '../theme'

export function ClipPlayer({
  uri,
  label,
  aspectRatio = 16 / 9,
  overlay,
}: {
  uri: string
  label: string
  aspectRatio?: number
  overlay?: ReactNode
}) {
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
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '700' }}>CRICLAB</Text>
      </View>
      <View>
        <VideoView
          player={player}
          style={{ width: '100%', aspectRatio, backgroundColor: '#000' }}
          nativeControls
          contentFit="contain"
        />
        {overlay ? <View pointerEvents="none" style={{ position: 'absolute', top: 12, left: 12 }}>{overlay}</View> : null}
      </View>
    </View>
  )
}

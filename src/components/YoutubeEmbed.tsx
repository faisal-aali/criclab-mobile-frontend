import Ionicons from '@expo/vector-icons/Ionicons'
import { createElement, useMemo } from 'react'
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { colors } from '../theme'

export function youtubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?playsinline=1&rel=0&modestbranding=1`
}

export function YoutubeEmbed({
  youtubeId,
  title,
  active,
  onActivate,
  eager = false,
}: {
  youtubeId: string
  title: string
  active: boolean
  onActivate: () => void
  /** Mount the player immediately (recommended shelf). Library cards wait for a tap. */
  eager?: boolean
}) {
  const src = useMemo(() => youtubeEmbedUrl(youtubeId), [youtubeId])
  const showPlayer = Boolean(youtubeId) && (eager || active)

  if (!youtubeId) {
    return <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.night }} />
  }

  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src,
      title,
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
      allowFullScreen: true,
      style: {
        width: '100%',
        aspectRatio: '16 / 9',
        border: 0,
        display: 'block',
        backgroundColor: '#000',
      },
    })
  }

  if (!showPlayer) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${title}`}
        onPress={onActivate}
        style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}
      >
        <Image
          source={{ uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.lime,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="play" size={26} color={colors.onLime} style={{ marginLeft: 3 }} />
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>
      <WebView
        source={{ uri: src }}
        style={{ flex: 1, backgroundColor: '#000' }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled={false}
        originWhitelist={['https://*']}
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
      />
    </View>
  )
}

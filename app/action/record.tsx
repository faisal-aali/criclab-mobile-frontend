import { Ionicons } from '@expo/vector-icons'
import { useCameraPermissions } from 'expo-camera'
import { useIsFocused } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SlowMoCamera, hasHighSpeedCameraNative, type SlowMoCameraHandle } from '../../src/camera/SlowMoCamera'
import { stashActionClip } from '../../src/camera/pendingActionClip'
import { colors } from '../../src/theme'

export default function ActionRecord() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const cameraRef = useRef<SlowMoCameraHandle>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [recording, setRecording] = useState(false)
  const [format, setFormat] = useState(hasHighSpeedCameraNative() ? '1080p · 120 fps' : '1080p')
  const [elapsed, setElapsed] = useState(0)
  const nativeHighSpeed = hasHighSpeedCameraNative()

  useEffect(() => {
    void requestPermission()
  }, [requestPermission])

  useEffect(() => {
    if (!recording) {
      setElapsed(0)
      return
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  async function toggleRecord() {
    if (!permission?.granted) {
      const next = await requestPermission()
      if (!next.granted) {
        Alert.alert('Camera needed', 'CricLab records a side-on delivery from this phone.')
        return
      }
    }
    if (recording) {
      cameraRef.current?.stop()
      return
    }
    setRecording(true)
    try {
      const clip = await cameraRef.current?.record({ maxDuration: 30 })
      if (!clip?.uri) return
      stashActionClip({
        uri: clip.uri,
        name: 'delivery-1080p.mp4',
        mimeType: 'video/mp4',
      })
      router.back()
    } catch (err) {
      Alert.alert('Record failed', err instanceof Error ? err.message : 'Could not save the clip.')
    } finally {
      setRecording(false)
    }
  }

  if (!permission) return <View style={styles.fill} />

  return (
    <View style={styles.fill}>
      {permission.granted ? (
        <SlowMoCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          isActive={isFocused}
          mode="video"
          enableVideo
          onFormat={setFormat}
        />
      ) : (
        <View style={[styles.fill, styles.center]}>
          <Text style={styles.denied}>Camera access is required to film a delivery.</Text>
        </View>
      )}

      {recording ? <View pointerEvents="none" style={styles.recordingFrame} /> : null}
      <View pointerEvents="none" style={styles.guideFrame} />

      <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{format}</Text>
        </View>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {recording
              ? `Recording ${elapsed}s · keep the full action in frame, then stop.`
              : nativeHighSpeed
                ? 'High-speed capture (1080p / 120 fps when the phone supports it). Side-on, full body, ball visible after release.'
                : '1080p in-app camera. 120 fps needs a CricLab development build (not Expo Go). Side-on, full body.'}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12} disabled={recording}>
          <Ionicons name="close" size={22} color="#111" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 20, right: 20 }}>
        <Pressable
          onPress={toggleRecord}
          disabled={!permission.granted}
          style={[styles.primary, { backgroundColor: recording ? '#E11D2A' : colors.lime, opacity: permission.granted ? 1 : 0.6 }]}
        >
          <Text style={[styles.primaryText, { color: recording ? '#fff' : colors.onLime }]}>
            {recording ? 'Stop' : 'Record'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  denied: { color: colors.white, fontWeight: '700', paddingHorizontal: 24, textAlign: 'center' },
  recordingFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#E11D2A',
  },
  guideFrame: {
    position: 'absolute',
    top: '18%',
    bottom: '22%',
    left: '10%',
    right: '10%',
    borderWidth: 1.5,
    borderColor: 'rgba(182,242,74,0.55)',
    borderRadius: 16,
  },
  badge: {
    backgroundColor: 'rgba(182,242,74,0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '800', color: '#05090a', fontSize: 12 },
  banner: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgba(5,9,10,0.88)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    color: '#f6f9f7',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#b6f24a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { fontWeight: '800', fontSize: 16, color: '#05090a' },
})

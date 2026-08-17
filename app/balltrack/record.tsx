import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { uploadSession } from '../../src/balltrack/api'
import { DraggableStumpBox, PitchOverlay } from '../../src/balltrack/pitchGuide'
import { BATTER_BOX, BOWLER_BOX, type Box } from '../../src/balltrack/types'
import { colors } from '../../src/theme'

type Phase = 'align' | 'armed'

export default function BallTrackRecord() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [phase, setPhase] = useState<Phase>('align')
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bowler, setBowler] = useState<Box>(BOWLER_BOX)
  const [batter, setBatter] = useState<Box>(BATTER_BOX)
  const [layout, setLayout] = useState({ w: 0, h: 0 })

  async function toggleRecord() {
    if (!permission?.granted) {
      const next = await requestPermission()
      if (!next.granted) {
        Alert.alert('Camera needed', 'Ball Track films down the pitch from this phone.')
        return
      }
    }
    if (recording) {
      cameraRef.current?.stopRecording()
      return
    }
    setRecording(true)
    try {
      const clip = await cameraRef.current?.recordAsync({ maxDuration: 180 })
      if (!clip?.uri) return
      setBusy(true)
      const res = await uploadSession({
        uri: clip.uri,
        name: 'session.mp4',
        mimeType: 'video/mp4',
        calibration: { bowler, batter, pitch_length_m: 20.12 },
      })
      router.replace(`/balltrack/processing/${res.job_id}`)
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not start tracking')
    } finally {
      setRecording(false)
      setBusy(false)
    }
  }

  if (!permission) return <View style={styles.fill} />

  return (
    <View style={styles.fill} onLayout={(e) => setLayout(e.nativeEvent.layout)}>
      {permission.granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="video"
          mute
          videoQuality="720p"
        />
      ) : (
        <View style={[styles.fill, { backgroundColor: colors.pitchDeep, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: colors.white, fontWeight: '700', paddingHorizontal: 24, textAlign: 'center' }}>
            Camera access is required to film a session.
          </Text>
        </View>
      )}

      {recording ? <View pointerEvents="none" style={styles.recordingFrame} /> : null}

      {phase === 'align' ? (
        <>
          <DraggableStumpBox box={batter} label="Striker stumps" onChange={setBatter} layout={layout} />
          <DraggableStumpBox box={bowler} label="Non-Striker stumps" onChange={setBowler} layout={layout} />
        </>
      ) : (
        <PitchOverlay bowler={bowler} batter={batter} />
      )}

      <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, flexDirection: 'row', alignItems: 'flex-start', zIndex: 2 }}>
        {phase === 'armed' ? (
          <Pressable onPress={() => setPhase('align')} style={styles.pill}>
            <Text style={styles.pillText}>Redetect</Text>
          </Pressable>
        ) : (
          <View style={{ width: 88 }} />
        )}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {phase === 'align'
              ? 'Drag each red box onto the real stumps. Use the red dot to resize, then Continue.'
              : recording
                ? 'Recording… bowl as usual, then stop when the session is done.'
                : "Virtual stumps should sit on the real ones. Press Redetect if they don't line up, then record."}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={22} color="#111" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 20, right: 20, zIndex: 2 }}>
        {phase === 'align' ? (
          <Pressable onPress={() => setPhase('armed')} style={styles.primary}>
            <Text style={styles.primaryText}>Continue</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={toggleRecord}
            disabled={busy}
            style={[styles.primary, { backgroundColor: recording ? '#E11D2A' : '#fff', opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={[styles.primaryText, { color: recording ? '#fff' : colors.pitch }]}>
              {busy ? 'Uploading…' : recording ? 'Stop & analyze' : 'Record session'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  recordingFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#E11D2A',
  },
  banner: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  pill: {
    backgroundColor: 'rgba(147,197,253,0.95)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontWeight: '800', color: '#0F172A', fontSize: 13 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { fontWeight: '800', fontSize: 16, color: colors.pitch },
})

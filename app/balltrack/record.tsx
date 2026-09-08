import { Ionicons } from '@expo/vector-icons'
import { useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useIsFocused } from '../../src/navigation/useIsFocused'
import { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { detectStumps, uploadSession } from '../../src/balltrack/api'
import { ClipUploadOverlay } from '../../src/components/ClipUploadOverlay'
import type { ClipUploadProgress } from '../../src/api/client'
import { DraggableStumpBox, PitchOverlay } from '../../src/balltrack/pitchGuide'
import { BATTER_BOX, BOWLER_BOX, type Box } from '../../src/balltrack/types'
import { SlowMoCamera, hasHighSpeedCameraNative, type SlowMoCameraHandle } from '../../src/camera/SlowMoCamera'
import { useProcessingJobs } from '../../src/processing/ProcessingJobs'
import { colors } from '../../src/theme'

type Phase = 'align' | 'armed'

export default function BallTrackRecord() {
  const router = useRouter()
  const { trackJob } = useProcessingJobs()
  const insets = useSafeAreaInsets()
  const cameraRef = useRef<SlowMoCameraHandle>(null)
  const isFocused = useIsFocused()
  const [permission, requestPermission] = useCameraPermissions()
  const [format, setFormat] = useState(hasHighSpeedCameraNative() ? '1080p · 120 fps' : '1080p')
  const [phase, setPhase] = useState<Phase>('align')
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<ClipUploadProgress | null>(null)
  const [finding, setFinding] = useState(false)
  const [hintBowler, setHintBowler] = useState<Box>(BOWLER_BOX)
  const [hintBatter, setHintBatter] = useState<Box>(BATTER_BOX)
  const [bowler, setBowler] = useState<Box>(BOWLER_BOX)
  const [batter, setBatter] = useState<Box>(BATTER_BOX)
  const [layout, setLayout] = useState({ w: 0, h: 0 })

  async function findStumps() {
    if (!permission?.granted) {
      const next = await requestPermission()
      if (!next.granted) {
        Alert.alert('Camera needed', 'Ball Track films down the pitch from this phone.')
        return
      }
    }
    setFinding(true)
    try {
      const shot = await cameraRef.current?.takePicture()
      if (!shot?.uri) {
        Alert.alert('No frame', 'Could not capture the camera frame.')
        return
      }
      const found = await detectStumps({ uri: shot.uri, bowler: hintBowler, batter: hintBatter })
      setBowler(found.bowler)
      setBatter(found.batter)
      setPhase('armed')
    } catch (err) {
      setPhase('align')
      Alert.alert(
        'Stumps not found',
        err instanceof Error
          ? err.message
          : 'Fit both wicket sets in the red boxes and try Continue again.',
      )
    } finally {
      setFinding(false)
    }
  }

  async function toggleRecord() {
    if (!permission?.granted) {
      const next = await requestPermission()
      if (!next.granted) {
        Alert.alert('Camera needed', 'Ball Track films down the pitch from this phone.')
        return
      }
    }
    if (recording) {
      cameraRef.current?.stop()
      return
    }
    setRecording(true)
    try {
      const clip = await cameraRef.current?.record({ maxDuration: 180 })
      if (!clip?.uri) return
      setBusy(true)
      setUploadProgress({ phase: 'cloudinary', loaded: 0, total: 1 })
      const res = await uploadSession(
        {
          uri: clip.uri,
          name: 'session.mp4',
          mimeType: 'video/mp4',
          calibration: { bowler, batter, pitch_length_m: 20.12 },
        },
        setUploadProgress,
      )
      trackJob({ id: res.job_id, kind: 'ballflight' })
      Alert.alert(
        'Queued for the lab',
        'Ball flight runs in the background. Watch the lime ring in the header.',
        [
          { text: 'Watch progress', onPress: () => router.replace(`/balltrack/processing/${res.job_id}`) },
          { text: 'OK', onPress: () => router.replace('/(tabs)/balltrack') },
        ],
      )
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not start tracking')
    } finally {
      setRecording(false)
      setBusy(false)
      setUploadProgress(null)
    }
  }

  if (!permission) return <View style={styles.fill} />

  return (
    <View style={styles.fill} onLayout={(e) => setLayout({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {permission.granted ? (
        <SlowMoCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          isActive={isFocused}
          mode={phase === 'armed' ? 'video' : 'picture'}
          enablePhoto
          enableVideo={phase === 'armed'}
          onFormat={setFormat}
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
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
          <DraggableStumpBox box={hintBatter} label="Striker stumps" onChange={setHintBatter} layout={layout} />
          <DraggableStumpBox box={hintBowler} label="Non-Striker stumps" onChange={setHintBowler} layout={layout} />
        </View>
      ) : (
        <PitchOverlay bowler={bowler} batter={batter} />
      )}

      <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, flexDirection: 'row', alignItems: 'flex-start', zIndex: 12 }}>
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{format}</Text>
          </View>
          {phase === 'armed' ? (
            <Pressable onPress={() => setPhase('align')} disabled={recording || finding} style={[styles.pill, { marginTop: 8 }]}>
              <Text style={styles.pillText}>Resize</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {finding
              ? 'Finding the wickets and drawing the pitch line…'
              : phase === 'align'
                ? 'Resize the boxes so both stump sets are inside, then Continue. The lab finds the wickets and draws the line between them.'
                : recording
                  ? `Recording ${format}… bowl as usual, then stop when the session is done.`
                  : 'Resize if the boxes missed the stumps, then Continue again.'}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={22} color="#111" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 20, right: 20, zIndex: 12 }}>
        {phase === 'align' ? (
          <Pressable onPress={findStumps} disabled={finding} style={[styles.primary, { opacity: finding ? 0.6 : 1 }]}>
            <Text style={styles.primaryText}>{finding ? 'Finding stumps…' : 'Continue'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={toggleRecord}
            disabled={busy || finding}
            style={[styles.primary, { backgroundColor: recording ? '#E11D2A' : colors.lime, opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={[styles.primaryText, { color: recording ? '#fff' : colors.onLime }]}>
              {busy ? 'Uploading…' : recording ? 'Stop & analyze' : 'Record session'}
            </Text>
          </Pressable>
        )}
      </View>
      <ClipUploadOverlay progress={uploadProgress} label="Ball flight" />
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
  pill: {
    backgroundColor: 'rgba(147,197,253,0.95)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontWeight: '800', color: '#0F172A', fontSize: 13 },
  badge: {
    backgroundColor: 'rgba(182,242,74,0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '800', color: '#05090a', fontSize: 12 },
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

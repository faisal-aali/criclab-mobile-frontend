import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Line, Polygon, Rect } from 'react-native-svg'
import { uploadSession } from '../../src/balltrack/api'
import { BATTER_BOX, BOWLER_BOX } from '../../src/balltrack/types'
import { colors } from '../../src/theme'

type Phase = 'align' | 'armed'

function pct(n: number) {
  return `${n * 100}%`
}

function DashedBox({
  box,
  label,
}: {
  box: { x: number; y: number; w: number; h: number }
  label: string
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: pct(box.x),
        top: pct(box.y),
        width: pct(box.w),
        height: pct(box.h),
        borderWidth: 2,
        borderColor: '#E11D2A',
        borderStyle: 'dashed',
        borderRadius: 4,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          marginTop: -20,
          color: '#E11D2A',
          fontSize: 12,
          fontWeight: '800',
        }}
      >
        {label}
      </Text>
    </View>
  )
}

function ArmedGuides() {
  const bowTop = BOWLER_BOX.y
  const bowMidX = BOWLER_BOX.x + BOWLER_BOX.w / 2
  const batBottom = BATTER_BOX.y + BATTER_BOX.h
  const batMidX = BATTER_BOX.x + BATTER_BOX.w / 2
  const stripW = 0.12
  const points = [
    `${(bowMidX - stripW) * 100},${bowTop * 100}`,
    `${(bowMidX + stripW) * 100},${bowTop * 100}`,
    `${(batMidX + stripW * 0.55) * 100},${batBottom * 100}`,
    `${(batMidX - stripW * 0.55) * 100},${batBottom * 100}`,
  ].join(' ')
  const stumpW = BOWLER_BOX.w * 0.12
  const stumpGap = BOWLER_BOX.w * 0.22
  const stumpH = BOWLER_BOX.h * 0.92
  const stumpY = BOWLER_BOX.y + BOWLER_BOX.h * 0.04
  const left = BOWLER_BOX.x + BOWLER_BOX.w / 2 - stumpGap - stumpW / 2

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polygon points={points} fill="rgba(40,120,255,0.35)" stroke="#3B82F6" strokeWidth="0.6" />
        <Line
          x1={bowMidX * 100}
          y1={bowTop * 100}
          x2={batMidX * 100}
          y2={batBottom * 100}
          stroke="#2563EB"
          strokeWidth="1.4"
        />
        {[0, 1, 2].map((i) => (
          <Rect
            key={i}
            x={(left + i * stumpGap) * 100}
            y={stumpY * 100}
            width={stumpW * 100}
            height={stumpH * 100}
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="0.2"
          />
        ))}
      </Svg>
    </View>
  )
}

export default function BallTrackRecord() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [phase, setPhase] = useState<Phase>('align')
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)

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
        calibration: { bowler: BOWLER_BOX, batter: BATTER_BOX, pitch_length_m: 20.12 },
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
    <View style={styles.fill}>
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
          <DashedBox box={BATTER_BOX} label="Striker stumps" />
          <DashedBox box={BOWLER_BOX} label="Non-Striker stumps" />
        </>
      ) : (
        <ArmedGuides />
      )}

      <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, flexDirection: 'row', alignItems: 'flex-start' }}>
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
              ? 'Fit the stumps in the boxes then press Continue. Pinch to zoom in or out!'
              : recording
                ? 'Recording… bowl as usual, then stop when the over or session is done.'
                : "Press 'Redetect' if the virtual stumps are not perfectly aligned. Start bowling, then record the session."}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={22} color="#111" />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 20, right: 20 }}>
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

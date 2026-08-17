import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { getBalltrackJob } from '../../../src/balltrack/api'
import type { BallTrackJob } from '../../../src/balltrack/types'
import { Screen } from '../../../src/components/Screen'
import { colors } from '../../../src/theme'

const STAGES = [
  { key: 'calibrate', label: 'Calibrating stumps' },
  { key: 'detect', label: 'Finding the ball' },
  { key: 'track', label: 'Fitting trajectories' },
  { key: 'metrics', label: 'Measuring speed & length' },
  { key: 'render', label: 'Building pitch map' },
]

export default function BallTrackProcessing() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const router = useRouter()
  const [job, setJob] = useState<BallTrackJob | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    let alive = true
    const tick = async () => {
      try {
        const data = await getBalltrackJob(jobId)
        if (!alive) return
        setJob(data)
        if (data.status === 'completed' && data.session_id) {
          router.replace(`/balltrack/session/${data.session_id}`)
          return
        }
        if (data.status === 'failed') {
          setError(data.message || data.error || 'Tracking failed')
        }
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Could not load job')
      }
    }
    tick()
    const timer = setInterval(tick, 1500)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [jobId, router])

  const progress = job?.progress ?? 0
  const stageKey = job?.stage === 'done' || job?.stage === 'queued' ? 'calibrate' : job?.stage
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))

  return (
    <Screen>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>
        BALL TRACK
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.pitch }}>
        {error ? (error.toLowerCase().includes('ball') ? 'No ball found' : 'Tracking failed') : 'Reading the session'}
      </Text>
      <Text style={{ marginTop: 10, textAlign: 'center', color: error ? colors.ball : colors.muted }}>
        {error || job?.message || 'Starting…'}
      </Text>
      {error ? (
        <Text style={{ marginTop: 8, textAlign: 'center', color: colors.muted, lineHeight: 20 }}>
          Empty clips, walking around, or anything that is not a cricket ball in flight will not get a speed.
        </Text>
      ) : null}

      <View style={{ marginTop: 22, height: 10, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' }}>
        <View
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
            height: 10,
            backgroundColor: error ? colors.ball : colors.seam,
          }}
        />
      </View>

      <View style={{ marginTop: 22, gap: 10 }}>
        {STAGES.map((s, i) => {
          const on = i === currentIdx && !error
          const done = i < currentIdx
          return (
            <Text
              key={s.key}
              style={{
                fontWeight: on ? '800' : '600',
                color: done ? colors.emerald : on ? colors.pitch : colors.muted,
              }}
            >
              {done ? '✓ ' : on ? '● ' : '○ '}
              {s.label}
            </Text>
          )
        })}
      </View>

      {error ? (
        <View style={{ marginTop: 28, gap: 10 }}>
          <Pressable
            onPress={() => router.replace('/balltrack/record')}
            style={{ backgroundColor: colors.pitch, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: colors.white, fontWeight: '800' }}>Film again</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/balltrack')} style={{ paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Back to Ball Track</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  )
}

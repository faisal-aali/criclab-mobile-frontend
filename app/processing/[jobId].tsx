import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { getJob, type Job } from '../../src/api/client'
import { Screen } from '../../src/components/Screen'
import { useFallbackBack } from '../../src/nav/back'
import { ProcessingShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

const STAGES = [
  { key: 'extract', label: 'Reading video' },
  { key: 'pose', label: 'Estimating bowler pose' },
  { key: 'action', label: 'Detecting release & phases' },
  { key: 'ball', label: 'Tracking ball flight' },
  { key: 'metrics', label: 'Calculating metrics' },
  { key: 'render', label: 'Rendering slow-motion overlay' },
  { key: 'upload', label: 'Saving processed video' },
  { key: 'agent', label: 'AI coaching analysis' },
  { key: 'pdf', label: 'Building PDF report' },
]

export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const router = useRouter()
  useFallbackBack()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return
    let alive = true
    const tick = async () => {
      try {
        const data = await getJob(jobId)
        if (!alive) return
        setJob(data)
        if (data.status === 'completed' && data.delivery_id) {
          router.replace(`/results/${data.delivery_id}`)
          return
        }
        if (data.status === 'failed') {
          setError(shortError(data.message || data.error || 'Analysis failed'))
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
  const stageKey = job?.stage === 'done' || job?.stage === 'queued' ? 'extract' : job?.stage
  const currentIdx = Math.max(0, STAGES.findIndex((s) => s.key === stageKey))
  const failed = job?.status === 'failed'

  return (
    <Screen safeTop={false}>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>
        PROCESSING
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.chalk }}>
        Reading the delivery
      </Text>
      <Text style={{ marginTop: 10, textAlign: 'center', color: colors.muted }}>
        {job?.message || 'Starting pipeline…'}
      </Text>
      <Text style={{ marginTop: 4, textAlign: 'center', fontSize: 12, color: colors.muted }}>
        Pose on a long clip can take several minutes. Keep this screen open.
        {job?.eta_seconds != null ? ` About ${Math.max(1, Math.round(job.eta_seconds))}s left.` : ''}
      </Text>

      {!job && !error ? (
        <ProcessingShimmer rows={9} />
      ) : (
        <>
      <View style={{ marginTop: 22, height: 10, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' }}>
        <View
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
            height: 10,
            backgroundColor: colors.seam,
          }}
        />
      </View>
      <Text style={{ marginTop: 8, textAlign: 'center', fontWeight: '700', color: colors.chalk }}>{progress}%</Text>

      <View style={{ marginTop: 20, gap: 10 }}>
        {STAGES.map((s, i) => {
          const done = !failed && (currentIdx > i || job?.status === 'completed')
          const active = !failed && currentIdx === i && job?.status !== 'completed'
          return (
            <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    failed && currentIdx === i
                      ? colors.ball
                      : done
                        ? colors.emerald
                        : active
                          ? colors.seam
                          : colors.line,
                }}
              >
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: '800' }}>{done ? '✓' : i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontWeight: done || active ? '700' : '500', color: done || active ? colors.chalk : colors.muted }}>
                {s.label}
              </Text>
              {active ? <ActivityIndicator color={colors.seam} /> : null}
            </View>
          )
        })}
      </View>
        </>
      )}

      {error ? (
        <View style={{ marginTop: 20, backgroundColor: colors.roseBg, borderRadius: 14, padding: 14 }}>
          <Text style={{ color: colors.ball }}>{error}</Text>
          <Link href="/" style={{ marginTop: 10, fontWeight: '800', color: colors.lime }}>
            Back to upload
          </Link>
        </View>
      ) : null}
    </Screen>
  )
}

function shortError(message: string) {
  const first = message.split('\n')[0]?.trim() || message
  return first.length > 280 ? `${first.slice(0, 277)}…` : first
}

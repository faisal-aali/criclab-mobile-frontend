import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { getJob, type Job } from '../../src/api/client'
import { ProcessingStages } from '../../src/components/ProcessingStages'
import { Screen } from '../../src/components/Screen'
import { useFallbackBack } from '../../src/nav/back'
import { ACTION_STAGES, ACTION_TIPS } from '../../src/processing/stages'
import { ProcessingShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

const POLL_MS = 500

export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const router = useRouter()
  useFallbackBack()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tip, setTip] = useState(0)

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
    void tick()
    const timer = setInterval(() => void tick(), POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [jobId, router])

  useEffect(() => {
    const rotate = setInterval(() => setTip((t) => (t + 1) % ACTION_TIPS.length), 6500)
    return () => clearInterval(rotate)
  }, [])

  const failed = job?.status === 'failed'
  const current = ACTION_TIPS[tip]

  return (
    <Screen safeTop={false} safeBottom>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
        WORKING ON IT
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.chalk }}>
        Reading the delivery
      </Text>
      <View
        style={{
          marginTop: 12,
          alignSelf: 'center',
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: failed ? colors.roseBg : 'rgba(182,242,74,0.12)',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: failed ? colors.ball : colors.lime }}>
          {failed ? 'Stopped' : `In progress — ${Math.round(job?.progress ?? 0)}%`}
        </Text>
      </View>

      {!job && !error ? (
        <ProcessingShimmer rows={11} />
      ) : (
        <ProcessingStages
          stages={ACTION_STAGES}
          progress={job?.progress}
          stage={job?.stage}
          doneKey="pdf"
          status={job?.status}
          message={job?.message}
          etaSeconds={job?.eta_seconds}
          stageDetail={job?.stage_detail}
          failed={failed}
        />
      )}

      {!failed ? (
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: colors.lime }}>{current.tag}</Text>
          <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.muted }}>{current.body}</Text>
          <View style={{ marginTop: 14, flexDirection: 'row', gap: 6 }}>
            {ACTION_TIPS.map((item, i) => (
              <View
                key={item.body}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: i === tip ? colors.lime : colors.line,
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 13, lineHeight: 20, color: colors.muted }}>
        You can leave this screen. Analysis keeps running, and this page opens the report when it finishes.
      </Text>

      {error ? (
        <View style={{ marginTop: 20, backgroundColor: colors.roseBg, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: colors.ball }}>
            WE COULD NOT FINISH THIS ONE
          </Text>
          <Text style={{ marginTop: 8, color: colors.chalk }}>{error}</Text>
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

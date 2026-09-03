import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { cancelJob, getJob, type Job } from '../../src/api/client'
import { ProcessingStages } from '../../src/components/ProcessingStages'
import { Screen } from '../../src/components/Screen'
import { useFallbackBack } from '../../src/nav/back'
import { useProcessingJobs } from '../../src/processing/ProcessingJobs'
import { ACTION_STAGES, ACTION_TIPS, isWaitingToStart } from '../../src/processing/stages'
import { ProcessingShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

const POLL_MS = 1500

export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const router = useRouter()
  const { untrackJob } = useProcessingJobs()
  useFallbackBack()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tip, setTip] = useState(0)
  const [cancelling, setCancelling] = useState(false)

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
        if (data.status === 'cancelled') {
          untrackJob(data.id)
          router.replace('/')
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
  }, [jobId, router, untrackJob])

  useEffect(() => {
    const rotate = setInterval(() => setTip((t) => (t + 1) % ACTION_TIPS.length), 6500)
    return () => clearInterval(rotate)
  }, [])

  const failed = job?.status === 'failed'
  const waiting = !failed && isWaitingToStart(job?.status)
  const current = ACTION_TIPS[tip]

  async function onCancel() {
    if (!jobId || cancelling) return
    setCancelling(true)
    try {
      await cancelJob(jobId)
      untrackJob(jobId)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this clip from the queue')
      setCancelling(false)
    }
  }

  return (
    <Screen safeTop={false} safeBottom>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
        {waiting ? 'IN THE QUEUE' : 'WORKING ON IT'}
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.chalk }}>
        {waiting ? 'Waiting to start' : 'Reading the delivery'}
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
          {failed ? 'Stopped' : waiting ? 'Queued' : `In progress — ${Math.round(job?.progress ?? 0)}%`}
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
          expectedStartAt={job?.expected_start_at}
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
        Analysis runs on the lab, not this phone. Leave this screen — the header ring keeps the progress.
      </Text>

      <Pressable
        onPress={() => router.replace('/')}
        style={{
          marginTop: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.lime,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.lime, fontWeight: '800' }}>Keep using CricLab</Text>
      </Pressable>

      {waiting ? (
        <Pressable
          onPress={() => void onCancel()}
          disabled={cancelling}
          style={{ marginTop: 10, paddingVertical: 12, alignItems: 'center' }}
        >
          <Text style={{ color: colors.muted, fontWeight: '700' }}>
            {cancelling ? 'Removing…' : 'Remove from queue'}
          </Text>
        </Pressable>
      ) : null}

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

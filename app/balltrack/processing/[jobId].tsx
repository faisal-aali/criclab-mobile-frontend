import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { cancelBalltrackJob, getBalltrackJob } from '../../../src/balltrack/api'
import type { BallTrackJob } from '../../../src/balltrack/types'
import { ProcessingStages } from '../../../src/components/ProcessingStages'
import { Screen } from '../../../src/components/Screen'
import { useProcessingJobs } from '../../../src/processing/ProcessingJobs'
import { BALL_FLIGHT_STAGES, isWaitingToStart } from '../../../src/processing/stages'
import { ProcessingShimmer } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

const POLL_MS = 1500

export default function BallTrackProcessing() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>()
  const router = useRouter()
  const { untrackJob } = useProcessingJobs()
  const [job, setJob] = useState<BallTrackJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

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
        if (data.status === 'cancelled') {
          untrackJob(data.id)
          router.replace('/(tabs)/balltrack')
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
    void tick()
    const timer = setInterval(() => void tick(), POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [jobId, router, untrackJob])

  const failed = Boolean(error) || job?.status === 'failed'
  const waiting = !failed && isWaitingToStart(job?.status)
  const noBall = (error || '').toLowerCase().includes('ball')

  async function onCancel() {
    if (!jobId || cancelling) return
    setCancelling(true)
    try {
      await cancelBalltrackJob(jobId)
      untrackJob(jobId)
      router.replace('/(tabs)/balltrack')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this session from the queue')
      setCancelling(false)
    }
  }

  return (
    <Screen safeTop={false} safeBottom>
      <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
        BALL FLIGHT
      </Text>
      <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 28, fontWeight: '800', color: colors.chalk }}>
        {failed
          ? noBall
            ? 'No ball found'
            : 'We could not finish this one'
          : waiting
            ? 'Waiting to start'
            : 'Tracking the ball'}
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
          {failed ? 'Stopped' : waiting ? 'Queued' : `Ball flight — ${Math.round(job?.progress ?? 0)}%`}
        </Text>
      </View>

      {!job && !error ? (
        <ProcessingShimmer rows={8} />
      ) : (
        <ProcessingStages
          stages={BALL_FLIGHT_STAGES}
          progress={job?.progress}
          stage={job?.stage}
          doneKey="agent"
          status={job?.status}
          message={error || job?.message}
          etaSeconds={job?.eta_seconds}
          expectedStartAt={job?.expected_start_at}
          stageDetail={job?.stage_detail}
          failed={failed}
        />
      )}

      {failed ? (
        <Text style={{ marginTop: 12, textAlign: 'center', color: colors.muted, lineHeight: 20 }}>
          Empty clips, walking around, or anything that is not a cricket ball in flight will not get a speed.
        </Text>
      ) : (
        <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 13, lineHeight: 20, color: colors.muted }}>
          Tracking runs on the lab. Leave this page — the header ring keeps the progress.
        </Text>
      )}

      {!failed ? (
        <Pressable
          onPress={() => router.replace('/(tabs)/balltrack')}
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
      ) : null}

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
        <View style={{ marginTop: 28, gap: 10 }}>
          <Pressable
            onPress={() => router.replace('/balltrack/record')}
            style={{ backgroundColor: colors.lime, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: colors.onLime, fontWeight: '800' }}>Film again</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/balltrack')} style={{ paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Back to Ball Track</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  )
}

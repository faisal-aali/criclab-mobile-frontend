import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { cancelActiveJob } from '../api/client'
import { jobHref, useProcessingJobs } from '../processing/ProcessingJobs'
import { canCancelJob, formatEta, formatExpectedAt, isWaitingToStart } from '../processing/stages'
import { colors } from '../theme'

const RING = 2 * Math.PI * 10

export function ProcessingIndicator() {
  const { jobs, untrackJob } = useProcessingJobs()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  if (jobs.length === 0) return null

  const primary = jobs[0]
  const pct = Math.max(0, Math.min(100, Math.round(primary.progress || 0)))
  const waiting = isWaitingToStart(primary.status)
  const dash = RING * (1 - (waiting ? 0.04 : pct / 100))

  async function onCancel(job: (typeof jobs)[number]) {
    if (cancellingId) return
    setCancellingId(job.id)
    try {
      await cancelActiveJob(job)
      untrackJob(job.id)
      setCancellingId(null)
      if (jobs.length <= 1) setOpen(false)
    } catch {
      setCancellingId(null)
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${jobs.length} clip${jobs.length === 1 ? '' : 's'} processing, ${pct}%`}
        onPress={() => setOpen(true)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.limeLine,
          backgroundColor: colors.limeSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={12} cy={12} r={10} fill="none" stroke={colors.lime} strokeOpacity={0.25} strokeWidth={2.4} />
          <Circle
            cx={12}
            cy={12}
            r={10}
            fill="none"
            stroke={colors.lime}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray={`${RING} ${RING}`}
            strokeDashoffset={dash}
          />
        </Svg>
        <Text
          style={{
            position: 'absolute',
            fontSize: 9,
            fontWeight: '800',
            color: colors.lime,
          }}
        >
          {waiting ? 'Q' : pct}
        </Text>
        {jobs.length > 1 ? (
          <View
            style={{
              position: 'absolute',
              right: -5,
              top: -5,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              paddingHorizontal: 4,
              backgroundColor: colors.lime,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '800', color: colors.onLime }}>{jobs.length}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-start', paddingTop: 88 }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              marginHorizontal: 16,
              backgroundColor: colors.charcoal,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.line,
              overflow: 'hidden',
              maxHeight: '70%',
            }}
          >
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line, paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontWeight: '800', color: colors.chalk }}>Processing</Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.muted }}>
                Runs in the lab. You can leave this screen.
              </Text>
            </View>
            <ScrollView>
              {jobs.map((job) => {
                const p = Math.max(0, Math.min(100, Math.round(job.progress || 0)))
                const queued = isWaitingToStart(job.status)
                const expected = queued ? formatExpectedAt(job.expected_start_at) : null
                const eta = queued ? null : formatEta(job.eta_seconds)
                const when = expected ? `Starts ${expected}` : eta
                return (
                  <Pressable
                    key={job.id}
                    onPress={() => {
                      setOpen(false)
                      router.push(jobHref(job) as never)
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.line,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ fontWeight: '800', color: colors.chalk }}>
                        {job.kind === 'ballflight' ? 'Ball flight' : 'Action'}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.lime }}>
                        {queued ? 'Queued' : `${p}%`}
                      </Text>
                    </View>
                    <View style={{ marginTop: 8, height: 4, borderRadius: 2, backgroundColor: colors.line, overflow: 'hidden' }}>
                      <View
                        style={{
                          width: `${queued ? 4 : p}%`,
                          height: 4,
                          backgroundColor: colors.lime,
                        }}
                      />
                    </View>
                    <Text style={{ marginTop: 6, fontSize: 12, color: colors.muted }}>
                      {job.message || 'Working…'}
                      {when ? ` · ${when}` : ''}
                    </Text>
                    {canCancelJob(job.status) ? (
                      <Pressable
                        onPress={() => void onCancel(job)}
                        disabled={cancellingId === job.id}
                        style={{ marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4 }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.ball }}>
                          {cancellingId === job.id
                            ? 'Removing…'
                            : queued
                              ? 'Remove from queue'
                              : 'Stop this analysis'}
                        </Text>
                      </Pressable>
                    ) : null}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

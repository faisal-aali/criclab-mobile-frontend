import * as Clipboard from 'expo-clipboard'
import * as WebBrowser from 'expo-web-browser'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  assetUrl,
  getDelivery,
  metricReady,
  type Delivery,
  type MetricValue,
  type Scores,
} from '../../src/api/client'
import { ClipPlayer } from '../../src/components/ClipPlayer'
import { MetricCard } from '../../src/components/MetricCard'
import { Screen } from '../../src/components/Screen'
import { EmptyState, ResultsShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

function ReliabilityBanner({ data }: { data: Delivery }) {
  const q = data.metrics?.quality
  const ball = data.metrics?.ball_speed_kmh
  const calibrated = Boolean(q?.calibrated || data.player_profile?.height_m || data.metrics?.player_profile?.height_m)
  const poseOk = Boolean(q?.tracking_ok && (q?.pose_frames ?? 0) >= 10)
  const ballOk = metricReady(ball)
  const view = q?.camera_view
  const viewNote = q?.camera_view_note

  let bg: string = colors.roseBg
  let fg: string = colors.rose
  let msg = 'Low pose quality — use a clearer, side-on, stable full-body video.'

  if (q?.speed_view_ok === false || view === 'front_on') {
    msg = viewNote || 'This camera angle cannot yield a truthful km/h. Film side-on.'
  } else if (poseOk && calibrated && ballOk) {
    bg = colors.emeraldBg
    fg = colors.emerald
    msg =
      'Scaled with this bowler’s height. Ball speed is from the in-air path — an image-plane estimate, not a radar gun.'
  } else if (poseOk && calibrated && !ballOk) {
    bg = colors.amberBg
    fg = colors.amber
    msg =
      'Height scale is in use. Ball speed needs a side-on clip where the ball is visible after it leaves the hand.'
  } else if (poseOk && !calibrated) {
    bg = colors.amberBg
    fg = colors.amber
    msg = `Pose OK (${q?.pose_frames ?? 0} frames). Physical km/h needs bowler height.`
  }

  return (
    <View style={{ backgroundColor: bg, borderRadius: 16, padding: 14 }}>
      <Text style={{ color: fg, lineHeight: 20 }}>
        <Text style={{ fontWeight: '800' }}>Measurement quality · </Text>
        {msg}
      </Text>
    </View>
  )
}

function HeadlineStat({ label, metric, big }: { label: string; metric?: MetricValue; big?: boolean }) {
  const hasValue = metricReady(metric)
  const decimals = big || metric?.unit === 'm' || metric?.unit === 'km/h' ? 1 : 0
  const value = hasValue
    ? `${typeof metric!.value === 'number' ? metric!.value.toFixed(decimals) : metric!.value}`
    : '—'
  return (
    <View>
      <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: 'rgba(255,255,255,0.45)' }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ marginTop: 4, fontWeight: '800', color: colors.white, fontSize: big ? 44 : 22 }}>
        {value}
        {hasValue && metric?.unit ? (
          <Text style={{ fontSize: 13, color: colors.seam }}> {metric.unit}</Text>
        ) : null}
      </Text>
    </View>
  )
}

function ScoreRing({ label, score }: { label: string; score?: number | null }) {
  const v = score ?? null
  return (
    <View style={{ width: 96, alignItems: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 6,
          borderColor: v == null ? 'rgba(255,255,255,0.12)' : colors.seam,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.pitchDeep,
        }}
      >
        <Text style={{ color: colors.white, fontWeight: '800', fontSize: 18 }}>{v == null ? '—' : Math.round(v)}</Text>
      </View>
      <Text
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.4,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  )
}

function Section({ title, body }: { title: string; body?: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontWeight: '800', color: colors.chalk }}>{title}</Text>
      <Text style={{ marginTop: 8, lineHeight: 20, color: colors.ink }}>{body?.trim() || '—'}</Text>
    </View>
  )
}

export default function ResultsScreen() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId: string }>()
  const router = useRouter()
  const [data, setData] = useState<Delivery | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processedSrc, setProcessedSrc] = useState('')
  const [originalSrc, setOriginalSrc] = useState('')
  const [pdfHref, setPdfHref] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deliveryId) return
    let alive = true
    setLoading(true)
    getDelivery(deliveryId)
      .then(async (d) => {
        if (!alive) return
        setData(d)
        const artifacts = d.artifacts || {}
        const cloud = artifacts.cloudinary_video_url || ''
        const overlay = artifacts.overlay_video_url ? await assetUrl(artifacts.overlay_video_url) : ''
        const original = artifacts.original_video_url ? await assetUrl(artifacts.original_video_url) : ''
        const pdf = artifacts.pdf_url
          ? `${await assetUrl(artifacts.pdf_url)}?download=1`
          : artifacts.cloudinary_pdf_url || ''
        setProcessedSrc(cloud || overlay)
        setOriginalSrc(original)
        setPdfHref(pdf)
      })
      .catch((err) => {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [deliveryId])

  if (loading) {
    return (
      <Screen>
        <ResultsShimmer />
      </Screen>
    )
  }
  if (error && !data) {
    return (
      <Screen>
        <EmptyState title="No videos" subtitle={error} />
      </Screen>
    )
  }
  if (!data) {
    return (
      <Screen>
        <EmptyState title="No history" subtitle="This delivery could not be found." />
      </Screen>
    )
  }

  const m = data.metrics || {}
  const a = data.analysis || {}
  const scores: Scores = m.scores || {}
  const created = data.created_at ? new Date(data.created_at).toLocaleString() : ''
  const side = m.throwing_side ? `${m.throwing_side[0].toUpperCase()}${m.throwing_side.slice(1)}-arm` : null
  const profile = data.player_profile || m.player_profile
  const seq = m.kinematic_sequence || []
  const cmp = a.comparison
  const cloudVideo = data.artifacts?.cloudinary_video_url

  return (
    <Screen>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>ANALYSIS RESULTS</Text>
      <Text style={{ marginTop: 6, fontSize: 30, fontWeight: '800', color: colors.chalk }}>
        {data.player_name || 'Bowler'}
      </Text>
      <Text style={{ marginTop: 6, color: colors.muted }}>
        {[side, profile?.bowling_style, profile?.height_m ? `${profile.height_m.toFixed(2)} m` : null, created]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {cmp?.previous_count && cmp.delta_kmh != null ? (
        <Text style={{ marginTop: 8, color: colors.ink }}>
          {cmp.delta_kmh >= 0 ? '+' : ''}
          {cmp.delta_kmh.toFixed(1)} km/h vs last {cmp.previous_count}{' '}
          {cmp.previous_count === 1 ? 'delivery' : 'deliveries'}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Pressable
          onPress={() => router.push('/')}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '800', color: colors.chalk }}>New upload</Text>
        </Pressable>
        {pdfHref ? (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(pdfHref)}
            style={{
              flex: 1,
              backgroundColor: colors.seam,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.white }}>Open PDF</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ marginTop: 16 }}>
        <ReliabilityBanner data={data} />
      </View>

      {originalSrc ? (
        <View style={{ marginTop: 16 }}>
          <ClipPlayer uri={originalSrc} label="Before · original upload" />
        </View>
      ) : null}
      {processedSrc ? (
        <View style={{ marginTop: 16 }}>
          <ClipPlayer uri={processedSrc} label="After · slow-motion + overlays" />
        </View>
      ) : null}

      {cloudVideo ? (
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(cloudVideo)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          style={{
            marginTop: 10,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.muted }}>SHARE PROCESSED VIDEO</Text>
          <Text numberOfLines={2} style={{ marginTop: 4, fontSize: 12, color: colors.lime }}>
            {copied ? 'Copied' : cloudVideo}
          </Text>
        </Pressable>
      ) : null}

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.charcoal,
          borderRadius: 24,
          padding: 18,
        }}
      >
        <HeadlineStat label="Ball speed" metric={m.ball_speed_kmh} big />
        {!metricReady(m.ball_speed_kmh) && metricReady(m.arm_speed_kmh) ? (
          <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            Ball speed is unavailable. Arm speed is the bowling wrist, not the ball.
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ width: '45%' }}>
            <HeadlineStat label="Arm speed" metric={m.arm_speed_kmh} />
          </View>
          <View style={{ width: '45%' }}>
            <HeadlineStat label="Release time" metric={m.release_time_ms} />
          </View>
          <View style={{ width: '45%' }}>
            <HeadlineStat label="Release height" metric={m.release_height_m} />
          </View>
          <View style={{ width: '45%' }}>
            <HeadlineStat label="Stride length" metric={m.stride_length_pct_height} />
          </View>
        </View>
        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: 'rgba(255,255,255,0.4)' }}>
            HEURISTIC SCORE · NOT CLINICAL
          </Text>
          <Text style={{ marginTop: 6, fontSize: 52, fontWeight: '800', color: colors.seam }}>
            {scores.overall != null ? Math.round(scores.overall) : '—'}
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}> / 100</Text>
          </Text>
        </View>
      </View>

      {seq.length ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: '800', color: colors.chalk }}>Kinematic sequence</Text>
          <View style={{ marginTop: 12, gap: 8 }}>
            {seq.map((item) => {
              const seen = item.frame != null
              return (
                <View key={`${item.n}-${item.key}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: seen ? colors.lime : colors.charcoal,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: seen ? colors.onLime : colors.muted, fontWeight: '800' }}>{item.n}</Text>
                  </View>
                  <View>
                    <Text style={{ fontWeight: '700', color: colors.chalk }}>{item.label}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>
                      {seen ? (item.estimated ? 'Estimated' : 'Measured') : 'Not seen'}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: 16, backgroundColor: colors.pitchDeep, borderRadius: 24, padding: 16 }}>
        <Text style={{ fontWeight: '800', color: colors.white }}>Action scores</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 }}>
          <ScoreRing label="Overall" score={scores.overall} />
          <ScoreRing label="Ball speed" score={scores.ball_speed} />
          <ScoreRing label="Arm speed" score={scores.arm_speed} />
          <ScoreRing label="Sequencing" score={scores.sequencing} />
          <ScoreRing label="Front-leg brace" score={scores.front_leg_brace} />
          <ScoreRing label="Hip/Shoulder" score={scores.hip_shoulder_separation} />
        </View>
      </View>

      <Text style={{ marginTop: 22, marginBottom: 10, fontSize: 18, fontWeight: '800', color: colors.chalk }}>
        Measured metrics
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <MetricCard label="Ball speed" metric={m.ball_speed_kmh} />
        <MetricCard label="Arm speed" metric={m.arm_speed_kmh} />
        <MetricCard label="Release height" metric={m.release_height_m} />
        <MetricCard label="Release time" metric={m.release_time_ms} />
        <MetricCard label="Release angle" metric={m.release_angle_deg} />
        <MetricCard label="Elbow extension" metric={m.elbow_extension_deg} />
        <MetricCard label="Front-knee flexion" metric={m.front_knee_flexion_deg} />
        <MetricCard label="Hip/shoulder sep." metric={m.hip_shoulder_separation_deg} />
        <MetricCard label="Arm-swing speed" metric={m.arm_swing_speed_deg_s} />
        <MetricCard label="Stride length" metric={m.stride_length_pct_height} />
        <MetricCard label="Hip-line proxy" metric={m.hip_rotation_speed_deg_s} />
        <MetricCard label="Trunk-line proxy" metric={m.trunk_rotation_speed_deg_s} />
      </View>

      <Text style={{ marginTop: 22, marginBottom: 10, fontSize: 18, fontWeight: '800', color: colors.chalk }}>
        AI coaching
      </Text>
      <Section title="Summary" body={a.summary} />
      <Section title="Observations" body={a.observations} />
      <Section title="Strengths" body={a.strengths} />
      <Section title="Areas to improve" body={a.improvements} />
      {a.confidence_note ? (
        <Text style={{ marginTop: 4, fontSize: 12, color: colors.muted }}>{a.confidence_note}</Text>
      ) : null}
    </Screen>
  )
}

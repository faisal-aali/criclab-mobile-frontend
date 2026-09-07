import { Text, View } from 'react-native'
import type { Metrics } from '../api/client'
import { colors, layout } from '../theme'

const LEGALITY_LABEL: Record<string, string> = {
  within_limit: 'Within the 15° limit',
  borderline: 'Borderline — re-film square-on',
  above_limit_screening: 'Above 15° on this view (screening only)',
  flexing: 'Elbow flexes into release — no extension',
}

function formatFps(n?: number | null) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(0)
}

function Card({
  label,
  value,
  note,
  extra,
  tone,
}: {
  label: string
  value: string
  note: string
  extra?: string | null
  tone?: 'ok' | 'warn' | 'muted'
}) {
  const valueColor = tone === 'muted' ? colors.muted : tone === 'warn' ? colors.amber : colors.chalk
  return (
    <View
      style={{
        width: '48%',
        flexGrow: 1,
        minWidth: 148,
        backgroundColor: colors.card,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: tone === 'warn' ? 'rgba(245,193,108,0.35)' : colors.line,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: colors.muted }}>{label.toUpperCase()}</Text>
      <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '800', color: valueColor, lineHeight: 24 }}>{value}</Text>
      <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 17, color: colors.muted }}>{note}</Text>
      {extra ? <Text style={{ marginTop: 6, fontSize: 11, lineHeight: 16, color: colors.muted }}>{extra}</Text> : null}
    </View>
  )
}

export function DeliveryHonesty({ metrics }: { metrics: Metrics }) {
  const pace = metrics.delivery_type
  const legality = metrics.action_legality
  const cons = metrics.speed_consistency
  const tb = metrics.timebase
  const q = metrics.quality
  const paceOk = pace?.status === 'ok' && Boolean(pace?.value)
  const legalOk = legality?.status === 'ok' && Boolean(legality?.verdict)
  const fps = tb?.fps ?? q?.capture_fps
  const slowMo = Boolean(tb?.slow_motion || q?.slow_motion)

  const legalTone: 'ok' | 'warn' | 'muted' =
    !legalOk ? 'muted' : legality?.verdict === 'within_limit' ? 'ok' : legality?.verdict === 'flexing' ? 'muted' : 'warn'

  const consTone: 'ok' | 'warn' | 'muted' = cons?.ok === false ? 'warn' : cons?.ok === true ? 'ok' : 'muted'
  const consValue = cons?.ok === false ? 'Check the clip' : cons?.ok === true ? 'Consistent' : '—'
  const consNote =
    cons?.note ||
    (cons?.ok == null ? 'Needs both a tracked ball and a measured arm speed.' : '')

  return (
    <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      <Card
        label="Capture & view"
        value={`${formatFps(fps)} fps`}
        note={
          slowMo
            ? 'Measured from the ball’s fall — the file understated the capture rate.'
            : 'Frame rate taken from the video file.'
        }
        extra={
          [
            q?.camera_view ? q.camera_view.replace(/_/g, '-') : null,
            q?.speed_view_from_ball ? 'speeds from tracked ball' : null,
            slowMo && tb?.note ? tb.note : q?.camera_view_note,
          ]
            .filter(Boolean)
            .join(' · ') || null
        }
      />
      <Card
        label="Pace band"
        value={paceOk ? String(pace!.value) : '—'}
        tone={paceOk ? 'ok' : 'muted'}
        note={
          paceOk
            ? `From ${String(pace?.basis || 'speed').replace(/_/g, ' ')}${
                pace?.speed_kmh != null ? ` · ${Math.round(pace.speed_kmh)} km/h` : ''
              }`
            : pace?.note || 'No measured ball or arm speed — a stated bowling style is not a band.'
        }
        extra={paceOk && pace?.band_edge_caveat ? pace.note : null}
      />
      <Card
        label="Throwing screen · ICC 15°"
        value={legalOk ? LEGALITY_LABEL[legality!.verdict!] || legality!.verdict! : 'Not assessable from this camera'}
        tone={legalTone}
        note={
          legalOk && legality?.extension_deg != null
            ? `Elbow extension ${legality.extension_deg.toFixed(0)}° (limit ${legality.limit_deg ?? 15}°)`
            : legality?.note || 'This is a screen from this camera, not an official test.'
        }
        extra={
          legality?.elbow_at_release_deg != null
            ? `Elbow at release ${legality.elbow_at_release_deg.toFixed(0)}°`
            : legality?.note && legalOk
              ? legality.note
              : null
        }
      />
      <Card label="Speed consistency" value={consValue} tone={consTone} note={consNote} />
    </View>
  )
}

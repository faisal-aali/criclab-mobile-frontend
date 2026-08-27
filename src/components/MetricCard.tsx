import { Text, View } from 'react-native'
import { metricReady, type MetricValue } from '../api/client'
import { colors } from '../theme'

function confColor(conf: number, status?: string) {
  if (status === 'unavailable' || conf <= 0) {
    return { dot: colors.muted, text: colors.muted, label: 'N/A' }
  }
  if (conf >= 0.6) return { dot: colors.emerald, text: colors.emerald, label: 'High' }
  if (conf >= 0.35) return { dot: '#D97706', text: '#B45309', label: 'Med' }
  return { dot: colors.ball, text: colors.rose, label: 'Low' }
}

export function MetricCard({ label, metric }: { label: string; metric?: MetricValue }) {
  const hasValue = metricReady(metric)
  const conf = metric?.confidence ?? 0
  const status = metric?.status
  const c = confColor(conf, hasValue ? status : 'unavailable')
  const value = hasValue
    ? `${typeof metric!.value === 'number' ? metric!.value.toFixed(1) : metric!.value}`
    : '—'
  const unit = hasValue ? metric?.unit : ''

  return (
    <View
      style={{
        flex: 1,
        minWidth: '46%',
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text
          style={{
            flex: 1,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.muted,
          }}
        >
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {metric?.estimated && hasValue ? (
            <Text
              style={{
                fontSize: 9,
                fontWeight: '800',
                color: colors.amber,
                backgroundColor: colors.amberBg,
                paddingHorizontal: 4,
                paddingVertical: 2,
                overflow: 'hidden',
                borderRadius: 4,
              }}
            >
              EST.
            </Text>
          ) : null}
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.dot }} />
          <Text style={{ fontSize: 10, fontWeight: '800', color: c.text }}>{c.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: hasValue ? colors.chalk : colors.line }}>
          {value}
        </Text>
        {unit ? <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted }}>{unit}</Text> : null}
      </View>
      {hasValue ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.mist, overflow: 'hidden' }}>
            <View
              style={{
                width: `${Math.round(conf * 100)}%`,
                height: 4,
                backgroundColor: colors.seam,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.muted }}>{Math.round(conf * 100)}%</Text>
        </View>
      ) : null}
      {metric?.note ? (
        <Text style={{ marginTop: 8, fontSize: 11, lineHeight: 15, color: hasValue ? colors.muted : colors.amber }}>
          {metric.note}
        </Text>
      ) : null}
    </View>
  )
}

import { Text, View } from 'react-native'
import type { Metric } from './types'

function ready(metric?: Metric) {
  return metric?.value != null && (metric.status == null || metric.status === 'ok')
}

function Chip({
  label,
  value,
  pending,
}: {
  label: string
  value: string
  pending?: boolean
}) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(15,15,15,0.62)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        minWidth: 92,
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>
        {label}
      </Text>
      <Text style={{ marginTop: 2, color: pending ? 'rgba(255,255,255,0.4)' : '#fff', fontWeight: '800', fontSize: 16 }}>
        {value}
      </Text>
    </View>
  )
}

export function BallTrackHud({
  speed,
  length,
  line,
}: {
  speed?: Metric
  length?: Metric
  line?: Metric
}) {
  return (
    <View style={{ gap: 6 }}>
      <Chip label="SPEED" value={ready(speed) ? `${Number(speed!.value).toFixed(0)} km/h` : '—'} pending={!ready(speed)} />
      <Chip label="LENGTH" value={ready(length) ? `${Number(length!.value).toFixed(1)} m` : '—'} pending={!ready(length)} />
      <Chip
        label="LINE"
        value={ready(line) ? `${Number(line!.value) >= 0 ? '+' : ''}${Number(line!.value).toFixed(2)} m` : '—'}
        pending={!ready(line)}
      />
      <Chip label="SPIN" value="—" pending />
      <Chip label="SWING" value="—" pending />
    </View>
  )
}

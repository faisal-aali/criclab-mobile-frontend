import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { listDeliveries, metricReady, type Delivery } from '../../src/api/client'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import { EmptyState, ListShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

export default function HistoryScreen() {
  const router = useRouter()
  const [items, setItems] = useState<Delivery[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      listDeliveries()
        .then((res) => {
          if (!alive) return
          setItems(res.items)
          setError(null)
        })
        .catch((err) => {
          if (!alive) return
          setError(err instanceof Error ? err.message : 'Failed to load history')
        })
        .finally(() => {
          if (alive) setLoading(false)
        })
      return () => {
        alive = false
      }
    }, []),
  )

  return (
    <Screen>
      <Logo />
      <Text style={{ marginTop: 18, fontSize: 32, fontWeight: '800', color: colors.pitch }}>History</Text>
      <Text style={{ marginTop: 6, color: colors.muted }}>
        Previous deliveries. Re-upload a clip to re-run analysis — old rows stay as they were.
      </Text>
      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}

      {loading ? <ListShimmer /> : null}
      {!loading && items.length === 0 && !error ? (
        <EmptyState title="No history" subtitle="No videos yet. Analyze a delivery to see it here." />
      ) : null}

      <View style={{ marginTop: 16, gap: 10 }}>
        {items.map((d) => {
          const ball = d.metrics?.ball_speed_kmh
          const arm = d.metrics?.arm_speed_kmh
          const ballOk = metricReady(ball)
          const style = d.metrics?.player_profile?.bowling_style
          const armSide = d.metrics?.player_profile?.bowling_arm || d.metrics?.throwing_side
          return (
            <Pressable
              key={d.id}
              onPress={() => router.push(`/results/${d.id}`)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 16, color: colors.pitch }}>
                  {d.player_name || 'Bowler'}
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.muted }}>
                  {d.created_at ? new Date(d.created_at).toLocaleString() : d.id}
                  {armSide ? ` · ${armSide}-arm` : ''}
                  {style ? ` · ${style}` : ''}
                </Text>
                {d.analysis_summary ? (
                  <Text numberOfLines={2} style={{ marginTop: 8, fontSize: 13, color: colors.ink, lineHeight: 18 }}>
                    {d.analysis_summary}
                  </Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.pitch }}>
                  {ballOk ? Number(ball!.value).toFixed(1) : '—'}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: colors.muted }}>
                  {ballOk ? 'BALL KM/H' : 'BALL N/A'}
                </Text>
                {!ballOk && metricReady(arm) ? (
                  <Text style={{ marginTop: 4, fontSize: 11, color: colors.muted }}>
                    Arm {Number(arm!.value).toFixed(0)} km/h
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )
        })}
      </View>
    </Screen>
  )
}

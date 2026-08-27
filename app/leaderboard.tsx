import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { listLeaderboard, type LeaderboardRow } from '../src/api/client'
import { Screen } from '../src/components/Screen'
import { EmptyState, ListShimmer } from '../src/shimmer'
import { colors } from '../src/theme'

export default function LeaderboardScreen() {
  const router = useRouter()
  const [items, setItems] = useState<LeaderboardRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listLeaderboard()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Screen>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>ACTION</Text>
      <Text style={{ marginTop: 8, fontSize: 30, fontWeight: '800', color: colors.chalk }}>Leaderboard</Text>
      <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 22 }}>
        Top throws by measured ball speed. Other players’ reports stay private — Open only appears on your own row.
      </Text>
      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer /> : null}
      {!loading && items.length === 0 && !error ? (
        <EmptyState title="No ranked throws" subtitle="Measured Action ball speed is required to appear here." />
      ) : null}

      <View style={{ marginTop: 16, gap: 10 }}>
        {items.map((row) => (
          <View
            key={`${row.rank}-${row.player_name}-${row.created_at}`}
            style={{
              backgroundColor: row.mine ? 'rgba(182,242,74,0.08)' : colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: row.mine ? colors.lime : colors.line,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ width: 28, fontWeight: '800', fontSize: 18, color: colors.lime }}>{row.rank}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.chalk }}>
                {row.player_name}
                {row.mine ? ' · you' : ''}
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: colors.muted }}>
                {[row.bowling_arm ? `${row.bowling_arm}-arm` : null, row.delivery_type]
                  .filter(Boolean)
                  .join(' · ') || 'Action throw'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.chalk }}>
                {row.ball_speed_kmh != null ? row.ball_speed_kmh.toFixed(1) : '—'}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.muted }}>KM/H</Text>
            </View>
            {row.mine && row.result_id ? (
              <Pressable
                onPress={() => router.push(`/results/${row.result_id}`)}
                style={{
                  backgroundColor: colors.lime,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: colors.onLime, fontWeight: '800', fontSize: 12 }}>Open</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </Screen>
  )
}

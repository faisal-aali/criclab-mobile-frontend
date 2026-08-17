import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { listBalltrackSessions } from '../../src/balltrack/api'
import type { BallTrackSession } from '../../src/balltrack/types'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import { EmptyState, ListShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

export default function BallTrackHub() {
  const router = useRouter()
  const [items, setItems] = useState<BallTrackSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      listBalltrackSessions()
        .then((res) => {
          if (!alive) return
          setItems(res.items)
          setError(null)
        })
        .catch((err) => {
          if (!alive) return
          setError(err instanceof Error ? err.message : 'Could not load sessions')
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
      <Text style={{ marginTop: 18, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>
        BALL TRACK
      </Text>
      <Text style={{ marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.pitch, lineHeight: 38 }}>
        Track every ball
      </Text>
      <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 22, color: colors.muted }}>
        Down-the-pitch camera. Align both stump sets, film a session, then review speed, line, length, and a pitch map.
        If there is no ball in flight, you will get “no ball found” — never a fake speed.
      </Text>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '800', color: colors.pitch }}>Setup (same as Fulltrack)</Text>
        <Text style={{ marginTop: 6, color: colors.muted, lineHeight: 20 }}>
          20.12 m pitch · two sets of three stumps · tripod ~1.5 m high · 4 m behind the bowler · drag the red boxes onto both wickets so the blue path sits on the turf.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/balltrack/record')}
        style={{
          marginTop: 18,
          backgroundColor: colors.pitch,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Start session</Text>
      </Pressable>

      <Text style={{ marginTop: 28, fontSize: 20, fontWeight: '800', color: colors.pitch }}>History</Text>
      {error ? <Text style={{ marginTop: 10, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer rows={3} /> : null}
      {!loading && items.length === 0 && !error ? (
        <EmptyState title="No history" subtitle="No videos yet. Start a session to track balls." />
      ) : null}

      <View style={{ marginTop: 12, gap: 10 }}>
        {items.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/balltrack/session/${s.id}`)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 16,
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.pitch }}>{s.title || 'Session'}</Text>
            <Text style={{ marginTop: 4, color: colors.muted, fontSize: 13 }}>
              {s.delivery_count ?? 0} balls · {s.status || 'unknown'}
              {s.created_at ? ` · ${new Date(s.created_at).toLocaleString()}` : ''}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

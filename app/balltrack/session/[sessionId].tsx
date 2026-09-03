import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { metricReady } from '../../../src/api/client'
import { balltrackAssetUrl, getBalltrackSession } from '../../../src/balltrack/api'
import type { BallTrackSession } from '../../../src/balltrack/types'
import { ClipPlayer } from '../../../src/components/ClipPlayer'
import { DrillShelf } from '../../../src/components/DrillShelf'
import { Screen } from '../../../src/components/Screen'
import { EmptyState, SessionShimmer } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

export default function BallTrackSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const [data, setData] = useState<BallTrackSession | null>(null)
  const [mapUrl, setMapUrl] = useState('')
  const [overlayUrl, setOverlayUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    let alive = true
    setLoading(true)
    getBalltrackSession(sessionId)
      .then(async (s) => {
        if (!alive) return
        setData(s)
        const map = s.artifacts?.cloudinary_pitch_map_url || s.artifacts?.pitch_map_url
        const overlay = s.artifacts?.cloudinary_overlay_url || s.artifacts?.overlay_url
        setMapUrl(await balltrackAssetUrl(map))
        setOverlayUrl(await balltrackAssetUrl(overlay))
      })
      .catch((err) => {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Failed to load session')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [sessionId])

  const deliveries = data?.deliveries || []

  return (
    <Screen safeTop={false} safeBottom>
      {loading ? <SessionShimmer /> : null}
      {!loading ? (
        <>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>SESSION</Text>
          <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.chalk }}>
            {data?.title || 'Ball flight'}
          </Text>
          <Text style={{ marginTop: 6, color: colors.muted }}>
            {data?.delivery_count ?? 0} deliveries
            {data?.created_at ? ` · ${new Date(data.created_at).toLocaleString()}` : ''}
          </Text>
          {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
          {data?.error ? <Text style={{ marginTop: 12, color: colors.ball }}>{data.error}</Text> : null}

          {mapUrl ? (
            <View style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.line }}>
              <Image source={{ uri: mapUrl }} style={{ width: '100%', aspectRatio: 420 / 760, backgroundColor: colors.night }} resizeMode="contain" />
            </View>
          ) : null}

          {overlayUrl ? (
            <View style={{ marginTop: 16 }}>
              <ClipPlayer uri={overlayUrl} label="Session overlay" aspectRatio={9 / 16} />
            </View>
          ) : null}

          <Text style={{ marginTop: 22, fontSize: 20, fontWeight: '800', color: colors.chalk }}>Balls</Text>
          {deliveries.length === 0 && !error ? (
            <EmptyState title="No videos" subtitle="This session has no tracked deliveries." />
          ) : (
            <View style={{ marginTop: 10, gap: 10 }}>
              {deliveries.map((d) => {
                const speed = d.metrics?.speed_kmh
                const length = d.metrics?.length_m
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => router.push(`/balltrack/delivery/${d.id}`)}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.line,
                      padding: 14,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: colors.chalk }}>Ball {d.index}</Text>
                    <Text style={{ color: colors.muted, fontWeight: '600' }}>
                      {metricReady(speed) ? `${Number(speed!.value).toFixed(0)} km/h` : '—'}
                      {metricReady(length) ? ` · ${Number(length!.value).toFixed(1)} m` : ''}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}

          <DrillShelf
            heading="Drills for this session"
            lead="Matched to this Ball flight report from the CricLab catalog. Play them here."
            drills={data?.analysis?.recommendations}
            playingId={playingId}
            onPlay={setPlayingId}
            eager
          />
        </>
      ) : null}
    </Screen>
  )
}

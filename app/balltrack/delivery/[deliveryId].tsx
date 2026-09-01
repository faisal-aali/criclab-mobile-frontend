import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { balltrackAssetUrl, getBalltrackDelivery } from '../../../src/balltrack/api'
import { BallTrackHud } from '../../../src/balltrack/Hud'
import type { BallTrackDelivery } from '../../../src/balltrack/types'
import { ClipPlayer } from '../../../src/components/ClipPlayer'
import { MetricCard } from '../../../src/components/MetricCard'
import { Screen } from '../../../src/components/Screen'
import { DeliveryShimmer, EmptyState } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

export default function BallTrackDeliveryScreen() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId: string }>()
  const [data, setData] = useState<BallTrackDelivery | null>(null)
  const [clip, setClip] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!deliveryId) return
    let alive = true
    setLoading(true)
    getBalltrackDelivery(deliveryId)
      .then(async (d) => {
        if (!alive) return
        setData(d)
        const url = d.artifacts?.cloudinary_clip_url || d.artifacts?.clip_url
        setClip(await balltrackAssetUrl(url))
      })
      .catch((err) => {
        if (!alive) return
        setError(err instanceof Error ? err.message : 'Failed to load ball')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [deliveryId])

  return (
    <Screen safeTop={false} safeBottom>
      {loading ? <DeliveryShimmer /> : null}
      {!loading && error && !data ? (
        <EmptyState title="No videos" subtitle={error} />
      ) : null}
      {!loading && data ? (
        <>
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>DELIVERY</Text>
          <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.chalk }}>
            Ball {data.index}
          </Text>
          {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
          {clip ? (
            <View style={{ marginTop: 16 }}>
              <ClipPlayer
                uri={clip}
                label="Tracked clip"
                aspectRatio={9 / 16}
                overlay={
                  <BallTrackHud
                    speed={data.metrics?.speed_kmh}
                    length={data.metrics?.length_m}
                    line={data.metrics?.line_m}
                  />
                }
              />
            </View>
          ) : (
            <EmptyState title="No videos" subtitle="This delivery has no clip yet." />
          )}
          <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <MetricCard label="Ball speed" metric={data.metrics?.speed_kmh} />
            <MetricCard label="Length" metric={data.metrics?.length_m} />
            <MetricCard label="Line" metric={data.metrics?.line_m} />
          </View>
          <Text style={{ marginTop: 16, color: colors.muted, lineHeight: 20 }}>
            Speed, line, and length are measured. Spin and swing stay “—” until we can read the seam and the in-air path.
          </Text>
        </>
      ) : null}
    </Screen>
  )
}

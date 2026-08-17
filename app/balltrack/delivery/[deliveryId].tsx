import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { balltrackAssetUrl, getBalltrackDelivery } from '../../../src/balltrack/api'
import type { BallTrackDelivery } from '../../../src/balltrack/types'
import { ClipPlayer } from '../../../src/components/ClipPlayer'
import { MetricCard } from '../../../src/components/MetricCard'
import { Screen } from '../../../src/components/Screen'
import { colors } from '../../../src/theme'

export default function BallTrackDeliveryScreen() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId: string }>()
  const [data, setData] = useState<BallTrackDelivery | null>(null)
  const [clip, setClip] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!deliveryId) return
    getBalltrackDelivery(deliveryId)
      .then(async (d) => {
        setData(d)
        const url = d.artifacts?.cloudinary_clip_url || d.artifacts?.clip_url
        setClip(await balltrackAssetUrl(url))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load ball'))
  }, [deliveryId])

  return (
    <Screen>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>DELIVERY</Text>
      <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.pitch }}>
        Ball {data?.index ?? ''}
      </Text>
      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {clip ? (
        <View style={{ marginTop: 16 }}>
          <ClipPlayer uri={clip} label="Tracked clip" />
        </View>
      ) : null}
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <MetricCard label="Ball speed" metric={data?.metrics?.speed_kmh} />
        <MetricCard label="Length" metric={data?.metrics?.length_m} />
        <MetricCard label="Line" metric={data?.metrics?.line_m} />
      </View>
      <Text style={{ marginTop: 16, color: colors.muted, lineHeight: 20 }}>
        Speed, line, and length only. Spin and swing are not measured in this version.
      </Text>
    </Screen>
  )
}

import { View } from 'react-native'
import { colors } from '../theme'
import { ListShimmer } from './ListShimmer'
import { MediaShimmer } from './MediaShimmer'
import { Shimmer } from './Shimmer'

export function ProcessingShimmer({ rows = 6 }: { rows?: number }) {
  return (
    <View style={{ marginTop: 22, gap: 12 }}>
      <Shimmer height={10} borderRadius={999} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Shimmer width={26} height={26} borderRadius={13} />
          <Shimmer width="70%" height={14} />
        </View>
      ))}
    </View>
  )
}

export function SessionShimmer() {
  return (
    <View>
      <Shimmer width="28%" height={10} />
      <Shimmer width="62%" height={28} style={{ marginTop: 10 }} borderRadius={8} />
      <Shimmer width="48%" height={12} style={{ marginTop: 10 }} />
      <MediaShimmer aspectRatio={420 / 760} />
      <MediaShimmer />
      <Shimmer width="24%" height={18} style={{ marginTop: 22 }} borderRadius={6} />
      <ListShimmer rows={3} />
    </View>
  )
}

export function DeliveryShimmer() {
  return (
    <View>
      <Shimmer width="28%" height={10} />
      <Shimmer width="40%" height={28} style={{ marginTop: 10 }} borderRadius={8} />
      <MediaShimmer />
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              minWidth: '46%',
              backgroundColor: colors.white,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 14,
              gap: 10,
            }}
          >
            <Shimmer width="50%" height={10} />
            <Shimmer width="40%" height={26} borderRadius={8} />
          </View>
        ))}
      </View>
    </View>
  )
}

export function ResultsShimmer() {
  return (
    <View>
      <Shimmer width="36%" height={10} />
      <Shimmer width="55%" height={30} style={{ marginTop: 8 }} borderRadius={8} />
      <Shimmer width="70%" height={12} style={{ marginTop: 10 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Shimmer height={44} borderRadius={12} style={{ flex: 1 }} />
        <Shimmer height={44} borderRadius={12} style={{ flex: 1 }} />
      </View>
      <Shimmer height={72} borderRadius={16} style={{ marginTop: 16 }} />
      <MediaShimmer />
      <Shimmer height={220} borderRadius={24} style={{ marginTop: 16 }} />
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} height={96} borderRadius={16} style={{ minWidth: '46%', flex: 1 }} />
        ))}
      </View>
    </View>
  )
}

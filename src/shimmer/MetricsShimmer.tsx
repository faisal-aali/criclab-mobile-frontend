import { View } from 'react-native'
import { colors } from '../theme'
import { Shimmer } from './Shimmer'

export function MetricsShimmer({ count = 3 }: { count?: number }) {
  return (
    <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            minWidth: '46%',
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 14,
            gap: 10,
          }}
        >
          <Shimmer width="48%" height={10} />
          <Shimmer width="36%" height={26} borderRadius={8} />
          <Shimmer width="100%" height={6} borderRadius={3} />
        </View>
      ))}
    </View>
  )
}

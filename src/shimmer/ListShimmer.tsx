import { View } from 'react-native'
import { colors } from '../theme'
import { Shimmer } from './Shimmer'

export function ListShimmer({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
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
          <View style={{ flex: 1, gap: 8 }}>
            <Shimmer width="52%" height={16} borderRadius={6} />
            <Shimmer width="78%" height={11} borderRadius={5} />
            <Shimmer width="64%" height={11} borderRadius={5} />
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8, paddingTop: 2 }}>
            <Shimmer width={56} height={24} borderRadius={6} />
            <Shimmer width={44} height={8} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  )
}

import { View } from 'react-native'
import { colors } from '../theme'
import { Shimmer } from './Shimmer'

export function MediaShimmer({ aspectRatio = 16 / 9 }: { aspectRatio?: number }) {
  return (
    <View
      style={{
        marginTop: 16,
        overflow: 'hidden',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
        <Shimmer width="40%" height={10} />
      </View>
      <View style={{ width: '100%', aspectRatio }}>
        <Shimmer height={8} style={{ flex: 1, width: '100%', height: '100%', borderRadius: 0 }} />
      </View>
    </View>
  )
}

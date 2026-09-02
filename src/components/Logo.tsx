import { Image, Text, View } from 'react-native'
import { colors } from '../theme'

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    />
  )
}

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <LogoMark size={size} />
      <Text
        numberOfLines={1}
        style={{
          flexShrink: 1,
          fontSize: size >= 34 ? 22 : 18,
          fontWeight: '800',
          letterSpacing: -0.4,
          color: colors.chalk,
        }}
      >
        CricLab
      </Text>
    </View>
  )
}

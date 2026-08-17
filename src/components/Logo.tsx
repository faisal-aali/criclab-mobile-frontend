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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>
        <Text style={{ color: colors.pitch }}>Cric</Text>
        <Text style={{ color: colors.seam }}>-Lab </Text>
        <Text style={{ color: colors.pitch }}>AI</Text>
      </Text>
    </View>
  )
}

import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { Text, View } from 'react-native'
import { colors } from '../theme'

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="cl-ball" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#E4572E" />
          <Stop offset="1" stopColor="#A61B1B" />
        </LinearGradient>
        <LinearGradient id="cl-ring" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#0B3D2E" />
          <Stop offset="1" stopColor="#06261C" />
        </LinearGradient>
      </Defs>
      <Rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#cl-ring)" />
      <Circle cx="24" cy="24" r="12.5" fill="url(#cl-ball)" />
      <Path
        d="M15.5 18.5c5.4 2.2 11.6 2.2 17 0"
        stroke="#FBEFE7"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <Path d="M14.5 24c6 2.4 13 2.4 19 0" stroke="#FBEFE7" strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M15.5 29.5c5.4 2.2 11.6 2.2 17 0"
        stroke="#FBEFE7"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <Path d="M32 12l4-4M36 16l4-4" stroke="#7BE3A6" strokeWidth="2" strokeLinecap="round" />
    </Svg>
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

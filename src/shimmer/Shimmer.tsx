import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { colors } from '../theme'

type Props = {
  height?: number
  width?: number | `${number}%`
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export function Shimmer({ height = 12, width = '100%', borderRadius = 8, style }: Props) {
  const shift = useSharedValue(-1)
  const [boxW, setBoxW] = useState(160)

  useEffect(() => {
    shift.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, false)
  }, [shift])

  const shine = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value * boxW }],
  }))

  return (
    <View
      onLayout={(e) => setBoxW(e.nativeEvent.layout.width)}
      style={[
        {
          height,
          width,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'rgba(11,61,46,0.08)',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shine]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: boxW * 0.55, height: '100%' }}
        />
      </Animated.View>
    </View>
  )
}

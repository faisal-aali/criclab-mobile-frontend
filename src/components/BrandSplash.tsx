import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated'
import { colors } from '../theme'

export function BrandSplash({ onFinish }: { onFinish: () => void }) {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.92)

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 380 }),
      withDelay(1500, withTiming(0, { duration: 420 }, (finished) => {
        if (finished) runOnJS(onFinish)()
      })),
    )
    scale.value = withTiming(1, { duration: 480 })
  }, [onFinish, opacity, scale])

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <LinearGradient colors={[colors.pitchDeep, colors.pitch, '#0E4A38']} style={styles.fill}>
        <Animated.View style={[styles.center, anim]}>
          <Image source={require('../../assets/icon.png')} style={styles.icon} />
          <Text style={styles.wordmark}>
            <Text style={{ color: '#F4F7F5' }}>Cric</Text>
            <Text style={{ color: '#E8A06A' }}>-Lab </Text>
            <Text style={{ color: '#F4F7F5' }}>AI</Text>
          </Text>
          <Text style={styles.kicker}>AI BOWLING LABORATORY</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center' },
  icon: { width: 128, height: 128, borderRadius: 32 },
  wordmark: { marginTop: 18, fontSize: 32, fontWeight: '800', letterSpacing: -0.4 },
  kicker: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: 'rgba(244,247,245,0.62)',
  },
})

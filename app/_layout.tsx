import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BrandSplash } from '../src/components/BrandSplash'
import { colors } from '../src/theme'

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)
  const hideSplash = useCallback(() => setShowSplash(false), [])

  useEffect(() => {
    SplashScreen.setOptions({ duration: 400, fade: true })
    void SplashScreen.hideAsync()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={showSplash ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTintColor: colors.pitch,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.mist },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="processing/[jobId]" options={{ title: 'Analyzing', headerBackTitle: 'Back' }} />
        <Stack.Screen name="results/[deliveryId]" options={{ title: 'Results', headerBackTitle: 'Back' }} />
      </Stack>
      {showSplash ? <BrandSplash onFinish={hideSplash} /> : null}
    </GestureHandlerRootView>
  )
}

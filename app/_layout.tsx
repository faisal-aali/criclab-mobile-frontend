import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '../src/auth/AuthProvider'
import { BrandSplash } from '../src/components/BrandSplash'
import { colors } from '../src/theme'

void SplashScreen.preventAutoHideAsync()

function AuthGate() {
  const { status, isVerified } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    const parts = [...segments]
    const inAuth = parts[0] === '(auth)'
    const authScreen = parts[1] ?? ''
    if (status === 'anonymous') {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }
    if (!isVerified) {
      if (!inAuth || authScreen !== 'verify') router.replace('/(auth)/verify')
      return
    }
    if (inAuth) router.replace('/(tabs)')
  }, [status, isVerified, segments, router])

  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.night }} />
  }

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.chalk,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.night },
        contentStyle: { backgroundColor: colors.night },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="leaderboard" options={{ title: 'Leaderboard', headerBackTitle: 'Back' }} />
      <Stack.Screen name="processing/[jobId]" options={{ title: 'Analyzing', headerBackTitle: 'Back' }} />
      <Stack.Screen name="results/[deliveryId]" options={{ title: 'Results', headerBackTitle: 'Back' }} />
      <Stack.Screen name="balltrack/record" options={{ headerShown: false, title: 'Record' }} />
      <Stack.Screen name="balltrack/processing/[jobId]" options={{ title: 'Tracking', headerBackTitle: 'Back' }} />
      <Stack.Screen name="balltrack/session/[sessionId]" options={{ title: 'Session', headerBackTitle: 'Back' }} />
      <Stack.Screen name="balltrack/delivery/[deliveryId]" options={{ title: 'Ball', headerBackTitle: 'Back' }} />
    </Stack>
  )
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true)
  const hideSplash = useCallback(() => setShowSplash(false), [])

  useEffect(() => {
    SplashScreen.setOptions({ duration: 400, fade: true })
    void SplashScreen.hideAsync()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.night }}>
      <StatusBar style="light" />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
      {showSplash ? <BrandSplash onFinish={hideSplash} /> : null}
    </GestureHandlerRootView>
  )
}

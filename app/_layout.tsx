import 'react-native-gesture-handler'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '../src/auth/AuthProvider'
import { BrandSplash } from '../src/components/BrandSplash'
import { ProcessingIndicator } from '../src/components/ProcessingIndicator'
import { StackBackButton } from '../src/components/StackBackButton'
import { ProcessingJobsProvider } from '../src/processing/ProcessingJobs'
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
    if (inAuth) router.replace('/')
  }, [status, isVerified, segments, router])

  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.night }} />
  }

  const analysisHeader = {
    headerTintColor: colors.chalk,
    headerBackVisible: false as const,
    headerLeft: () => <StackBackButton />,
    headerRight: () => (
      <View style={{ marginRight: 12 }}>
        <ProcessingIndicator />
      </View>
    ),
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
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="processing/[jobId]" options={{ title: 'Analyzing', ...analysisHeader }} />
      <Stack.Screen name="results/[deliveryId]" options={{ title: 'Results', ...analysisHeader }} />
      <Stack.Screen name="action/record" options={{ headerShown: false, title: 'Record' }} />
      <Stack.Screen name="balltrack/record" options={{ headerShown: false, title: 'Record' }} />
      <Stack.Screen name="balltrack/processing/[jobId]" options={{ title: 'Tracking', ...analysisHeader }} />
      <Stack.Screen name="balltrack/session/[sessionId]" options={{ title: 'Session', ...analysisHeader }} />
      <Stack.Screen name="balltrack/delivery/[deliveryId]" options={{ title: 'Ball', ...analysisHeader }} />
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
        <ProcessingJobsProvider>
          <AuthGate />
        </ProcessingJobsProvider>
      </AuthProvider>
      {showSplash ? <BrandSplash onFinish={hideSplash} /> : null}
    </GestureHandlerRootView>
  )
}

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '../src/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
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
    </GestureHandlerRootView>
  )
}

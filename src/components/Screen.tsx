import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme'

export function Screen({
  children,
  scroll = true,
  safeTop = true,
  safeBottom = false,
}: {
  children: ReactNode
  scroll?: boolean
  /** False when a navigator header already accounts for the status bar. */
  safeTop?: boolean
  /** True on auth and full-screen stacks so content clears the home indicator. */
  safeBottom?: boolean
}) {
  const inner = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: 20 }}>{children}</View>
  )

  return (
    <LinearGradient colors={[colors.night, colors.charcoal, '#080e10']} style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={[...(safeTop ? (['top'] as const) : []), ...(safeBottom ? (['bottom'] as const) : [])]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, layout, screenPad, typeScale } from '../theme'

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
  const { width } = useWindowDimensions()
  const pad = screenPad(width)
  const frame = {
    padding: pad,
    paddingBottom: pad + 28,
    width: '100%' as const,
    maxWidth: layout.maxContent,
    alignSelf: 'center' as const,
  }

  const inner = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={frame}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, frame]}>{children}</View>
  )

  return (
    <LinearGradient colors={[colors.night, '#071112', colors.charcoal]} style={{ flex: 1 }}>
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

export function PageHero({
  kicker,
  title,
  lead,
}: {
  kicker?: string
  title: string
  lead?: string
}) {
  const { width } = useWindowDimensions()
  const t = typeScale(width)
  return (
    <View>
      {kicker ? (
        <Text
          style={{
            marginTop: 18,
            fontSize: t.kicker,
            fontWeight: '800',
            letterSpacing: 2.2,
            color: colors.lime,
          }}
        >
          {kicker}
        </Text>
      ) : null}
      <Text
        style={{
          marginTop: kicker ? 8 : 18,
          fontSize: t.hero,
          fontWeight: '800',
          color: colors.chalk,
          lineHeight: t.heroLine,
          letterSpacing: -0.55,
        }}
      >
        {title}
      </Text>
      {lead ? (
        <Text style={{ marginTop: 10, fontSize: t.body, lineHeight: 22, color: colors.muted }}>{lead}</Text>
      ) : null}
    </View>
  )
}

export function SectionCard({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: colors.card,
        borderRadius: layout.radius.lg,
        borderWidth: 1,
        borderColor: accent ? colors.limeLine : colors.line,
        padding: 16,
      }}
    >
      {children}
    </View>
  )
}

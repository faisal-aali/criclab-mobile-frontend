import Ionicons from '@expo/vector-icons/Ionicons'
import { useState, type ReactNode } from 'react'
import { Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { fieldInputStyle, FieldLabel } from './ChoiceRow'
import { Logo } from './Logo'
import { Screen } from './Screen'
import { colors, layout, typeScale } from '../theme'

export function AuthScreen({
  kicker,
  title,
  lead,
  children,
  footer,
}: {
  kicker?: string
  title: string
  lead: string
  children: ReactNode
  footer?: ReactNode
}) {
  const { width } = useWindowDimensions()
  const t = typeScale(width)
  return (
    <Screen safeBottom>
      <Logo size={t.compact ? 30 : 36} />
      {kicker ? (
        <Text
          style={{
            marginTop: t.compact ? 18 : 26,
            fontSize: t.kicker,
            fontWeight: '800',
            letterSpacing: 2.4,
            color: colors.lime,
          }}
        >
          {kicker}
        </Text>
      ) : null}
      <Text
        style={{
          marginTop: 8,
          fontSize: t.hero,
          fontWeight: '800',
          color: colors.chalk,
          lineHeight: t.heroLine,
          letterSpacing: -0.6,
        }}
      >
        {title}
      </Text>
      <Text style={{ marginTop: 10, fontSize: t.body, lineHeight: 22, color: colors.muted }}>{lead}</Text>
      <View
        style={{
          marginTop: 22,
          backgroundColor: colors.card,
          borderRadius: layout.radius.lg,
          borderWidth: 1,
          borderColor: colors.limeLine,
          paddingHorizontal: t.compact ? 14 : 18,
          paddingTop: 8,
          paddingBottom: 18,
        }}
      >
        {children}
      </View>
      {footer ? <View style={{ marginTop: 22 }}>{footer}</View> : null}
    </Screen>
  )
}

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
  autoComplete,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  secure?: boolean
  keyboardType?: 'email-address' | 'default' | 'number-pad'
  autoComplete?: 'email' | 'password' | 'name' | 'off'
}) {
  const [visible, setVisible] = useState(false)
  const hide = Boolean(secure) && !visible
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ marginTop: 6, position: 'relative' }}>
        <TextInput
          key={hide ? 'hidden' : 'shown'}
          style={[fieldInputStyle, { marginTop: 0 }, secure ? { paddingRight: 48 } : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={hide}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={false}
          keyboardType={keyboardType === 'email-address' ? 'email-address' : keyboardType === 'number-pad' ? 'number-pad' : 'default'}
          autoComplete={autoComplete}
          textContentType={
            autoComplete === 'password' ? 'password' : autoComplete === 'email' ? 'emailAddress' : undefined
          }
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
            style={{
              position: 'absolute',
              right: 4,
              top: 0,
              bottom: 0,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={visible ? 'eye-off' : 'eye'}
              size={22}
              color={visible ? colors.lime : colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        marginTop: 22,
        backgroundColor: colors.lime,
        opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      <Text style={{ color: colors.onLime, fontWeight: '800', fontSize: 16 }}>{label}</Text>
    </Pressable>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View
      style={{
        backgroundColor: colors.roseBg,
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(240,113,103,0.28)',
      }}
    >
      <Text style={{ color: colors.ball, fontWeight: '600' }}>{message}</Text>
    </View>
  )
}

export function useBusy() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run, setError }
}

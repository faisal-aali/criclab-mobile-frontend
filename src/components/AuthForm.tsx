import { useState, type ReactNode } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import { fieldInputStyle, FieldLabel } from '../../src/components/ChoiceRow'
import { colors } from '../../src/theme'

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
  return (
    <Screen safeBottom>
      <Logo />
      {kicker ? (
        <Text style={{ marginTop: 22, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
          {kicker}
        </Text>
      ) : null}
      <Text style={{ marginTop: 8, fontSize: 30, fontWeight: '800', color: colors.chalk, lineHeight: 36 }}>
        {title}
      </Text>
      <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 22, color: colors.muted }}>{lead}</Text>
      <View style={{ marginTop: 22 }}>{children}</View>
      {footer ? <View style={{ marginTop: 24 }}>{footer}</View> : null}
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
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        style={fieldInputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secure}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        keyboardType={keyboardType === 'email-address' ? 'email-address' : keyboardType === 'number-pad' ? 'number-pad' : 'default'}
        autoComplete={autoComplete}
        textContentType={
          autoComplete === 'password' ? 'password' : autoComplete === 'email' ? 'emailAddress' : undefined
        }
      />
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
      style={{
        marginTop: 22,
        backgroundColor: colors.lime,
        opacity: disabled ? 0.55 : 1,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.onLime, fontWeight: '800', fontSize: 16 }}>{label}</Text>
    </Pressable>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View style={{ backgroundColor: colors.roseBg, borderRadius: 12, padding: 12, marginBottom: 8 }}>
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

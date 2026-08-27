import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text } from 'react-native'
import { auth } from '../../src/api/auth'
import { AuthError, AuthField, AuthScreen, PrimaryButton, useBusy } from '../../src/components/AuthForm'
import { colors } from '../../src/theme'

export default function ForgotScreen() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const { busy, error, run } = useBusy()

  return (
    <AuthScreen
      kicker="ACCOUNT"
      title={step === 'email' ? 'Reset your password' : 'Choose a new password'}
      lead={
        step === 'email'
          ? 'If that address has a CricLab account, a reset code is on its way.'
          : 'Enter the code from your email and a new password.'
      }
      footer={
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          Remembered it?{' '}
          <Link href="/(auth)/login" style={{ color: colors.lime, fontWeight: '800' }}>
            Sign in
          </Link>
        </Text>
      }
    >
      <AuthError message={error} />
      {info ? <Text style={{ color: colors.emerald, marginBottom: 8 }}>{info}</Text> : null}
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      {step === 'reset' ? (
        <>
          <AuthField label="Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
          <AuthField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="password"
          />
        </>
      ) : null}
      <PrimaryButton
        label={busy ? 'Please wait…' : step === 'email' ? 'Send code' : 'Update password'}
        disabled={busy || !email.trim() || (step === 'reset' && (code.trim().length < 4 || password.length < 8))}
        onPress={() =>
          run(async () => {
            if (step === 'email') {
              const res = await auth.forgotPassword(email.trim())
              setInfo(res.message)
              setStep('reset')
              return
            }
            await auth.resetPassword(email.trim(), code.trim(), password)
            router.replace('/(auth)/login')
          })
        }
      />
    </AuthScreen>
  )
}

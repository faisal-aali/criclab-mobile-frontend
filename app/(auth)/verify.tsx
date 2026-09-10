import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text } from 'react-native'
import { auth } from '../../src/api/auth'
import { useAuth } from '../../src/auth/AuthProvider'
import { AuthError, AuthField, AuthScreen, PrimaryButton, useBusy } from '../../src/components/AuthForm'
import { colors } from '../../src/theme'

export default function VerifyScreen() {
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>()
  const { adopt, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState(paramEmail || user?.email || '')
  const [code, setCode] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const { busy, error, run } = useBusy()

  return (
    <AuthScreen
      kicker="VERIFY"
      title="Confirm your email"
      lead="We sent a short code to your inbox. Enter it to finish signing in."
      footer={
        <Text
          onPress={() =>
            run(async () => {
              const res = await auth.resendOtp(email.trim())
              setInfo(res.message || 'A new code is on its way.')
            })
          }
          style={{ color: colors.lime, fontWeight: '800', textAlign: 'center' }}
        >
          Resend code
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
      <AuthField
        label="Code"
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        keyboardType="number-pad"
      />
      <PrimaryButton
        label={busy ? 'Checking…' : 'Verify email'}
        disabled={busy || !email.trim() || code.trim().length < 4}
        onPress={() =>
          run(async () => {
            const result = await auth.verifyEmail(email.trim(), code.trim())
            adopt(result)
            router.replace('/')
          })
        }
      />
    </AuthScreen>
  )
}

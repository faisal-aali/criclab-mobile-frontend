import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text } from 'react-native'
import { auth } from '../../src/api/auth'
import { useAuth } from '../../src/auth/AuthProvider'
import { AuthError, AuthField, AuthScreen, PrimaryButton, useBusy } from '../../src/components/AuthForm'
import { colors } from '../../src/theme'

export default function LoginScreen() {
  const { adopt } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useBusy()

  return (
    <AuthScreen
      kicker="CRICLAB"
      title="Sign in to CricLab"
      lead="Your sessions, analyses and bookings are waiting."
      footer={
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          New to CricLab?{' '}
          <Link href="/(auth)/signup" style={{ color: colors.lime, fontWeight: '800' }}>
            Create an account
          </Link>
        </Text>
      }
    >
      <AuthError message={error} />
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@club.com"
        keyboardType="email-address"
        autoComplete="email"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secure
        autoComplete="password"
      />
      <Link href="/(auth)/forgot" style={{ marginTop: 12, color: colors.lime, fontWeight: '700', fontSize: 13 }}>
        Forgot password?
      </Link>
      <PrimaryButton
        label={busy ? 'Signing in…' : 'Sign in'}
        disabled={busy || !email.trim() || !password}
        onPress={() =>
          run(async () => {
            const result = await auth.signIn(email.trim(), password)
            if (result.status === 'pending_verification') {
              router.replace({ pathname: '/(auth)/verify', params: { email: result.email } })
              return
            }
            adopt(result)
          })
        }
      />
    </AuthScreen>
  )
}

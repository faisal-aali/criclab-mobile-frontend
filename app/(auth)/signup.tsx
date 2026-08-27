import { Link, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { auth } from '../../src/api/auth'
import { AuthError, AuthField, AuthScreen, PrimaryButton, useBusy } from '../../src/components/AuthForm'
import { colors } from '../../src/theme'

function passwordChecks(password: string) {
  const stem = password.toLowerCase().replace(/[0-9!@#$]+$/, '')
  const common = [
    'password', 'passw0rd', 'qwerty', 'qwertyui', 'letmein', 'welcome',
    'iloveyou', 'admin', 'abc', 'abcd', 'test', 'changeme', 'secret',
    'cricket', 'criclab', 'bowling', 'monkey', 'dragon', 'football',
  ]
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[a-z]/i.test(password) },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Not an obvious guess', ok: password.length > 0 && !common.includes(stem) && !common.includes(password.toLowerCase()) },
  ]
}

export default function SignUpScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useBusy()
  const checks = useMemo(() => passwordChecks(password), [password])
  const strong = checks.every((c) => c.ok)

  return (
    <AuthScreen
      kicker="JOIN"
      title="Create your CricLab account"
      lead="Film one delivery and see what a proper read looks like. No rig, no markers."
      footer={
        <Text style={{ color: colors.muted, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/(auth)/login" style={{ color: colors.lime, fontWeight: '800' }}>
            Sign in
          </Link>
        </Text>
      }
    >
      <AuthError message={error} />
      <AuthField label="Your name" value={name} onChangeText={setName} placeholder="Talha Khilji" autoComplete="name" />
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
        placeholder="At least 8 characters"
        secure
        autoComplete="password"
      />
      <View style={{ marginTop: 12, gap: 6 }}>
        {checks.map((c) => (
          <Text key={c.label} style={{ fontSize: 12, color: c.ok ? colors.emerald : colors.muted }}>
            {c.ok ? '✓' : '○'} {c.label}
          </Text>
        ))}
      </View>
      <PrimaryButton
        label={busy ? 'Creating…' : 'Create account'}
        disabled={busy || !name.trim() || !email.trim() || !strong}
        onPress={() =>
          run(async () => {
            const result = await auth.signUp(name.trim(), email.trim(), password)
            router.replace({ pathname: '/(auth)/verify', params: { email: result.email } })
          })
        }
      />
    </AuthScreen>
  )
}

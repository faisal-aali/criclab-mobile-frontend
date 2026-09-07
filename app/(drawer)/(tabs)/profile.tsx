import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { getHealth } from '../../../src/api/client'
import { auth } from '../../../src/api/auth'
import { defaultBase, getApiBase, setApiBase, suggestedLanHint } from '../../../src/api/config'
import { useAuth } from '../../../src/auth/AuthProvider'
import { AppHeader } from '../../../src/components/AppHeader'
import { ChoiceRow, FieldLabel, fieldInputStyle } from '../../../src/components/ChoiceRow'
import { PageHero, Screen, SectionCard } from '../../../src/components/Screen'
import {
  emptyProfile,
  heightMeters,
  loadProfile,
  profileBlockers,
  profileInitials,
  saveProfile,
  type SavedProfile,
} from '../../../src/storage/profile'
import { colors } from '../../../src/theme'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut, adopt } = useAuth()
  const [profile, setProfile] = useState<SavedProfile>(emptyProfile)
  const [saving, setSaving] = useState(false)
  const [apiBase, setApiBaseField] = useState('')
  const [health, setHealth] = useState<string | null>(null)
  const [pinging, setPinging] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => {
    loadProfile().then(setProfile)
    getApiBase().then(setApiBaseField)
  }, [])

  const heightM = useMemo(() => heightMeters(profile), [profile])
  const blockers = profileBlockers(profile)
  const ready = blockers.length === 0
  const displayName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim()

  function setField<K extends keyof SavedProfile>(key: K, value: SavedProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  async function onSave() {
    if (!ready) {
      Alert.alert('Missing details', `Still needed: ${blockers.join(', ')}`)
      return
    }
    setSaving(true)
    try {
      await saveProfile(profile)
      Alert.alert('Saved', 'Your bowling profile is ready for analysis.')
    } finally {
      setSaving(false)
    }
  }

  async function onSaveLabUrl() {
    const next = await setApiBase(apiBase || defaultBase())
    setApiBaseField(next)
    Alert.alert('Saved', 'The phone will call this lab URL on the next request.')
  }

  async function onChangePassword() {
    if (newPassword.length < 8) {
      Alert.alert('New password', 'Use at least 8 characters.')
      return
    }
    setPwBusy(true)
    try {
      const result = await auth.changePassword(currentPassword, newPassword)
      adopt(result)
      setCurrentPassword('')
      setNewPassword('')
      Alert.alert('Password updated', 'Other devices were signed out.')
    } catch (err) {
      Alert.alert('Could not update', err instanceof Error ? err.message : 'Check your current password.')
    } finally {
      setPwBusy(false)
    }
  }

  function onSignOutEverywhere() {
    Alert.alert('Sign out everywhere?', 'Every device using this account will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out everywhere',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOutEverywhere()
          } catch {
            /* local session still ends */
          }
          await signOut()
        },
      },
    ])
  }

  async function onPing() {
    setPinging(true)
    setHealth(null)
    try {
      await setApiBase(apiBase || defaultBase())
      const r = await getHealth()
      setHealth(r.ok ? `Lab is up${r.name ? ` · ${r.name}` : ''}` : 'Lab answered but is not ok')
    } catch (err) {
      setHealth(err instanceof Error ? err.message : 'Could not reach the lab')
    } finally {
      setPinging(false)
    }
  }

  return (
    <Screen>
      <AppHeader />
      <PageHero
        kicker="ACCOUNT"
        title="More"
        lead="Height and bowling arm scale pixels to metres and tell the lab which wrist to track."
      />

      <SectionCard accent>
        <Text style={{ fontWeight: '800', color: colors.chalk }}>{user?.name || 'Signed in'}</Text>
        <Text style={{ marginTop: 4, color: colors.muted }}>{user?.email}</Text>
        <Pressable
          onPress={() => router.push('/leaderboard')}
          style={{
            marginTop: 14,
            backgroundColor: colors.lime,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.onLime, fontWeight: '800' }}>Leaderboard</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/tickets')}
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.charcoal,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.chalk, fontWeight: '800' }}>Support tickets</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('Sign out', 'End this session on this phone?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
            ])
          }
          style={{ marginTop: 12, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ color: colors.ball, fontWeight: '800' }}>Sign out</Text>
        </Pressable>
        <Pressable onPress={onSignOutEverywhere} style={{ marginTop: 4, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontWeight: '800' }}>Sign out everywhere</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <Text style={{ fontWeight: '800', color: colors.chalk }}>Password</Text>
        <Text style={{ marginTop: 6, fontSize: 12, color: colors.muted, lineHeight: 18 }}>
          Changing it ends other sessions. This phone stays signed in.
        </Text>
        <FieldLabel>Current password</FieldLabel>
        <TextInput
          style={fieldInputStyle}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <FieldLabel>New password</FieldLabel>
        <TextInput
          style={fieldInputStyle}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Pressable
          onPress={() => void onChangePassword()}
          disabled={pwBusy || !currentPassword || !newPassword}
          style={{
            marginTop: 14,
            backgroundColor: colors.charcoal,
            borderWidth: 1,
            borderColor: colors.line,
            opacity: pwBusy || !currentPassword || !newPassword ? 0.5 : 1,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.chalk, fontWeight: '800' }}>{pwBusy ? 'Updating…' : 'Update password'}</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <Text style={{ fontWeight: '800', color: colors.chalk }}>Lab URL</Text>
        <Text style={{ marginTop: 6, fontSize: 12, color: colors.muted, lineHeight: 18 }}>{suggestedLanHint()}</Text>
        <FieldLabel>API base</FieldLabel>
        <TextInput
          style={fieldInputStyle}
          value={apiBase}
          onChangeText={setApiBaseField}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.15:8000"
          placeholderTextColor={colors.muted}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={() => void onSaveLabUrl()}
            style={{
              flex: 1,
              minWidth: 120,
              backgroundColor: colors.lime,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.onLime, fontWeight: '800' }}>Save URL</Text>
          </Pressable>
          <Pressable
            onPress={() => void onPing()}
            disabled={pinging}
            style={{
              flex: 1,
              minWidth: 120,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.charcoal,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pinging ? 0.6 : 1,
            }}
          >
            <Text style={{ color: colors.chalk, fontWeight: '800' }}>{pinging ? 'Pinging…' : 'Ping lab'}</Text>
          </Pressable>
        </View>
        {health ? (
          <Text style={{ marginTop: 10, fontSize: 12, color: health.startsWith('Lab is up') ? colors.emerald : colors.ball }}>
            {health}
          </Text>
        ) : null}
      </SectionCard>

      <View
        style={{
          marginTop: 18,
          backgroundColor: colors.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.lime,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.onLime, fontSize: 22, fontWeight: '800' }}>{profileInitials(profile)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.chalk }}>
              {displayName || 'Your bowling profile'}
            </Text>
            <Text style={{ marginTop: 4, color: colors.muted }}>
              {ready
                ? `${profile.bowlingArm === 'left' ? 'Left-arm' : 'Right-arm'} ${profile.bowlingStyle}`
                : 'Complete the details below'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 140 }}>
            <FieldLabel>First name</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.firstName}
              onChangeText={(v) => setField('firstName', v)}
              autoCapitalize="words"
            />
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <FieldLabel>Last name</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.lastName}
              onChangeText={(v) => setField('lastName', v)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <FieldLabel>Date of birth (YYYY-MM-DD)</FieldLabel>
        <TextInput
          style={fieldInputStyle}
          value={profile.dob}
          onChangeText={(v) => setField('dob', v)}
          placeholder="1998-05-12"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 90 }}>
            <FieldLabel>Height (ft)</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.heightFt}
              onChangeText={(v) => setField('heightFt', v)}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={{ flex: 1, minWidth: 90 }}>
            <FieldLabel>Height (in)</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.heightIn}
              onChangeText={(v) => setField('heightIn', v)}
              keyboardType="number-pad"
              placeholder="11"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={{ flex: 1, minWidth: 90 }}>
            <FieldLabel>Weight (lbs)</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.weightLbs}
              onChangeText={(v) => setField('weightLbs', v)}
              keyboardType="decimal-pad"
              placeholder="165"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>
        {heightM ? (
          <Text style={{ marginTop: 6, fontSize: 12, color: colors.muted }}>
            {heightM.toFixed(2)} m — used to convert pixels into km/h
          </Text>
        ) : null}

        <FieldLabel>Bowling arm</FieldLabel>
        <ChoiceRow
          value={profile.bowlingArm}
          onChange={(v) => setField('bowlingArm', v)}
          options={[
            { label: 'Right-arm', value: 'right' },
            { label: 'Left-arm', value: 'left' },
          ]}
        />

        <FieldLabel>Bowling style</FieldLabel>
        <ChoiceRow
          value={profile.bowlingStyle}
          onChange={(v) => setField('bowlingStyle', v)}
          options={[
            { label: 'Pace', value: 'pace' },
            { label: 'Medium', value: 'medium' },
            { label: 'Spin', value: 'spin' },
          ]}
        />

        {!ready ? (
          <Text style={{ marginTop: 14, fontSize: 12, color: colors.muted }}>Still needed: {blockers.join(', ')}.</Text>
        ) : null}

        <Pressable
          onPress={onSave}
          disabled={saving}
          style={{
            marginTop: 18,
            backgroundColor: colors.lime,
            opacity: saving ? 0.55 : 1,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.onLime, fontWeight: '800', fontSize: 16 }}>
            {saving ? 'Saving…' : 'Save profile'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}

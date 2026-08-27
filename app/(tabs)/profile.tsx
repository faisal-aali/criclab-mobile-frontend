import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { useAuth } from '../../src/auth/AuthProvider'
import { ChoiceRow, FieldLabel, fieldInputStyle } from '../../src/components/ChoiceRow'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import {
  emptyProfile,
  heightMeters,
  loadProfile,
  profileBlockers,
  profileInitials,
  saveProfile,
  type SavedProfile,
} from '../../src/storage/profile'
import { colors } from '../../src/theme'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<SavedProfile>(emptyProfile)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile().then(setProfile)
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

  return (
    <Screen>
      <Logo />
      <Text style={{ marginTop: 18, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
        ACCOUNT
      </Text>
      <Text style={{ marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.chalk }}>More</Text>
      <Text style={{ marginTop: 8, lineHeight: 22, color: colors.muted }}>
        Height and bowling arm scale pixels to metres and tell the lab which wrist to track.
      </Text>

      <View
        style={{
          marginTop: 18,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 16,
        }}
      >
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
      </View>

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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>First name</FieldLabel>
            <TextInput
              style={fieldInputStyle}
              value={profile.firstName}
              onChangeText={(v) => setField('firstName', v)}
              autoCapitalize="words"
            />
          </View>
          <View style={{ flex: 1 }}>
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

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
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
          <View style={{ flex: 1 }}>
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
          <View style={{ flex: 1 }}>
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

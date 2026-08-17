import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { getHealth } from '../../src/api/client'
import { getApiBase, setApiBase, suggestedLanHint } from '../../src/api/config'
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
  const [profile, setProfile] = useState<SavedProfile>(emptyProfile)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile().then(setProfile)
    getApiBase().then(setUrl)
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

  async function ping() {
    try {
      await setApiBase(url)
      const h = await getHealth()
      setStatus(h.ok === false ? 'API responded but not healthy' : 'Connected to Cric-Lab API')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not connect')
    }
  }

  return (
    <Screen>
      <Logo />
      <Text style={{ marginTop: 18, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>
        BOWLER
      </Text>
      <Text style={{ marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.pitch }}>Profile</Text>
      <Text style={{ marginTop: 8, lineHeight: 22, color: colors.muted }}>
        Height and bowling arm scale pixels to metres and tell the lab which wrist to track.
      </Text>

      <View
        style={{
          marginTop: 20,
          backgroundColor: 'rgba(255,255,255,0.85)',
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
              backgroundColor: colors.pitch,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.white, fontSize: 22, fontWeight: '800' }}>{profileInitials(profile)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.pitch }}>
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
            backgroundColor: colors.pitch,
            opacity: saving ? 0.55 : 1,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>
            {saving ? 'Saving…' : 'Save profile'}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: colors.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 16,
        }}
      >
        <Text style={{ fontWeight: '800', color: colors.pitch }}>Lab connection</Text>
        <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.muted }}>{suggestedLanHint()}</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={fieldInputStyle}
          placeholder="http://192.168.1.10:8000"
          placeholderTextColor={colors.muted}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={async () => {
              const clean = await setApiBase(url)
              setUrl(clean)
              Alert.alert('Saved', `API base is now ${clean}`)
            }}
            style={{
              flex: 1,
              backgroundColor: colors.pitch,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.white, fontWeight: '800' }}>Save</Text>
          </Pressable>
          <Pressable
            onPress={ping}
            style={{
              flex: 1,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.pitch,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.pitch, fontWeight: '800' }}>Test</Text>
          </Pressable>
        </View>
        {status ? (
          <Text style={{ marginTop: 12, color: status.startsWith('Connected') ? colors.emerald : colors.ball }}>
            {status}
          </Text>
        ) : null}
      </View>
    </Screen>
  )
}

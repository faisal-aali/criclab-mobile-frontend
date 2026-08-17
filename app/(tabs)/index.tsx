import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { uploadVideo, type PickedVideo } from '../../src/api/client'
import { ChoiceRow, FieldLabel } from '../../src/components/ChoiceRow'
import { ClipPlayer } from '../../src/components/ClipPlayer'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import { loadProfile, saveProfile, type SavedProfile } from '../../src/storage/profile'
import { colors } from '../../src/theme'

const inputStyle = {
  marginTop: 6,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.white,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 16,
  color: colors.ink,
} as const

export default function AnalyzeScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<SavedProfile>({
    firstName: '',
    lastName: '',
    dob: '',
    heightFt: '',
    heightIn: '',
    weightLbs: '',
    bowlingArm: '',
    bowlingStyle: '',
  })
  const [video, setVideo] = useState<PickedVideo | null>(null)
  const [metersPerPixel, setMetersPerPixel] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadProfile().then(setProfile)
  }, [])

  const heightM = useMemo(() => {
    const ft = Number(profile.heightFt)
    const inch = Number(profile.heightIn)
    const m = (Number.isNaN(ft) ? 0 : ft) * 0.3048 + (Number.isNaN(inch) ? 0 : inch) * 0.0254
    return m > 0 ? m : null
  }, [profile.heightFt, profile.heightIn])

  const inches = Number(profile.heightIn)
  const inchesOk = profile.heightIn === '' || (!Number.isNaN(inches) && inches >= 0 && inches <= 11)

  const blockers: string[] = []
  if (!profile.firstName.trim()) blockers.push('first name')
  if (!profile.lastName.trim()) blockers.push('last name')
  if (!profile.dob.trim()) blockers.push('date of birth (YYYY-MM-DD)')
  if (heightM == null) blockers.push('height')
  else if (heightM < 1.2 || heightM > 2.3) blockers.push('a realistic height')
  if (!inchesOk) blockers.push('inches 0–11')
  if (!(Number(profile.weightLbs) >= 50 && Number(profile.weightLbs) <= 400)) blockers.push('weight in lbs')
  if (profile.bowlingArm !== 'left' && profile.bowlingArm !== 'right') blockers.push('bowling arm')
  if (!['pace', 'spin', 'medium'].includes(profile.bowlingStyle)) blockers.push('bowling style')
  if (!video) blockers.push('a bowling video')
  const ready = blockers.length === 0

  function setField<K extends keyof SavedProfile>(key: K, value: SavedProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  async function pickVideo(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', fromCamera ? 'Camera access is required.' : 'Photo library access is required.')
      return
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: 30, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const name = asset.fileName || asset.uri.split('/').pop() || 'delivery.mp4'
    setVideo({ uri: asset.uri, name, mimeType: asset.mimeType })
  }

  async function onAnalyze() {
    if (!video || !ready) {
      Alert.alert('Missing details', `Still needed: ${blockers.join(', ')}`)
      return
    }
    setBusy(true)
    try {
      await saveProfile(profile)
      const res = await uploadVideo({
        video,
        playerName: `${profile.firstName.trim()} ${profile.lastName.trim()}`,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        dateOfBirth: profile.dob.trim(),
        heightFt: Number(profile.heightFt) || 0,
        heightIn: Number(profile.heightIn) || 0,
        weightLbs: Number(profile.weightLbs),
        bowlingArm: profile.bowlingArm as 'left' | 'right',
        bowlingStyle: profile.bowlingStyle as 'pace' | 'spin' | 'medium',
        metersPerPixel: metersPerPixel ? Number(metersPerPixel) : undefined,
      })
      router.push(`/processing/${res.job_id}`)
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not reach the Cric-Lab API. Check Settings.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Logo />
      <Text style={{ marginTop: 18, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.seam }}>
        AI BOWLING LABORATORY
      </Text>
      <Text style={{ marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.pitch, lineHeight: 38 }}>
        Analyze every delivery
      </Text>
      <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 22, color: colors.muted }}>
        Height and bowling arm are required so we can scale pixels to metres and track the correct wrist.
      </Text>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '800', color: colors.pitch }}>Film it this way</Text>
        <Text style={{ marginTop: 6, color: colors.muted, lineHeight: 20 }}>
          Side-on camera · full body in frame from run-up through follow-through · ball visible after it leaves the
          hand.
        </Text>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.pitch }}>Bowler profile</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel>First name</FieldLabel>
            <TextInput
              style={inputStyle}
              value={profile.firstName}
              onChangeText={(v) => setField('firstName', v)}
              autoCapitalize="words"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>Last name</FieldLabel>
            <TextInput
              style={inputStyle}
              value={profile.lastName}
              onChangeText={(v) => setField('lastName', v)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <FieldLabel>Date of birth (YYYY-MM-DD)</FieldLabel>
        <TextInput
          style={inputStyle}
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
              style={inputStyle}
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
              style={inputStyle}
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
              style={inputStyle}
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

        <FieldLabel>Bowling video</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Pressable
            onPress={() => pickVideo(false)}
            style={{
              flex: 1,
              backgroundColor: colors.pitch,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.white, fontWeight: '700' }}>Library</Text>
          </Pressable>
          <Pressable
            onPress={() => pickVideo(true)}
            style={{
              flex: 1,
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.pitch,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.pitch, fontWeight: '700' }}>Record</Text>
          </Pressable>
        </View>
        {video ? <Text style={{ marginTop: 8, fontSize: 12, color: colors.muted }}>{video.name}</Text> : null}
        {video ? (
          <View style={{ marginTop: 12 }}>
            <ClipPlayer uri={video.uri} label="Before · your clip" />
          </View>
        ) : null}

        <FieldLabel>Advanced scale (optional)</FieldLabel>
        <TextInput
          style={inputStyle}
          value={metersPerPixel}
          onChangeText={setMetersPerPixel}
          placeholder="meters per pixel, e.g. 0.008"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
        />

        {!ready ? (
          <Text style={{ marginTop: 14, fontSize: 12, color: colors.muted }}>Still needed: {blockers.join(', ')}.</Text>
        ) : null}

        <Pressable
          onPress={onAnalyze}
          disabled={busy || !ready}
          style={{
            marginTop: 18,
            backgroundColor: colors.pitch,
            opacity: busy || !ready ? 0.55 : 1,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>
            {busy ? 'Uploading…' : ready ? 'Analyze delivery' : 'Complete details to continue'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}

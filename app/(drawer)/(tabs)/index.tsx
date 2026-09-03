import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { uploadVideo, type PickedVideo } from '../../../src/api/client'
import { consumeActionClip } from '../../../src/camera/pendingActionClip'
import { useProcessingJobs } from '../../../src/processing/ProcessingJobs'
import { FieldLabel, fieldInputStyle } from '../../../src/components/ChoiceRow'
import { ClipPlayer } from '../../../src/components/ClipPlayer'
import { AppHeader } from '../../../src/components/AppHeader'
import { PageHero, Screen, SectionCard } from '../../../src/components/Screen'
import {
  emptyProfile,
  heightMeters,
  isProfileReady,
  loadProfile,
  profileBlockers,
  profileInitials,
  type SavedProfile,
} from '../../../src/storage/profile'
import { colors } from '../../../src/theme'

export default function AnalyzeScreen() {
  const router = useRouter()
  const { trackJob } = useProcessingJobs()
  const { width } = useWindowDimensions()
  const stackActions = width < 360
  const [profile, setProfile] = useState<SavedProfile>(emptyProfile)
  const [video, setVideo] = useState<PickedVideo | null>(null)
  const [metersPerPixel, setMetersPerPixel] = useState('')
  const [busy, setBusy] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile)
      const clip = consumeActionClip()
      if (clip) setVideo(clip)
    }, []),
  )

  const heightM = heightMeters(profile)
  const profileReady = isProfileReady(profile)
  const blockers = [...profileBlockers(profile)]
  if (!video) blockers.push('a bowling video')
  const ready = blockers.length === 0
  const displayName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim()

  async function pickVideo() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library access is required.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const name = asset.fileName || asset.uri.split('/').pop() || 'delivery.mp4'
    setVideo({ uri: asset.uri, name, mimeType: asset.mimeType })
  }

  async function onAnalyze() {
    if (!profileReady) {
      Alert.alert('Complete your profile', 'Add height, bowling arm, and the rest of your details on More.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open profile', onPress: () => router.push('/profile') },
      ])
      return
    }
    if (!video || !ready) {
      Alert.alert('Missing details', `Still needed: ${blockers.join(', ')}`)
      return
    }
    setBusy(true)
    try {
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
      trackJob({ id: res.job_id, kind: 'action' })
      setVideo(null)
      Alert.alert(
        'Queued for the lab',
        'Analysis runs in the background. Watch the lime ring in the header — you can keep using the app.',
        [
          { text: 'Watch progress', onPress: () => router.push(`/processing/${res.job_id}`) },
          { text: 'OK' },
        ],
      )
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not reach the CricLab API.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <AppHeader />
      <PageHero
        kicker="ACTION · SIDE-ON"
        title="Analyze every delivery"
        lead="Film a side-on clip. Your saved profile scales the delivery into metres and km/h. Ball flight is a different tab — do not mix those numbers with this report."
      />

      <Pressable
        onPress={() => router.push('/profile')}
        style={{
          marginTop: 16,
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.limeLine,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.lime,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.onLime, fontWeight: '800' }}>{profileInitials(profile)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: colors.chalk }}>{displayName || 'Set up your profile'}</Text>
          <Text style={{ marginTop: 2, color: colors.muted, fontSize: 13 }}>
            {profileReady
              ? `${profile.bowlingArm === 'left' ? 'Left-arm' : 'Right-arm'} ${profile.bowlingStyle}${
                  heightM ? ` · ${heightM.toFixed(2)} m` : ''
                }`
              : 'Tap to add height, arm, and bowling style'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.lime} />
      </Pressable>

      <SectionCard>
        <Text style={{ fontWeight: '800', color: colors.chalk }}>Film it this way</Text>
        <Text style={{ marginTop: 6, color: colors.muted, lineHeight: 20 }}>
          Side-on camera · full body in frame from run-up through follow-through · ball visible after it leaves the
          hand. Record opens a 1080p / 120 fps camera when the phone supports it.
        </Text>
      </SectionCard>

      <SectionCard accent>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.chalk }}>Bowling video</Text>

        <View style={{ flexDirection: stackActions ? 'column' : 'row', gap: 10, marginTop: 12 }}>
          <Pressable
            onPress={() => void pickVideo()}
            style={{
              flex: stackActions ? undefined : 1,
              backgroundColor: colors.lime,
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="images" size={18} color={colors.onLime} />
            <Text style={{ color: colors.onLime, fontWeight: '800' }}>Library</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/action/record')}
            style={{
              flex: stackActions ? undefined : 1,
              backgroundColor: colors.charcoal,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.lime,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="videocam" size={18} color={colors.lime} />
            <Text style={{ color: colors.lime, fontWeight: '800' }}>Record</Text>
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
          style={fieldInputStyle}
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
            backgroundColor: colors.lime,
            opacity: busy || !ready ? 0.55 : 1,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.onLime, fontWeight: '800', fontSize: 16 }}>
            {busy ? 'Uploading…' : ready ? 'Analyze delivery' : 'Complete details to continue'}
          </Text>
        </Pressable>
      </SectionCard>
    </Screen>
  )
}

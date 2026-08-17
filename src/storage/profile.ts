import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'criclab.playerProfile'

export type SavedProfile = {
  firstName: string
  lastName: string
  dob: string
  heightFt: string
  heightIn: string
  weightLbs: string
  bowlingArm: 'left' | 'right' | ''
  bowlingStyle: 'pace' | 'spin' | 'medium' | ''
}

export const emptyProfile: SavedProfile = {
  firstName: '',
  lastName: '',
  dob: '',
  heightFt: '',
  heightIn: '',
  weightLbs: '',
  bowlingArm: '',
  bowlingStyle: '',
}

export async function loadProfile(): Promise<SavedProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return emptyProfile
    return { ...emptyProfile, ...JSON.parse(raw) }
  } catch {
    return emptyProfile
  }
}

export async function saveProfile(profile: SavedProfile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile))
}

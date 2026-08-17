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

export function heightMeters(profile: SavedProfile): number | null {
  const ft = Number(profile.heightFt)
  const inch = Number(profile.heightIn)
  const m = (Number.isNaN(ft) ? 0 : ft) * 0.3048 + (Number.isNaN(inch) ? 0 : inch) * 0.0254
  return m > 0 ? m : null
}

export function profileBlockers(profile: SavedProfile): string[] {
  const blockers: string[] = []
  const inches = Number(profile.heightIn)
  const inchesOk = profile.heightIn === '' || (!Number.isNaN(inches) && inches >= 0 && inches <= 11)
  const heightM = heightMeters(profile)

  if (!profile.firstName.trim()) blockers.push('first name')
  if (!profile.lastName.trim()) blockers.push('last name')
  if (!profile.dob.trim()) blockers.push('date of birth (YYYY-MM-DD)')
  if (heightM == null) blockers.push('height')
  else if (heightM < 1.2 || heightM > 2.3) blockers.push('a realistic height')
  if (!inchesOk) blockers.push('inches 0–11')
  if (!(Number(profile.weightLbs) >= 50 && Number(profile.weightLbs) <= 400)) blockers.push('weight in lbs')
  if (profile.bowlingArm !== 'left' && profile.bowlingArm !== 'right') blockers.push('bowling arm')
  if (!['pace', 'spin', 'medium'].includes(profile.bowlingStyle)) blockers.push('bowling style')
  return blockers
}

export function isProfileReady(profile: SavedProfile) {
  return profileBlockers(profile).length === 0
}

export function profileInitials(profile: SavedProfile) {
  const first = profile.firstName.trim().charAt(0)
  const last = profile.lastName.trim().charAt(0)
  const letters = `${first}${last}`.toUpperCase()
  return letters || '?'
}

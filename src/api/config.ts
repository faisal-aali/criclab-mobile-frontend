import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const KEY = 'criclab.apiBase'

function metroLanHost(): string | null {
  const hostUri = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri
  const host = hostUri?.split(':')[0]?.trim()
  if (!host || host === 'localhost' || host === '127.0.0.1') return null
  return host
}

function isLoopback(url: string) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(url)
}

function defaultBase() {
  const env = process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, '')
  const lan = metroLanHost()

  // Expo Go on a real phone: 127.0.0.1 is the phone, not the Mac running FastAPI.
  if (lan && (!env || isLoopback(env))) {
    return `http://${lan}:8000`
  }
  if (env) return env
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000'
  return 'http://127.0.0.1:8000'
}

export async function getApiBase() {
  const saved = (await AsyncStorage.getItem(KEY))?.trim().replace(/\/$/, '')
  const fallback = defaultBase()
  if (saved && !(isLoopback(saved) && !isLoopback(fallback))) return saved
  return fallback
}

export async function setApiBase(url: string) {
  const clean = url.trim().replace(/\/$/, '')
  await AsyncStorage.setItem(KEY, clean)
  return clean
}

export function suggestedLanHint() {
  const lan = metroLanHost()
  if (lan) {
    return `This device should use http://${lan}:8000 (same Mac that is running Expo).`
  }
  if (Platform.OS === 'ios') {
    return 'Simulator: http://127.0.0.1:8000 · iPhone: http://YOUR-MAC-LAN-IP:8000'
  }
  if (Platform.OS === 'android') {
    return 'Emulator: http://10.0.2.2:8000 · Device: http://YOUR-MAC-LAN-IP:8000'
  }
  return 'http://127.0.0.1:8000'
}

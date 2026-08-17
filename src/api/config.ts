import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const KEY = 'criclab.apiBase'

function defaultBase() {
  const env = process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, '')
  if (env) return env
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000'
  return 'http://127.0.0.1:8000'
}

export async function getApiBase() {
  const saved = await AsyncStorage.getItem(KEY)
  if (saved?.trim()) return saved.trim().replace(/\/$/, '')
  return defaultBase()
}

export async function setApiBase(url: string) {
  const clean = url.trim().replace(/\/$/, '')
  await AsyncStorage.setItem(KEY, clean)
  return clean
}

export function suggestedLanHint() {
  if (Platform.OS === 'ios') {
    return 'Simulator: http://127.0.0.1:8000 · iPhone: http://YOUR-MAC-LAN-IP:8000'
  }
  if (Platform.OS === 'android') {
    return 'Emulator: http://10.0.2.2:8000 · Device: http://YOUR-MAC-LAN-IP:8000'
  }
  return 'http://127.0.0.1:8000'
}

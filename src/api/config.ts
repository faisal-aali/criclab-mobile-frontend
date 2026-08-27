import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const KEY = 'criclab.apiBase'

function hostFrom(raw?: string | null): string | null {
  if (!raw) return null
  const cleaned = raw.trim().replace(/^exps?:\/\//, 'http://')
  try {
    if (cleaned.includes('://')) {
      const host = new URL(cleaned).hostname
      return host || null
    }
  } catch {
    /* not a URL */
  }
  const host = cleaned.split('/')[0]?.split(':')[0]?.trim()
  return host || null
}

function usableLan(host: string | null) {
  if (!host || host === 'localhost' || host === '127.0.0.1') return null
  return host
}

function metroLanHost(): string | null {
  return (
    usableLan(hostFrom(Constants.expoGoConfig?.debuggerHost)) ||
    usableLan(hostFrom(Constants.expoConfig?.hostUri)) ||
    usableLan(hostFrom(Constants.linkingUri))
  )
}

function isLoopback(url: string) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(url)
}

function hostOf(url: string): string | null {
  return hostFrom(url)
}

function isPrivateIpv4(host: string | null) {
  if (!host) return false
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)
}

function extraBase() {
  const extra = (Constants.expoConfig?.extra as { apiBase?: string } | undefined)?.apiBase
  return extra?.trim().replace(/\/$/, '') || null
}

export function defaultBase() {
  const env = process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, '')
  const extra = extraBase()
  const lan = metroLanHost()

  // Expo Go on a real phone: the debugger host is this Mac. Prefer it over a
  // stale .env IP from last week's DHCP lease.
  if (lan) return `http://${lan}:8000`
  if (env && !isLoopback(env)) return env
  if (extra && !isLoopback(extra)) return extra
  if (env) return env
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000'
  return 'http://127.0.0.1:8000'
}

export async function getApiBase() {
  const fallback = defaultBase()
  const saved = (await AsyncStorage.getItem(KEY))?.trim().replace(/\/$/, '')
  if (!saved) return fallback
  if (isLoopback(saved) && !isLoopback(fallback)) return fallback
  const lan = metroLanHost()
  const savedHost = hostOf(saved)
  // DHCP moved: stored 192.168.1.26, Expo now sees 192.168.1.15.
  if (lan && savedHost && savedHost !== lan && isPrivateIpv4(savedHost)) return fallback
  return saved
}

export async function setApiBase(url: string) {
  const clean = url.trim().replace(/\/$/, '')
  await AsyncStorage.setItem(KEY, clean)
  return clean
}

export function suggestedLanHint() {
  const lan = metroLanHost()
  if (lan) {
    return `This device should use http://${lan}:8000 (same Mac that is running Expo and FastAPI).`
  }
  if (Platform.OS === 'ios') {
    return 'Simulator: http://127.0.0.1:8000 · iPhone: http://YOUR-MAC-LAN-IP:8000'
  }
  if (Platform.OS === 'android') {
    return 'Emulator: http://10.0.2.2:8000 · Device: http://YOUR-MAC-LAN-IP:8000'
  }
  return 'http://127.0.0.1:8000'
}

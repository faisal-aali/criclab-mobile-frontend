import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const KEY = 'criclab.apiBase'

export type AppEnv = 'development' | 'production'

type Extra = {
  apiBase?: string | null
  appEnv?: string
}

function extra(): Extra {
  return (Constants.expoConfig?.extra as Extra | undefined) ?? {}
}

function strip(raw?: string | null) {
  return raw?.trim().replace(/\/$/, '') || ''
}

export function appEnv(): AppEnv {
  const raw = (extra().appEnv || process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || 'development').toLowerCase()
  return raw === 'production' || raw === 'prod' ? 'production' : 'development'
}

export function isProduction() {
  return appEnv() === 'production'
}

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
  return strip(extra().apiBase) || null
}

function productionBase() {
  return (
    strip(process.env.EXPO_PUBLIC_API_BASE_PROD) ||
    extraBase() ||
    strip(process.env.EXPO_PUBLIC_API_BASE) ||
    ''
  )
}

function developmentBase() {
  const env = strip(process.env.EXPO_PUBLIC_API_BASE_DEV) || strip(process.env.EXPO_PUBLIC_API_BASE)
  const extraUrl = extraBase()
  const lan = metroLanHost()

  // Expo Go / dev client on a real phone: the debugger host is this Mac.
  if (lan) return `http://${lan}:8000`
  if (env && !isLoopback(env)) return env
  if (extraUrl && !isLoopback(extraUrl)) return extraUrl
  if (env) return env
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000'
  return 'http://127.0.0.1:8000'
}

export function defaultBase() {
  if (isProduction()) return productionBase()
  return developmentBase()
}

export async function getApiBase() {
  const fallback = defaultBase()
  if (isProduction()) return fallback

  const saved = strip(await AsyncStorage.getItem(KEY))
  if (!saved) return fallback
  if (isLoopback(saved) && !isLoopback(fallback)) return fallback
  const lan = metroLanHost()
  const savedHost = hostOf(saved)
  if (lan && savedHost && savedHost !== lan && isPrivateIpv4(savedHost)) return fallback
  return saved
}

export async function setApiBase(url: string) {
  const clean = strip(url)
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

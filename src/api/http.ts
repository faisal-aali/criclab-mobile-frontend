/**
 * Authenticated transport for the Expo client.
 *
 * Same contract as the web app: access token in memory, refresh token persisted,
 * one shared refresh on 401, session-end listeners when renewal fails.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApiBase } from './config'

const REFRESH_KEY = 'criclab.refresh'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | string
  email_verified: boolean
  created_at?: string
  profile?: Record<string, unknown>
  avatar_color?: string
}

export type TokenBundle = {
  access_token: string
  refresh_token: string
  expires_at: string
  expires_in: number
  user: AuthUser
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let accessToken: string | null = null
let accessExpiry = 0
let refreshInFlight: Promise<string | null> | null = null
const sessionEndedListeners = new Set<() => void>()

export function onSessionEnded(fn: () => void): () => void {
  sessionEndedListeners.add(fn)
  return () => sessionEndedListeners.delete(fn)
}

function endSession() {
  void clearTokens()
  sessionEndedListeners.forEach((fn) => fn())
}

export function setTokens(bundle: TokenBundle) {
  accessToken = bundle.access_token
  accessExpiry = Date.now() + Math.max(0, bundle.expires_in - 45) * 1000
  void AsyncStorage.setItem(REFRESH_KEY, bundle.refresh_token)
}

export async function clearTokens() {
  accessToken = null
  accessExpiry = 0
  await AsyncStorage.removeItem(REFRESH_KEY)
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY)
}

export async function ensureAccessToken(): Promise<string | null> {
  if (!accessToken || Date.now() >= accessExpiry) {
    await refreshSession()
  }
  return accessToken
}

function isFormBody(body: unknown): boolean {
  if (!body) return false
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true
  return typeof body === 'object' && body !== null && '_parts' in (body as object)
}

function extractMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const detail = (data as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined
    if (first?.msg) return first.msg.replace(/^Value error,\s*/, '')
  }
  const message = (data as { message?: unknown }).message
  return typeof message === 'string' ? message : ''
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new ApiError(extractMessage(data) || res.statusText || 'Something went wrong', res.status)
  }
  return (data ?? {}) as T
}

async function labFetch(path: string, init?: RequestInit, token?: string | null): Promise<Response> {
  const base = await getApiBase()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormBody(init?.body) ? {} : { 'content-type': 'application/json' }),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  }
  const extra = init?.headers
  if (extra && typeof extra === 'object' && !Array.isArray(extra) && !(extra instanceof Headers)) {
    Object.assign(headers, extra as Record<string, string>)
  }
  try {
    return await fetch(`${base}${path}`, { ...init, headers })
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Network request failed'
    if (/FormDataPart/i.test(reason)) {
      throw new ApiError(
        'This build cannot attach a video with fetch FormData. The app will use the native uploader.',
        0,
      )
    }
    throw new ApiError(
      `${reason} (${base}). On a phone use your Mac LAN IP and start FastAPI with --host 0.0.0.0`,
      0,
    )
  }
}

/** Unauthenticated call — sign-up, sign-in, password recovery, health. */
export async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await labFetch(path, init)
  return parse<T>(res)
}

export async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  const stored = await getStoredRefreshToken()
  if (!stored) return null

  refreshInFlight = (async () => {
    try {
      const bundle = await publicFetch<TokenBundle>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: stored }),
      })
      setTokens(bundle)
      return bundle.access_token
    } catch {
      endSession()
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

/** Authenticated call. Renews the token when needed and retries a 401 once. */
export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!accessToken || Date.now() >= accessExpiry) {
    await refreshSession()
  }

  let res = await labFetch(path, init, accessToken)
  if (res.status === 401) {
    const renewed = await refreshSession()
    if (!renewed) {
      endSession()
      throw new ApiError('Your session has ended. Sign in again.', 401)
    }
    res = await labFetch(path, init, renewed)
    if (res.status === 401) {
      endSession()
      throw new ApiError('Your session has ended. Sign in again.', 401)
    }
  }
  return parse<T>(res)
}

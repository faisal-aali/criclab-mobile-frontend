import { getApiBase } from '../api/config'
import type { BallTrackDelivery, BallTrackJob, BallTrackSession, Box, Calibration } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await getApiBase()
  let res: Response
  try {
    res = await fetch(`${base}${path}`, init)
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Network request failed'
    throw new Error(`${reason} (${base}). Check Profile → Lab connection.`)
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      const data = await res.json()
      detail = data.detail || data.message || detail
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  return res.json() as Promise<T>
}

export async function balltrackAssetUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = await getApiBase()
  return `${base}${path}`
}

export function uploadSession(input: { uri: string; name: string; mimeType?: string | null; calibration: Calibration; title?: string }) {
  const form = new FormData()
  form.append('file', {
    uri: input.uri,
    name: input.name || 'session.mp4',
    type: input.mimeType || 'video/mp4',
  } as unknown as Blob)
  form.append('calibration', JSON.stringify(input.calibration))
  form.append('title', input.title || 'Ball Track session')
  return request<{ session_id: string; job_id: string; status: string }>('/balltrack/sessions', {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  })
}

export function getBalltrackJob(jobId: string) {
  return request<BallTrackJob>(`/balltrack/jobs/${jobId}`)
}

export function listBalltrackSessions() {
  return request<{ items: BallTrackSession[] }>('/balltrack/sessions')
}

export function getBalltrackSession(id: string) {
  return request<BallTrackSession>(`/balltrack/sessions/${id}`)
}

export function getBalltrackDelivery(id: string) {
  return request<BallTrackDelivery>(`/balltrack/deliveries/${id}`)
}

export function detectStumps(input: { uri: string; bowler: Box; batter: Box }) {
  const form = new FormData()
  form.append('file', {
    uri: input.uri,
    name: 'frame.jpg',
    type: 'image/jpeg',
  } as unknown as Blob)
  form.append('hints', JSON.stringify({ bowler: input.bowler, batter: input.batter }))
  return request<{
    bowler: Box
    batter: Box
    found: boolean
    pitch_length_m?: number
    confidence?: { bowler: number; batter: number }
  }>('/balltrack/detect-stumps', {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  })
}

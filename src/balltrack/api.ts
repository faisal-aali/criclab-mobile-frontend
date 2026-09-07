import { cloudinaryClipUrl, type ClipUploadProgress, type PickedVideo } from '../api/client'
import { getApiBase } from '../api/config'
import { authFetch } from '../api/http'
import type { BallTrackDelivery, BallTrackJob, BallTrackSession, Box, Calibration } from './types'

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return authFetch<T>(path, init)
}

export async function balltrackAssetUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = await getApiBase()
  return `${base}${path}`
}

export async function uploadSession(
  input: {
    uri: string
    name: string
    mimeType?: string | null
    calibration: Calibration
    title?: string
  },
  onProgress?: (p: ClipUploadProgress) => void,
) {
  const form = new FormData()
  const video: PickedVideo = { uri: input.uri, name: input.name || 'session.mp4', mimeType: input.mimeType }
  const remote = await cloudinaryClipUrl(video, onProgress)
  if (remote) {
    form.append('source_url', remote)
    form.append('original_name', video.name)
  } else {
    form.append('file', {
      uri: video.uri,
      name: video.name,
      type: video.mimeType || 'video/mp4',
    } as unknown as Blob)
  }
  form.append('calibration', JSON.stringify(input.calibration))
  form.append('title', input.title || 'Ball Track session')
  onProgress?.({ phase: 'handoff', loaded: 1, total: 1 })
  return request<{ session_id: string; job_id: string; status: string }>('/balltrack/sessions', {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  })
}

export function getBalltrackJob(jobId: string) {
  return request<BallTrackJob>(`/balltrack/jobs/${jobId}`)
}

export function cancelBalltrackJob(jobId: string) {
  return request<{ id: string; status: string }>(`/balltrack/jobs/${jobId}/cancel`, { method: 'POST' })
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

import { uploadOriginalKey, type ClipUploadProgress, type PickedVideo } from '../api/client'
import { getApiBase } from '../api/config'
import { authFetch, ensureAccessToken } from '../api/http'
import { nativeMultipartUpload } from '../api/nativeUpload'
import type { BallTrackDelivery, BallTrackJob, BallTrackSession, Box, Calibration } from './types'

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return authFetch<T>(path, init)
}

function formFields(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString()
}

async function labFilePost<T>(
  path: string,
  fileUri: string,
  mimeType: string,
  parameters: Record<string, string>,
): Promise<T> {
  const base = await getApiBase()
  const token = await ensureAccessToken()
  const body = await nativeMultipartUpload({
    url: `${base}${path}`,
    fileUri,
    fieldName: 'file',
    mimeType,
    parameters,
    headers: {
      Accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  })
  return JSON.parse(body) as T
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
  const video: PickedVideo = { uri: input.uri, name: input.name || 'session.mp4', mimeType: input.mimeType }
  const fields = {
    calibration: JSON.stringify(input.calibration),
    title: input.title || 'Ball Track session',
  }
  const key = await uploadOriginalKey(video, onProgress)
  onProgress?.({ phase: 'handoff', loaded: 1, total: 1 })
  if (key) {
    return request<{ session_id: string; job_id: string; status: string }>('/balltrack/sessions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: formFields({ ...fields, source_key: key, original_name: video.name }),
    })
  }
  return labFilePost<{ session_id: string; job_id: string; status: string }>(
    '/balltrack/sessions',
    video.uri,
    video.mimeType || 'video/mp4',
    { ...fields, original_name: video.name },
  )
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
  return labFilePost<{
    bowler: Box
    batter: Box
    found: boolean
    pitch_length_m?: number
    confidence?: { bowler: number; batter: number }
  }>('/balltrack/detect-stumps', input.uri, 'image/jpeg', {
    hints: JSON.stringify({ bowler: input.bowler, batter: input.batter }),
  })
}

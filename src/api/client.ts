import { getApiBase } from './config'
import { authFetch, publicFetch } from './http'

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return authFetch<T>(path, init)
}

export type Job = {
  id: string
  video_id: string
  status: 'queued' | 'processing' | 'analyzing' | 'completed' | 'failed'
  progress: number
  stage?: string
  message?: string
  delivery_id?: string
  error?: string
  eta_seconds?: number | null
}

export type MetricValue = {
  value: number | null
  unit: string
  confidence: number
  estimated?: boolean
  status?: 'ok' | 'estimated' | 'unavailable' | string
  note?: string | null
}

export type Scores = {
  overall?: number | null
  arm_speed?: number | null
  ball_speed?: number | null
  sequencing?: number | null
  front_leg_brace?: number | null
  hip_shoulder_separation?: number | null
  label?: string
}

export type PlayerProfile = {
  player_name?: string
  first_name?: string
  last_name?: string
  age_years?: number
  height_m?: number
  weight_lbs?: number
  bowling_arm?: 'left' | 'right' | string
  bowling_style?: 'pace' | 'spin' | 'medium' | string
}

export type Metrics = {
  throwing_side?: string | null
  player_profile?: PlayerProfile
  ball_speed_kmh?: MetricValue
  ball_speed_mps?: MetricValue
  arm_speed_kmh?: MetricValue
  arm_speed_mps?: MetricValue
  release_time_ms?: MetricValue
  arm_swing_speed_deg_s?: MetricValue
  hip_rotation_speed_deg_s?: MetricValue
  trunk_rotation_speed_deg_s?: MetricValue
  release_height_m?: MetricValue
  release_angle_deg?: MetricValue
  stride_length_pct_height?: MetricValue
  elbow_extension_deg?: MetricValue
  front_knee_flexion_deg?: MetricValue
  hip_shoulder_separation_deg?: MetricValue
  scores?: Scores
  quality?: {
    pose_frames?: number
    calibrated?: boolean
    tracking_ok?: boolean
    camera_view?: string
    camera_view_note?: string
    speed_view_ok?: boolean
  }
  kinematic_sequence?: {
    n?: number
    key?: string
    label?: string
    frame?: number | null
    estimated?: boolean
  }[]
}

export function metricReady(m?: MetricValue | null): boolean {
  if (!m || m.value == null) return false
  return m.status === 'ok'
}

export type DrillCatalogItem = {
  id: string
  youtube_id: string
  title: string
  tags: string[]
}

export type LeaderboardRow = {
  rank: number
  player_name: string
  ball_speed_kmh: number | null
  arm_speed_kmh: number | null
  delivery_type: string | null
  bowling_arm: string | null
  created_at: string
  mine: boolean
  result_id: string | null
}

export type Analysis = {
  summary?: string
  observations?: string
  strengths?: string
  improvements?: string
  confidence_note?: string
  comparison?: {
    current_speed_kmh?: number | null
    previous_avg_speed_kmh?: number | null
    delta_kmh?: number | null
    previous_count?: number
  }
}

export type Artifacts = {
  release_still_url?: string
  overlay_video_url?: string
  pdf_url?: string
  original_video_url?: string
  cloudinary_video_url?: string | null
  cloudinary_pdf_url?: string | null
}

export type Delivery = {
  id: string
  player_name?: string
  player_profile?: PlayerProfile
  created_at?: string
  metrics?: Metrics
  analysis?: Analysis
  analysis_summary?: string
  artifacts?: Artifacts
}

export async function assetUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = await getApiBase()
  return `${base}${path}`
}

function mimeFromName(name: string) {
  const n = name.toLowerCase()
  if (n.endsWith('.mov')) return 'video/quicktime'
  if (n.endsWith('.webm')) return 'video/webm'
  if (n.endsWith('.avi')) return 'video/x-msvideo'
  if (n.endsWith('.mkv')) return 'video/x-matroska'
  return 'video/mp4'
}

export type PickedVideo = {
  uri: string
  name: string
  mimeType?: string | null
}

export async function uploadVideo(input: {
  video: PickedVideo
  playerName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  heightFt: number
  heightIn: number
  weightLbs: number
  bowlingArm: 'left' | 'right'
  bowlingStyle: 'pace' | 'spin' | 'medium'
  metersPerPixel?: number
}) {
  const form = new FormData()
  const name = input.video.name || 'delivery.mp4'
  form.append('file', {
    uri: input.video.uri,
    name,
    type: input.video.mimeType || mimeFromName(name),
  } as unknown as Blob)
  form.append('player_name', input.playerName)
  form.append('first_name', input.firstName)
  form.append('last_name', input.lastName)
  form.append('date_of_birth', input.dateOfBirth)
  form.append('height_ft', String(input.heightFt))
  form.append('height_in', String(input.heightIn))
  form.append('weight_lbs', String(input.weightLbs))
  form.append('bowling_arm', input.bowlingArm)
  form.append('bowling_style', input.bowlingStyle)
  if (input.metersPerPixel != null && !Number.isNaN(input.metersPerPixel)) {
    form.append('meters_per_pixel', String(input.metersPerPixel))
  }
  return request<{ video_id: string; job_id: string; status: string }>('/videos', {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  })
}

export function getJob(jobId: string) {
  return request<Job>(`/jobs/${jobId}`)
}

export function listDeliveries() {
  return request<{ items: Delivery[] }>('/deliveries')
}

export function getDelivery(id: string) {
  return request<Delivery>(`/deliveries/${id}`)
}

export function getHealth() {
  return publicFetch<{ ok: boolean; name?: string }>('/health')
}

export function listDrills(tag?: string) {
  const q = tag ? `?tag=${encodeURIComponent(tag)}` : ''
  return request<{ items: DrillCatalogItem[]; tags: string[] }>(`/coaching/drills${q}`)
}

export function listLeaderboard() {
  return request<{ items: LeaderboardRow[] }>('/leaderboard')
}

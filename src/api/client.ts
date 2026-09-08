import { getApiBase } from './config'
import { authFetch, ensureAccessToken, publicFetch } from './http'
import { nativeMultipartUpload } from './nativeUpload'

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return authFetch<T>(path, init)
}

export type StageDetail = {
  current: number
  total: number
  unit?: string
}

export type Job = {
  id: string
  kind?: 'action' | 'ballflight'
  video_id?: string
  session_id?: string
  status: 'queued' | 'claimed' | 'processing' | 'analyzing' | 'completed' | 'failed' | 'cancelled' | string
  progress: number
  stage?: string
  message?: string
  delivery_id?: string
  error?: string
  eta_seconds?: number | null
  expected_start_at?: string | null
  scheduled_date?: string | null
  stage_detail?: StageDetail | null
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

export type DeliveryType = {
  value?: string | null
  basis?: string | null
  speed_kmh?: number | null
  profile_style?: string | null
  band_edge_caveat?: boolean
  note?: string | null
  status?: string
}

export type ActionLegality = {
  verdict?: string | null
  assessable?: boolean
  limit_deg?: number
  extension_deg?: number | null
  elbow_at_arm_horizontal_deg?: number | null
  elbow_at_release_deg?: number | null
  note?: string | null
  status?: string
}

export type SpeedConsistency = {
  ok?: boolean | null
  ratio?: number | null
  note?: string | null
}

export type Timebase = {
  fps?: number | null
  container_fps?: number | null
  measured_fps?: number | null
  slow_motion?: boolean
  slow_factor?: number | null
  source?: string | null
  note?: string | null
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
  delivery_type?: DeliveryType
  action_legality?: ActionLegality
  speed_consistency?: SpeedConsistency
  timebase?: Timebase
  scores?: Scores
  quality?: {
    pose_frames?: number
    calibrated?: boolean
    tracking_ok?: boolean
    camera_view?: string
    camera_view_note?: string
    speed_view_ok?: boolean
    speed_view_from_ball?: boolean
    capture_fps?: number
    slow_motion?: boolean
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

export type DrillRecommendation = {
  drill_id: string
  youtube_id: string
  title: string
  tags?: string[]
  reason?: string
  priority?: number
  source?: string
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
  recommendations?: DrillRecommendation[]
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
  if (path.startsWith('http')) return cloudinaryPlaybackUrl(path)
  const base = await getApiBase()
  return `${base}${path}`
}

/** H.264 MP4 of an incoming Cloudinary clip so phones can play HEVC .mov. */
export function cloudinaryPlaybackUrl(url: string): string {
  if (!url.startsWith('http')) return url
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  const host = parsed.hostname.toLowerCase()
  if (host !== 'res.cloudinary.com' && !host.endsWith('.cloudinary.com')) return url
  const marker = '/video/upload/'
  const idx = parsed.pathname.indexOf(marker)
  if (idx < 0) return url
  const rest = parsed.pathname.slice(idx + marker.length)
  const first = rest.split('/')[0] || ''
  if (first.includes('f_mp4') || first.includes('vc_h264')) return url
  let path = `${parsed.pathname.slice(0, idx + marker.length)}f_mp4,vc_h264/${rest}`
  if (path.toLowerCase().endsWith('.mov')) path = `${path.slice(0, -4)}.mp4`
  parsed.pathname = path
  return parsed.toString()
}

export type PickedVideo = {
  uri: string
  name: string
  mimeType?: string | null
}

type CloudinaryUploadParams = {
  configured: boolean
  cloud_name?: string
  api_key?: string
  timestamp?: number
  signature?: string
  folder?: string
  eager?: string
  eager_async?: string
}

function mimeFromName(name: string) {
  const n = name.toLowerCase()
  if (n.endsWith('.mov')) return 'video/quicktime'
  if (n.endsWith('.webm')) return 'video/webm'
  if (n.endsWith('.avi')) return 'video/x-msvideo'
  if (n.endsWith('.mkv')) return 'video/x-matroska'
  return 'video/mp4'
}

function videoMime(video: PickedVideo) {
  return video.mimeType || mimeFromName(video.name || 'delivery.mp4')
}

async function labMultipart<T>(
  path: string,
  video: PickedVideo,
  parameters: Record<string, string>,
): Promise<T> {
  const base = await getApiBase()
  const token = await ensureAccessToken()
  const body = await nativeMultipartUpload({
    url: `${base}${path}`,
    fileUri: video.uri,
    fieldName: 'file',
    mimeType: videoMime(video),
    parameters,
    headers: {
      Accept: 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  })
  return JSON.parse(body) as T
}

function formFields(fields: Record<string, string>) {
  return new URLSearchParams(fields).toString()
}

export type ClipUploadProgress = {
  phase: 'cloudinary' | 'handoff'
  loaded: number
  total: number
}

/**
 * Send the clip to Cloudinary (same as the web workspace). The website API
 * then queues a job; criclab-video-service claims it. Null = local lab
 * without Cloudinary — fall back to multipart through FastAPI.
 */
export async function cloudinaryClipUrl(
  video: PickedVideo,
  onProgress?: (p: ClipUploadProgress) => void,
): Promise<string | null> {
  let params: CloudinaryUploadParams
  try {
    params = await request<CloudinaryUploadParams>('/videos/upload-params')
  } catch {
    return null
  }
  if (
    !params.configured ||
    !params.cloud_name ||
    !params.api_key ||
    !params.signature ||
    params.timestamp == null
  ) {
    return null
  }
  onProgress?.({ phase: 'cloudinary', loaded: 0, total: 1 })
  try {
    const raw = await nativeMultipartUpload({
      url: `https://api.cloudinary.com/v1_1/${params.cloud_name}/video/upload`,
      fileUri: video.uri,
      fieldName: 'file',
      mimeType: videoMime(video),
      parameters: {
        api_key: params.api_key,
        timestamp: String(params.timestamp),
        signature: params.signature,
        folder: params.folder || 'criclab/incoming',
        ...(params.eager ? { eager: params.eager } : {}),
        ...(params.eager_async ? { eager_async: params.eager_async } : {}),
      },
    })
    const json = JSON.parse(raw) as { secure_url?: string }
    if (!json.secure_url) return null
    onProgress?.({ phase: 'cloudinary', loaded: 1, total: 1 })
    return json.secure_url
  } catch {
    return null
  }
}

export async function uploadVideo(
  input: {
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
  },
  onProgress?: (p: ClipUploadProgress) => void,
) {
  const name = input.video.name || 'delivery.mp4'
  const fields: Record<string, string> = {
    player_name: input.playerName,
    first_name: input.firstName,
    last_name: input.lastName,
    date_of_birth: input.dateOfBirth,
    height_ft: String(input.heightFt),
    height_in: String(input.heightIn),
    weight_lbs: String(input.weightLbs),
    bowling_arm: input.bowlingArm,
    bowling_style: input.bowlingStyle,
  }
  if (input.metersPerPixel != null && !Number.isNaN(input.metersPerPixel)) {
    fields.meters_per_pixel = String(input.metersPerPixel)
  }
  const remote = await cloudinaryClipUrl(input.video, onProgress)
  onProgress?.({ phase: 'handoff', loaded: 1, total: 1 })
  if (remote) {
    return request<{ video_id: string; job_id: string; status: string }>('/videos', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: formFields({ ...fields, source_url: remote, original_name: name }),
    })
  }
  return labMultipart<{ video_id: string; job_id: string; status: string }>('/videos', input.video, {
    ...fields,
    original_name: name,
  })
}

export function getJob(jobId: string) {
  return request<Job>(`/jobs/${jobId}`)
}

export function cancelJob(jobId: string) {
  return request<{ id: string; status: string }>(`/jobs/${jobId}/cancel`, { method: 'POST' })
}

export function listActiveJobs() {
  return request<{ items: Job[] }>('/jobs/active')
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

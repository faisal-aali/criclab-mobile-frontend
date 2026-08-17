export type Box = { x: number; y: number; w: number; h: number }

export type Calibration = {
  bowler: Box
  batter: Box
  pitch_length_m?: number
}

export type Metric = {
  value: number | null
  unit: string
  confidence: number
  status?: string
  estimated?: boolean
  note?: string | null
}

export type BallTrackJob = {
  id: string
  session_id?: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | string
  progress: number
  stage?: string
  message?: string
  error?: string
}

export type BallTrackDelivery = {
  id: string
  session_id?: string
  index: number
  created_at?: string
  metrics?: {
    speed_kmh?: Metric
    line_m?: Metric
    length_m?: Metric
  }
  bounce?: { length_m?: number | null; width_m?: number | null; frame?: number }
  artifacts?: {
    clip_url?: string
    cloudinary_clip_url?: string
  }
}

export type BallTrackSession = {
  id: string
  title?: string
  status?: string
  created_at?: string
  delivery_count?: number
  error?: string
  artifacts?: {
    overlay_url?: string
    pitch_map_url?: string
    cloudinary_overlay_url?: string
    cloudinary_pitch_map_url?: string
  }
  deliveries?: BallTrackDelivery[]
}

export const BOWLER_BOX: Box = { x: 0.3, y: 0.68, w: 0.4, h: 0.18 }
export const BATTER_BOX: Box = { x: 0.34, y: 0.08, w: 0.32, h: 0.16 }

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

/** Near (non-striker) stumps — large, low in the frame. */
export const BOWLER_BOX: Box = { x: 0.26, y: 0.70, w: 0.48, h: 0.18 }
/** Far (striker) stumps — a bit larger so they are easier to fit in frame. */
export const BATTER_BOX: Box = { x: 0.36, y: 0.07, w: 0.28, h: 0.16 }

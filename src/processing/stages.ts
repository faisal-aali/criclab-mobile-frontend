import type { StageDetail } from '../api/client'

export type PipelineStage = { key: string; label: string }

/** Same order and copy as the web workspace processing page. */
export const ACTION_STAGES: PipelineStage[] = [
  { key: 'queued', label: 'In the queue' },
  { key: 'ingest', label: 'Fetching your clip' },
  { key: 'extract', label: 'Reading your clip' },
  { key: 'pose', label: 'Mapping the bowler' },
  { key: 'action', label: 'Finding the release' },
  { key: 'ball', label: 'Following the ball' },
  { key: 'metrics', label: 'Measuring the delivery' },
  { key: 'render', label: 'Marking up the slow-motion clip' },
  { key: 'upload', label: 'Saving your clip' },
  { key: 'agent', label: 'Writing your coaching notes' },
  { key: 'pdf', label: 'Building your report' },
]

export const BALL_FLIGHT_STAGES: PipelineStage[] = [
  { key: 'queued', label: 'In the queue' },
  { key: 'ingest', label: 'Fetching your clip' },
  { key: 'calibrate', label: 'Measuring the pitch' },
  { key: 'detect', label: 'Finding the ball' },
  { key: 'track', label: 'Following each delivery' },
  { key: 'metrics', label: 'Measuring speed, line and length' },
  { key: 'render', label: 'Drawing the path onto your clip' },
  { key: 'agent', label: 'Matching drills to what we saw' },
]

export const ACTION_TIPS = [
  {
    tag: 'Filming tip',
    body: 'Film side-on to the bowler, whole body in frame, from four or five metres back.',
  },
  {
    tag: 'Filming tip',
    body: 'Rest the phone on something solid. A steady frame reads far better than a handheld one.',
  },
  {
    tag: 'Filming tip',
    body: 'One delivery per clip. Leave a second of run-up before it and the follow-through after.',
  },
  {
    tag: 'Did you know',
    body: 'Release height and stride are reported against the bowler’s own height — which is why we ask for it.',
  },
  {
    tag: 'Did you know',
    body: 'A higher frame rate catches the moment of release more precisely, so the timings come back tighter.',
  },
  {
    tag: 'Filming tip',
    body: 'Bright, even light gives the cleanest read. Filming into the sun rarely does.',
  },
  {
    tag: 'Did you know',
    body: 'Every number arrives with a confidence. If the clip cannot support a reading, you will be told instead of shown a guess.',
  },
]

export function formatEta(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  if (seconds < 45) return 'Less than a minute'
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes === 1) return '~1 minute'
  return `~${minutes} minutes`
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function formatStageDetail(detail?: StageDetail | null) {
  if (!detail || !(detail.total > 0)) return null
  const total = Math.max(1, Math.floor(Number(detail.total)))
  const current = Math.max(0, Math.min(Math.floor(Number(detail.current) || 0), total))
  const { unit } = detail
  if (unit === 'bytes') return `${formatBytes(current)} of ${formatBytes(total)}`
  if (unit === 'frames') return `Frame ${current} of ${total}`
  if (unit === 'paths') return `Path ${current} of ${total}`
  return `${current} of ${total}`
}

export function stageFraction(detail?: StageDetail | null) {
  if (!detail || !(detail.total > 0)) return null
  const total = Math.max(1, Number(detail.total))
  const current = Math.max(0, Math.min(Number(detail.current) || 0, total))
  return current / total
}

export function resolveStageIndex(stages: PipelineStage[], stage: string | undefined, doneKey: string) {
  const key = stage === 'done' ? doneKey : stage === 'claimed' ? 'queued' : stage || 'queued'
  const idx = stages.findIndex((s) => s.key === key)
  return Math.max(0, idx)
}

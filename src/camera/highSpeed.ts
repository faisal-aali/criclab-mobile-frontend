import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera'

export const TARGET_WIDTH = 1920
export const TARGET_HEIGHT = 1080
export const TARGET_FPS = 120

export function toFileUri(path: string): string {
  if (path.startsWith('file://')) return path
  return `file://${path}`
}

function landscapeSize(format: CameraDeviceFormat) {
  const w = Math.max(format.videoWidth, format.videoHeight)
  const h = Math.min(format.videoWidth, format.videoHeight)
  return { w, h }
}

function isApprox1080(format: CameraDeviceFormat) {
  const { w, h } = landscapeSize(format)
  return Math.abs(w - TARGET_WIDTH) <= 32 && Math.abs(h - TARGET_HEIGHT) <= 32
}

function canDoFps(format: CameraDeviceFormat, fps: number) {
  return format.minFps <= fps && format.maxFps >= fps
}

function pickFps(format: CameraDeviceFormat, target: number) {
  if (canDoFps(format, target)) return target
  if (canDoFps(format, 60)) return 60
  return Math.min(format.maxFps, target)
}

export function pickSlowMoFormat(device: CameraDevice | undefined): {
  format: CameraDeviceFormat | undefined
  fps: number
} {
  const formats = device?.formats ?? []
  if (!formats.length) return { format: undefined, fps: 30 }

  const exact = formats.find((format) => isApprox1080(format) && canDoFps(format, TARGET_FPS))
  if (exact) return { format: exact, fps: TARGET_FPS }

  const at120 = formats
    .filter((format) => canDoFps(format, TARGET_FPS))
    .sort((a, b) => {
      const da = Math.abs(landscapeSize(a).w - TARGET_WIDTH) + Math.abs(landscapeSize(a).h - TARGET_HEIGHT)
      const db = Math.abs(landscapeSize(b).w - TARGET_WIDTH) + Math.abs(landscapeSize(b).h - TARGET_HEIGHT)
      return da - db
    })[0]
  if (at120) return { format: at120, fps: TARGET_FPS }

  const near1080 = [...formats.filter(isApprox1080)].sort((a, b) => b.maxFps - a.maxFps)[0]
  if (near1080) return { format: near1080, fps: pickFps(near1080, TARGET_FPS) }

  const closest = [...formats].sort((a, b) => {
    const da = Math.abs(landscapeSize(a).w - TARGET_WIDTH) + Math.abs(landscapeSize(a).h - TARGET_HEIGHT)
    const db = Math.abs(landscapeSize(b).w - TARGET_WIDTH) + Math.abs(landscapeSize(b).h - TARGET_HEIGHT)
    if (da !== db) return da - db
    return b.maxFps - a.maxFps
  })[0]
  return { format: closest, fps: pickFps(closest, TARGET_FPS) }
}

export function pickPhotoFormat(device: CameraDevice | undefined): {
  format: CameraDeviceFormat | undefined
  fps: number
} {
  const formats = device?.formats ?? []
  if (!formats.length) return { format: undefined, fps: 30 }
  const near1080 = [...formats.filter(isApprox1080)].sort((a, b) => b.photoWidth * b.photoHeight - a.photoWidth * a.photoHeight)[0]
  if (near1080) return { format: near1080, fps: pickFps(near1080, 30) }
  return pickSlowMoFormat(device)
}

export function formatLabel(format: CameraDeviceFormat | undefined, fps: number) {
  if (!format) return '1080p · 120 fps'
  const { h } = landscapeSize(format)
  const res = h >= 1000 ? '1080p' : h >= 700 ? '720p' : `${h}p`
  return `${res} · ${fps} fps`
}

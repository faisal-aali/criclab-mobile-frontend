import { forwardRef } from 'react'
import { ExpoSlowMoCamera } from './ExpoSlowMoCamera'
import { hasHighSpeedCameraNative } from './native'
import type { SlowMoCameraHandle, SlowMoCameraProps } from './types'

export type { SlowMoCameraHandle, SlowMoCameraProps } from './types'
export { hasHighSpeedCameraNative } from './native'

let VisionSlowMoCamera: typeof import('./VisionSlowMoCamera').VisionSlowMoCamera | null = null

function visionCamera() {
  if (!hasHighSpeedCameraNative()) return null
  if (!VisionSlowMoCamera) {
    // Native module is missing in Expo Go — only load Vision Camera in a dev build.
    VisionSlowMoCamera = require('./VisionSlowMoCamera').VisionSlowMoCamera
  }
  return VisionSlowMoCamera
}

export const SlowMoCamera = forwardRef<SlowMoCameraHandle, SlowMoCameraProps>(function SlowMoCamera(props, ref) {
  const NativeCamera = visionCamera()
  if (NativeCamera) return <NativeCamera ref={ref} {...props} />
  return <ExpoSlowMoCamera ref={ref} {...props} />
})

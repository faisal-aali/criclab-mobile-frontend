import { CameraView } from 'expo-camera'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import type { SlowMoCameraHandle, SlowMoCameraProps } from './types'

export const ExpoSlowMoCamera = forwardRef<SlowMoCameraHandle, SlowMoCameraProps>(function ExpoSlowMoCamera(
  { isActive, mode, onFormat, style },
  ref,
) {
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    onFormat?.('1080p')
  }, [onFormat])

  useImperativeHandle(ref, () => ({
    record: async (opts) => {
      const clip = await cameraRef.current?.recordAsync({
        maxDuration: opts?.maxDuration,
      })
      if (!clip?.uri) return undefined
      return { uri: clip.uri }
    },
    stop: () => {
      cameraRef.current?.stopRecording()
    },
    takePicture: async () => {
      const shot = await cameraRef.current?.takePictureAsync({ quality: 0.7, shutterSound: false })
      if (!shot?.uri) return undefined
      return { uri: shot.uri }
    },
  }))

  return (
    <CameraView
      ref={cameraRef}
      style={style ?? StyleSheet.absoluteFill}
      facing="back"
      mode={mode}
      mute
      active={isActive}
      videoQuality="1080p"
      pointerEvents="none"
    />
  )
})

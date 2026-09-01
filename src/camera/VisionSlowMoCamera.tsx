import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Camera, useCameraDevice } from 'react-native-vision-camera'
import { formatLabel, pickPhotoFormat, pickSlowMoFormat, toFileUri } from './highSpeed'
import type { RecordedClip, SlowMoCameraHandle, SlowMoCameraProps } from './types'

/** Capture only — no frame processors, no on-device pose. */

export const VisionSlowMoCamera = forwardRef<SlowMoCameraHandle, SlowMoCameraProps>(function VisionSlowMoCamera(
  { isActive, mode, enableVideo, onFormat, style },
  ref,
) {
  const cameraRef = useRef<Camera>(null)
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wide = useCameraDevice('back', { physicalDevices: ['wide-angle-camera'] })
  const back = useCameraDevice('back')
  const device = wide ?? back
  const slowMo = useMemo(() => pickSlowMoFormat(device), [device])
  const photo = useMemo(() => pickPhotoFormat(device), [device])
  const videoMode = mode === 'video' || Boolean(enableVideo)
  const selected = videoMode ? slowMo : photo
  const label = formatLabel(selected.format, selected.fps)

  useEffect(() => {
    onFormat?.(label)
  }, [label, onFormat])

  useEffect(() => {
    return () => {
      if (maxTimer.current) clearTimeout(maxTimer.current)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    record: ({ maxDuration } = {}) =>
      new Promise<RecordedClip | undefined>((resolve, reject) => {
        try {
          cameraRef.current?.startRecording({
            fileType: 'mp4',
            videoCodec: 'h264',
            onRecordingFinished: (video) => {
              if (maxTimer.current) clearTimeout(maxTimer.current)
              resolve({ uri: toFileUri(video.path) })
            },
            onRecordingError: (error) => {
              if (maxTimer.current) clearTimeout(maxTimer.current)
              if (error.code === 'capture/recording-canceled') {
                resolve(undefined)
                return
              }
              reject(error)
            },
          })
          if (maxDuration && maxDuration > 0) {
            maxTimer.current = setTimeout(() => {
              void cameraRef.current?.stopRecording()
            }, maxDuration * 1000)
          }
        } catch (err) {
          reject(err)
        }
      }),
    stop: () => {
      void cameraRef.current?.stopRecording()
    },
    takePicture: async () => {
      const shot = await cameraRef.current?.takePhoto({ flash: 'off', enableShutterSound: false })
      if (!shot?.path) return undefined
      return { uri: toFileUri(shot.path) }
    },
  }))

  if (device == null) return null

  return (
    <Camera
      ref={cameraRef}
      style={style ?? StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      format={selected.format}
      fps={selected.format ? selected.fps : undefined}
      photo={mode === 'picture'}
      video={videoMode}
      audio={false}
      videoHdr={false}
      photoHdr={false}
      videoStabilizationMode={selected.format?.videoStabilizationModes.includes('off') ? 'off' : undefined}
      pointerEvents="none"
    />
  )
})

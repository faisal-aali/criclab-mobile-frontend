import type { StyleProp, ViewStyle } from 'react-native'

export type RecordedClip = { uri: string }

export type SlowMoCameraMode = 'picture' | 'video'

export type SlowMoCameraHandle = {
  record: (opts?: { maxDuration?: number }) => Promise<RecordedClip | undefined>
  stop: () => void
  takePicture: () => Promise<RecordedClip | undefined>
}

export type SlowMoCameraProps = {
  isActive: boolean
  mode: SlowMoCameraMode
  enablePhoto?: boolean
  enableVideo?: boolean
  onFormat?: (label: string) => void
  style?: StyleProp<ViewStyle>
}

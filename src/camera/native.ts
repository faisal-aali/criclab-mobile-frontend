import { NativeModules, Platform } from 'react-native'

export function hasHighSpeedCameraNative(): boolean {
  if (Platform.OS === 'web') return false
  return NativeModules.CameraView != null
}

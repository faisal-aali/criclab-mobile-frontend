import { useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'

/** Screen focus without importing `@react-navigation/native` (blocked in Expo Router SDK 56+). */
export function useIsFocused() {
  const navigation = useNavigation()
  const [focused, setFocused] = useState(() => navigation.isFocused())

  useEffect(() => {
    setFocused(navigation.isFocused())
    const onFocus = navigation.addListener('focus', () => setFocused(true))
    const onBlur = navigation.addListener('blur', () => setFocused(false))
    return () => {
      onFocus()
      onBlur()
    }
  }, [navigation])

  return focused
}

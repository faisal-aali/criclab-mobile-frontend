import { useNavigation, useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { BackHandler } from 'react-native'

/** Hardware back: pop if possible, otherwise return to the lab tabs. */
export function useFallbackBack() {
  const router = useRouter()
  const navigation = useNavigation()

  const go = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.replace('/')
  }, [navigation, router])

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        go()
        return true
      })
      return () => sub.remove()
    }, [go]),
  )

  return go
}

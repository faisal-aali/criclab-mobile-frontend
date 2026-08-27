import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation, useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { colors } from '../theme'

export function StackBackButton() {
  const router = useRouter()
  const navigation = useNavigation()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={16}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
          return
        }
        if (router.canGoBack()) {
          router.back()
          return
        }
        router.replace('/')
      }}
      style={{
        width: 40,
        height: 40,
        marginLeft: -6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="chevron-back" size={28} color={colors.chalk} />
    </Pressable>
  )
}

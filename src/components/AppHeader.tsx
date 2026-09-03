import Ionicons from '@expo/vector-icons/Ionicons'
import { DrawerActions } from '@react-navigation/native'
import { useNavigation } from 'expo-router'
import { Pressable, View } from 'react-native'
import { colors } from '../theme'
import { Logo } from './Logo'
import { ProcessingIndicator } from './ProcessingIndicator'

export function AppHeader() {
  const navigation = useNavigation()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Logo />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <ProcessingIndicator />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="menu" size={22} color={colors.chalk} />
        </Pressable>
      </View>
    </View>
  )
}

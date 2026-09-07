import { Drawer } from 'expo-router/drawer'
import { View, useWindowDimensions } from 'react-native'
import { DrawerContent } from '../../src/components/DrawerContent'
import { HeaderChrome } from '../../src/components/HeaderChrome'
import { colors } from '../../src/theme'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function DrawerLayout() {
  const { width } = useWindowDimensions()
  const drawerWidth = Math.min(320, Math.round(width * 0.86))
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerTintColor: colors.chalk,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.night },
        headerTitleAlign: 'center',
        headerRight: () => (
          <View style={{ marginRight: 10 }}>
            <HeaderChrome />
          </View>
        ),
        drawerType: 'front',
        drawerStyle: { backgroundColor: colors.charcoal, width: drawerWidth },
        drawerHideStatusBarOnOpen: false,
        overlayColor: 'rgba(0,0,0,0.55)',
        sceneStyle: { backgroundColor: colors.night },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false, drawerLabel: 'Lab', title: 'CricLab' }} />
      <Drawer.Screen name="leaderboard" options={{ title: 'Leaderboard', drawerLabel: 'Leaderboard' }} />
      <Drawer.Screen name="tickets" options={{ title: 'Tickets', drawerLabel: 'Tickets' }} />
      <Drawer.Screen name="notifications" options={{ title: 'Notifications', drawerLabel: 'Notifications' }} />
      <Drawer.Screen name="coaching" options={{ title: 'Coaching', drawerLabel: 'Coaching' }} />
    </Drawer>
  )
}

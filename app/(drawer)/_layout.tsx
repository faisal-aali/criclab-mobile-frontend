import { Drawer } from 'expo-router/drawer'
import { DrawerContent } from '../../src/components/DrawerContent'
import { colors } from '../../src/theme'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerTintColor: colors.chalk,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.night },
        headerTitleAlign: 'center',
        drawerType: 'front',
        drawerStyle: { backgroundColor: colors.charcoal, width: 300 },
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

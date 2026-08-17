import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { colors } from '../../src/theme'

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '800', color: focused ? colors.pitch : colors.muted }}>
      {label}
    </Text>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pitch,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopColor: colors.line,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ focused }) => <TabIcon label={focused ? '●' : '○'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon label={focused ? '●' : '○'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon label={focused ? '●' : '○'} focused={focused} />,
        }}
      />
    </Tabs>
  )
}

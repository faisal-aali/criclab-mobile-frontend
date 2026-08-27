import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { colors } from '../../../src/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.charcoal,
          borderTopColor: colors.line,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Action',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'videocam' : 'videocam-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="balltrack"
        options={{
          title: 'Flight',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'locate' : 'locate-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'Train',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

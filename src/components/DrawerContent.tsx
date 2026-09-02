import Ionicons from '@expo/vector-icons/Ionicons'
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer'
import { type Href, usePathname, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notifications } from '../api/notifications'
import { support } from '../api/support'
import { useAuth } from '../auth/AuthProvider'
import { colors } from '../theme'
import { LogoMark } from './Logo'

type Item = {
  href: Href
  label: string
  hint: string
  icon: keyof typeof Ionicons.glyphMap
  match: (path: string) => boolean
}

const ITEMS: Item[] = [
  {
    href: '/',
    label: 'Lab',
    hint: 'Action, flight, history',
    icon: 'home-outline',
    match: (p) => p === '/' || p.startsWith('/balltrack') || p === '/history' || p === '/train' || p === '/profile',
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    hint: 'Top measured throws',
    icon: 'trophy-outline',
    match: (p) => p.startsWith('/leaderboard'),
  },
  {
    href: '/tickets',
    label: 'Tickets',
    hint: 'Ask support',
    icon: 'chatbubbles-outline',
    match: (p) => p.startsWith('/tickets'),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    hint: 'Replies and bookings',
    icon: 'notifications-outline',
    match: (p) => p.startsWith('/notifications'),
  },
  {
    href: '/coaching',
    label: 'Coaching',
    hint: 'Book a session',
    icon: 'calendar-outline',
    match: (p) => p.startsWith('/coaching'),
  },
]

export function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [unreadNotes, setUnreadNotes] = useState(0)
  const [unreadTickets, setUnreadTickets] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([
      notifications.unreadCount().catch(() => ({ unread: 0 })),
      support.list({ liveOnly: true }).catch(() => ({ unread: 0, items: [] })),
    ]).then(([notes, tickets]) => {
      if (!alive) return
      setUnreadNotes(notes.unread)
      setUnreadTickets(tickets.unread ?? 0)
    })
    return () => {
      alive = false
    }
  }, [pathname])

  const initials = (user?.name || user?.email || 'CL').slice(0, 2).toUpperCase()
  const insets = useSafeAreaInsets()

  return (
    <DrawerContentScrollView
      {...props}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
      style={{ backgroundColor: colors.charcoal }}
    >
      <View style={{ paddingHorizontal: 18, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogoMark size={36} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.chalk }}>CricLab</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: (user?.avatar_color as string) || colors.lime,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.onLime }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontWeight: '800', color: colors.chalk }}>
              {user?.name || 'Signed in'}
            </Text>
            <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 12, color: colors.muted }}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 10, paddingTop: 14, gap: 4 }}>
        {ITEMS.map((item) => {
          const active = item.match(pathname)
          const badge =
            item.href === '/notifications' ? unreadNotes : item.href === '/tickets' ? unreadTickets : 0
          return (
            <Pressable
              key={item.label}
              onPress={() => {
                router.push(item.href)
                props.navigation.closeDrawer()
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: active ? colors.limeLine : 'transparent',
                backgroundColor: active ? colors.limeSoft : 'transparent',
              }}
            >
              <Ionicons name={item.icon} size={22} color={active ? colors.lime : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: active ? colors.lime : colors.chalk }}>{item.label}</Text>
                <Text style={{ marginTop: 2, fontSize: 11, color: colors.muted }}>{item.hint}</Text>
              </View>
              {badge > 0 ? (
                <View
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    backgroundColor: colors.lime,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onLime }}>
                    {badge > 9 ? '9+' : badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )
        })}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Pressable
          onPress={() => {
            props.navigation.closeDrawer()
            router.push('/profile')
          }}
          style={{ paddingVertical: 12 }}
        >
          <Text style={{ fontWeight: '700', color: colors.chalk }}>Account & lab URL</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert('Sign out', 'End this session on this phone?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign out',
                style: 'destructive',
                onPress: () => {
                  props.navigation.closeDrawer()
                  void signOut()
                },
              },
            ])
          }
          style={{ paddingVertical: 8 }}
        >
          <Text style={{ fontWeight: '800', color: colors.ball }}>Sign out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  )
}

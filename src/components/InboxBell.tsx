import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { AppState, Pressable, Text, View } from 'react-native'
import { notifications } from '../api/notifications'
import { useAuth } from '../auth/AuthProvider'
import { colors } from '../theme'

const POLL_MS = 45_000

export function InboxBell() {
  const { status } = useAuth()
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  const poll = useCallback(async () => {
    if (status !== 'authenticated' || AppState.currentState !== 'active') return
    try {
      const { unread: n } = await notifications.unreadCount()
      setUnread(n)
    } catch {
      /* a dropped poll must not blank the header */
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') {
      setUnread(0)
      return
    }
    void poll()
    const id = setInterval(() => void poll(), POLL_MS)
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void poll()
    })
    return () => {
      clearInterval(id)
      sub.remove()
    }
  }, [status, poll])

  if (status !== 'authenticated') return null

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread ? `${unread} unread notifications` : 'Notifications'}
      onPress={() => router.push('/notifications')}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: unread ? colors.limeLine : colors.line,
        backgroundColor: unread ? colors.limeSoft : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={unread ? 'notifications' : 'notifications-outline'} size={20} color={unread ? colors.lime : colors.chalk} />
      {unread > 0 ? (
        <View
          style={{
            position: 'absolute',
            right: -5,
            top: -5,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            paddingHorizontal: 4,
            backgroundColor: colors.lime,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '800', color: colors.onLime }}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

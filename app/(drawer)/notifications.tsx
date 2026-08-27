import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { notifications, type Notification } from '../../src/api/notifications'
import { Screen } from '../../src/components/Screen'
import { openLabLink } from '../../src/nav/labLink'
import { timeAgo } from '../../src/nav/time'
import { EmptyState, ListShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

const KIND_LABEL: Record<string, string> = {
  account: 'Account',
  security: 'Security',
  support: 'Support',
  coaching: 'Coaching',
  analysis: 'Analysis',
  system: 'CricLab',
}

export default function NotificationsScreen() {
  const router = useRouter()
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await notifications.list({ limit: 40 })
      setItems(r.items)
      setUnread(r.unread)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  async function onOpen(n: Notification) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnread((u) => Math.max(0, u - 1))
      notifications.markRead(n.id).catch(() => undefined)
    }
    openLabLink(router, n.link)
  }

  async function onMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    setUnread(0)
    try {
      await notifications.markAllRead()
    } catch {
      void load()
    }
  }

  return (
    <Screen safeTop={false}>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>INBOX</Text>
      <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.chalk }}>Notifications</Text>
      <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 22 }}>
        Ticket replies, bookings, and account activity from the lab.
      </Text>
      {unread > 0 ? (
        <Pressable onPress={() => void onMarkAll()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.lime, fontWeight: '800' }}>Mark all read</Text>
        </Pressable>
      ) : null}
      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer rows={4} /> : null}
      {!loading && items.length === 0 && !error ? (
        <EmptyState title="Nothing yet" subtitle="Bookings, ticket replies and account activity will land here." />
      ) : null}
      <View style={{ marginTop: 16, gap: 10 }}>
        {items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => void onOpen(n)}
            style={{
              backgroundColor: n.read ? colors.card : 'rgba(182,242,74,0.08)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: n.read ? colors.line : colors.lime,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ fontWeight: n.read ? '600' : '800', color: colors.chalk, flex: 1 }}>{n.title}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{timeAgo(n.created_at)}</Text>
            </View>
            {n.body ? (
              <Text style={{ marginTop: 6, fontSize: 13, color: colors.muted, lineHeight: 18 }}>{n.body}</Text>
            ) : null}
            <Text style={{ marginTop: 8, fontSize: 11, fontWeight: '700', color: colors.lime }}>
              {KIND_LABEL[n.kind] || 'CricLab'}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { STATUS_LABEL, support, type Ticket, type TicketMessage } from '../../../src/api/support'
import { fieldInputStyle } from '../../../src/components/ChoiceRow'
import { Screen } from '../../../src/components/Screen'
import { EmptyState, ListShimmer } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TicketThreadScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!ticketId) return
    setLoading(true)
    try {
      const r = await support.read(ticketId)
      setTicket(r.ticket)
      setMessages(r.messages)
      setError(null)
    } catch (err) {
      setTicket(null)
      setError(err instanceof Error ? err.message : 'Could not load that ticket')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    void load()
  }, [load])

  async function onReply() {
    if (!ticketId || !reply.trim() || busy) return
    setBusy(true)
    try {
      const r = await support.reply(ticketId, reply.trim())
      setMessages((prev) => [...prev, r.message])
      setTicket(r.ticket)
      setReply('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not send')
    } finally {
      setBusy(false)
    }
  }

  async function onResolve() {
    if (!ticket) return
    try {
      const r = await support.setStatus(ticket.id, 'resolved')
      setTicket(r.ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that ticket')
    }
  }

  if (loading) {
    return (
      <Screen safeTop={false}>
        <ListShimmer rows={4} />
      </Screen>
    )
  }

  if (!ticket) {
    return (
      <Screen safeTop={false}>
        <EmptyState title="Ticket not found" subtitle={error || 'It may belong to another account.'} />
        <Pressable onPress={() => router.replace('/tickets')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.lime, fontWeight: '800' }}>All tickets</Text>
        </Pressable>
      </Screen>
    )
  }

  const closed = ticket.status === 'closed'

  return (
    <Screen safeTop={false}>
      <Pressable
        onPress={() => {
          if (router.canGoBack()) router.back()
          else router.replace('/tickets')
        }}
        hitSlop={8}
      >
        <Text style={{ color: colors.muted, fontWeight: '700' }}>← All tickets</Text>
      </Pressable>
      <Text style={{ marginTop: 12, fontSize: 24, fontWeight: '800', color: colors.chalk }}>{ticket.subject}</Text>
      <Text style={{ marginTop: 6, fontSize: 12, color: colors.muted }}>
        {STATUS_LABEL[ticket.status]} · opened {when(ticket.created_at)}
      </Text>
      {ticket.status === 'open' || ticket.status === 'awaiting_support' ? (
        <Pressable onPress={() => void onResolve()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.lime, fontWeight: '800' }}>Mark resolved</Text>
        </Pressable>
      ) : null}

      <View style={{ marginTop: 18, gap: 12 }}>
        {messages.map((m) => {
          const mine = m.author_role === 'user'
          return (
            <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <View
                style={{
                  maxWidth: '88%',
                  borderRadius: 16,
                  padding: 12,
                  backgroundColor: mine ? colors.card : 'rgba(182,242,74,0.1)',
                  borderWidth: 1,
                  borderColor: mine ? colors.line : 'rgba(182,242,74,0.25)',
                }}
              >
                <Text style={{ color: colors.chalk, lineHeight: 20 }}>{m.body}</Text>
              </View>
              <Text style={{ marginTop: 4, fontSize: 10, color: colors.muted }}>
                {mine ? 'You' : m.author_name || 'CricLab Support'} · {when(m.created_at)}
              </Text>
            </View>
          )
        })}
      </View>

      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}

      {closed ? (
        <Text style={{ marginTop: 18, color: colors.muted, lineHeight: 20 }}>
          This ticket is closed. Open a new one and mention the same problem if you need to continue.
        </Text>
      ) : (
        <View style={{ marginTop: 18 }}>
          {ticket.status === 'resolved' ? (
            <Text style={{ marginBottom: 8, fontSize: 12, color: colors.muted }}>Replying reopens this ticket.</Text>
          ) : null}
          <TextInput
            style={[fieldInputStyle, { minHeight: 96, textAlignVertical: 'top' }]}
            value={reply}
            onChangeText={setReply}
            multiline
            placeholder="Add to the thread…"
            placeholderTextColor={colors.muted}
          />
          <Pressable
            onPress={() => void onReply()}
            disabled={busy || !reply.trim()}
            style={{
              marginTop: 12,
              backgroundColor: colors.lime,
              opacity: busy || !reply.trim() ? 0.5 : 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.onLime, fontWeight: '800' }}>{busy ? 'Sending…' : 'Send reply'}</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  )
}

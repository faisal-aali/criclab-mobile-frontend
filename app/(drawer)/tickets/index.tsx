import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { STATUS_LABEL, support, type SupportMeta, type Ticket } from '../../../src/api/support'
import { ChoiceRow, FieldLabel, fieldInputStyle } from '../../../src/components/ChoiceRow'
import { Screen } from '../../../src/components/Screen'
import { timeAgo } from '../../../src/nav/time'
import { EmptyState, ListShimmer } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

const FALLBACK_META: SupportMeta = {
  categories: [
    { value: 'analysis', label: 'Analysis or metrics' },
    { value: 'technical', label: 'Something is broken' },
    { value: 'account', label: 'Account and sign-in' },
    { value: 'coaching', label: 'Coaching sessions' },
    { value: 'other', label: 'Something else' },
  ],
  priorities: [
    { value: 'low', label: 'Whenever' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Blocking my session' },
    { value: 'urgent', label: 'Urgent' },
  ],
}

export default function TicketsScreen() {
  const router = useRouter()
  const [items, setItems] = useState<Ticket[]>([])
  const [meta, setMeta] = useState<SupportMeta>(FALLBACK_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [showClosed, setShowClosed] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('analysis')
  const [priority, setPriority] = useState('normal')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await support.list({ liveOnly: !showClosed })
      setItems(r.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tickets')
    } finally {
      setLoading(false)
    }
  }, [showClosed])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  useEffect(() => {
    support.meta().then(setMeta).catch(() => setMeta(FALLBACK_META))
  }, [])

  async function onCreate() {
    if (subject.trim().length < 3 || body.trim().length < 10) return
    setBusy(true)
    try {
      const { ticket } = await support.create({
        subject: subject.trim(),
        body: body.trim(),
        category,
        priority,
      })
      setComposing(false)
      setSubject('')
      setBody('')
      setItems((prev) => [ticket, ...prev.filter((t) => t.id !== ticket.id)])
      router.push(`/tickets/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that ticket')
    } finally {
      setBusy(false)
    }
  }

  const ready = subject.trim().length >= 3 && body.trim().length >= 10

  return (
    <Screen safeTop={false} safeBottom>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>SUPPORT</Text>
      <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.chalk }}>Tickets</Text>
      <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 22 }}>
        Report a clip that came back wrong, or ask about a reading. Staff reply in this thread — same as the web workspace.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pressable
          onPress={() => setComposing((v) => !v)}
          style={{
            flex: 1,
            backgroundColor: colors.lime,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.onLime, fontWeight: '800' }}>{composing ? 'Cancel' : 'Open a ticket'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowClosed((v) => !v)}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.chalk, fontWeight: '800' }}>{showClosed ? 'Open only' : 'Show closed'}</Text>
        </Pressable>
      </View>

      {composing ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 16,
          }}
        >
          <FieldLabel>Subject</FieldLabel>
          <TextInput
            style={fieldInputStyle}
            value={subject}
            onChangeText={setSubject}
            placeholder="Ball not tracked on a night clip"
            placeholderTextColor={colors.muted}
          />
          <FieldLabel>What is it about</FieldLabel>
          <ChoiceRow
            value={category}
            onChange={setCategory}
            options={meta.categories.map((c) => ({ label: c.label, value: c.value }))}
          />
          <FieldLabel>How urgent</FieldLabel>
          <ChoiceRow
            value={priority}
            onChange={setPriority}
            options={meta.priorities.map((p) => ({ label: p.label, value: p.value }))}
          />
          <FieldLabel>What happened</FieldLabel>
          <TextInput
            style={[fieldInputStyle, { minHeight: 120, textAlignVertical: 'top' }]}
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="What you expected, what you saw instead, and the delivery reference if it is about one."
            placeholderTextColor={colors.muted}
          />
          <Pressable
            onPress={() => void onCreate()}
            disabled={busy || !ready}
            style={{
              marginTop: 16,
              backgroundColor: colors.lime,
              opacity: busy || !ready ? 0.5 : 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.onLime, fontWeight: '800' }}>{busy ? 'Sending…' : 'Send ticket'}</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer rows={3} /> : null}
      {!loading && items.length === 0 && !error ? (
        <EmptyState
          title={showClosed ? 'Nothing here yet' : 'No open tickets'}
          subtitle="If a reading looks wrong, tell us — a clip that came back empty is the most useful thing you can send."
        />
      ) : null}

      <View style={{ marginTop: 16, gap: 10 }}>
        {items.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => router.push(`/tickets/${t.id}`)}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: t.unread_for_user > 0 ? colors.lime : colors.line,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text numberOfLines={1} style={{ flex: 1, fontWeight: '800', color: colors.chalk }}>
                {t.unread_for_user > 0 ? '● ' : ''}
                {t.subject}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.lime }}>{STATUS_LABEL[t.status]}</Text>
            </View>
            <Text numberOfLines={2} style={{ marginTop: 6, fontSize: 13, color: colors.muted, lineHeight: 18 }}>
              {t.preview || 'No preview'}
            </Text>
            <Text style={{ marginTop: 8, fontSize: 11, color: colors.muted }}>
              {t.message_count} {t.message_count === 1 ? 'message' : 'messages'} · {timeAgo(t.updated_at)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

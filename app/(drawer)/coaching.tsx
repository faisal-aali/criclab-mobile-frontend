import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import {
  coaching,
  slotDay,
  slotTime,
  type Availability,
  type Booking,
  type Coach,
} from '../../src/api/coaching'
import { ChoiceRow, FieldLabel, fieldInputStyle } from '../../src/components/ChoiceRow'
import { Screen } from '../../src/components/Screen'
import { EmptyState, ListShimmer } from '../../src/shimmer'
import { colors } from '../../src/theme'

export default function CoachingScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [picked, setPicked] = useState<Coach | null>(null)
  const [sessionType, setSessionType] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slot, setSlot] = useState<string | null>(null)
  const [focus, setFocus] = useState('')
  const [busy, setBusy] = useState(false)
  const [moving, setMoving] = useState<Booking | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [b, c] = await Promise.all([coaching.bookings(), coaching.coaches()])
      setBookings(b.items)
      setCoaches(c.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load coaching')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  useEffect(() => {
    if (!picked) {
      setAvailability(null)
      setSlot(null)
      return
    }
    const type = sessionType || picked.session_types[0]?.id || ''
    if (!type) return
    setSlotsLoading(true)
    coaching
      .availability(picked.slug, type)
      .then(setAvailability)
      .catch(() => setAvailability(null))
      .finally(() => setSlotsLoading(false))
  }, [picked, sessionType])

  async function onBook() {
    if (!picked || !slot) return
    setBusy(true)
    try {
      if (moving) {
        await coaching.reschedule(moving.id, slot)
        setMoving(null)
        setPicked(null)
        setSlot(null)
        await load()
        Alert.alert('Moved', 'Your session is on the new slot.')
      } else {
        await coaching.book({
          coach: picked.slug,
          starts_at: slot,
          session_type: sessionType || picked.session_types[0]?.id,
          focus: focus.trim() || undefined,
        })
        setPicked(null)
        setSlot(null)
        setFocus('')
        await load()
        Alert.alert('Booked', 'The session is on your calendar.')
      }
    } catch (err) {
      Alert.alert(moving ? 'Could not move' : 'Could not book', err instanceof Error ? err.message : 'Try another slot.')
    } finally {
      setBusy(false)
    }
  }

  function startMove(booking: Booking) {
    const coach = coaches.find((c) => c.id === booking.coach.id || c.slug === booking.coach.slug)
    if (!coach) {
      Alert.alert('Could not move', 'That coach is not in the list right now.')
      return
    }
    setMoving(booking)
    setPicked(coach)
    setSessionType(booking.session_type)
    setSlot(null)
  }

  function onCancel(booking: Booking) {
    Alert.alert('Cancel this session?', `The slot with ${booking.coach.name} goes back on their calendar.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel session',
        style: 'destructive',
        onPress: async () => {
          try {
            await coaching.cancel(booking.id)
            await load()
          } catch (err) {
            Alert.alert('Could not cancel', err instanceof Error ? err.message : 'Try again.')
          }
        },
      },
    ])
  }

  return (
    <Screen safeTop={false} safeBottom>
      <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>SESSIONS</Text>
      <Text style={{ marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.chalk }}>Coaching</Text>
      <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 22 }}>
        Book a live session with a CricLab coach. Times are shown in the coach’s timezone.
      </Text>
      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer rows={3} /> : null}

      <Text style={{ marginTop: 22, fontSize: 18, fontWeight: '800', color: colors.chalk }}>Your bookings</Text>
      {!loading && bookings.length === 0 ? (
        <EmptyState title="No sessions booked" subtitle="Pick a coach below to take a slot." />
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {bookings.map((b) => (
            <View
              key={b.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '800', color: colors.chalk }}>{b.coach.name}</Text>
              <Text style={{ marginTop: 4, color: colors.muted }}>
                {slotDay(b.starts_at, b.timezone)} · {slotTime(b.starts_at, b.timezone)} · {b.minutes} min
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, color: colors.muted }}>
                {b.session_label}
                {b.focus ? ` · ${b.focus}` : ''} · {b.status}
              </Text>
                  {b.can_reschedule ? (
                    <Pressable onPress={() => startMove(b)} style={{ marginTop: 10 }}>
                      <Text style={{ color: colors.lime, fontWeight: '800' }}>Move session</Text>
                    </Pressable>
                  ) : null}
                  {b.can_cancel ? (
                <Pressable onPress={() => onCancel(b)} style={{ marginTop: 10 }}>
                  <Text style={{ color: colors.ball, fontWeight: '800' }}>Cancel session</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <Text style={{ marginTop: 28, fontSize: 18, fontWeight: '800', color: colors.chalk }}>Coaches</Text>
      <View style={{ marginTop: 12, gap: 10 }}>
        {coaches.map((c) => {
          const open = picked?.id === c.id
          return (
            <View
              key={c.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: open ? colors.lime : colors.line,
                padding: 14,
              }}
            >
              <Pressable
                onPress={() => {
                  if (open) {
                    setPicked(null)
                    setMoving(null)
                    return
                  }
                  setPicked(c)
                  setSessionType(c.session_types[0]?.id || '')
                  setSlot(null)
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: colors.lime,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: colors.onLime }}>{c.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: colors.chalk }}>{c.name}</Text>
                    <Text style={{ marginTop: 2, fontSize: 12, color: colors.muted }}>{c.title}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 8, fontSize: 13, color: colors.ink, lineHeight: 18 }}>{c.headline}</Text>
              </Pressable>

              {open ? (
                <View style={{ marginTop: 12 }}>
                  {c.session_types.length ? (
                    <>
                      <FieldLabel>Session type</FieldLabel>
                      <ChoiceRow
                        value={sessionType}
                        onChange={(v) => {
                          setSessionType(v)
                          setSlot(null)
                        }}
                        options={c.session_types.map((s) => ({ label: `${s.label} · ${s.minutes}m`, value: s.id }))}
                      />
                    </>
                  ) : null}
                  <FieldLabel>Focus (optional)</FieldLabel>
                  <TextInput
                    style={fieldInputStyle}
                    value={focus}
                    onChangeText={setFocus}
                    placeholder="Release, front-leg brace…"
                    placeholderTextColor={colors.muted}
                  />
                  <Text style={{ marginTop: 14, fontWeight: '700', color: colors.chalk }}>Open slots</Text>
                  {slotsLoading ? <ListShimmer rows={2} /> : null}
                  {!slotsLoading && (!availability || availability.days.every((d) => d.slots.length === 0)) ? (
                    <Text style={{ marginTop: 8, color: colors.muted }}>No slots in the next few weeks.</Text>
                  ) : null}
                  {availability?.days.map((day) =>
                    day.slots.length ? (
                      <View key={day.date} style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.muted }}>
                          {day.weekday} {day.date}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                          {day.slots.map((s) => {
                            const on = slot === s
                            return (
                              <Pressable
                                key={s}
                                onPress={() => setSlot(s)}
                                style={{
                                  borderRadius: 999,
                                  paddingHorizontal: 12,
                                  paddingVertical: 8,
                                  backgroundColor: on ? colors.lime : colors.charcoal,
                                  borderWidth: 1,
                                  borderColor: on ? colors.lime : colors.line,
                                }}
                              >
                                <Text style={{ fontWeight: '700', fontSize: 12, color: on ? colors.onLime : colors.chalk }}>
                                  {slotTime(s, availability.timezone)}
                                </Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      </View>
                    ) : null,
                  )}
                  <Pressable
                    onPress={() => void onBook()}
                    disabled={busy || !slot}
                    style={{
                      marginTop: 16,
                      backgroundColor: colors.lime,
                      opacity: busy || !slot ? 0.5 : 1,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.onLime, fontWeight: '800' }}>
                      {busy ? (moving ? 'Moving…' : 'Booking…') : moving ? 'Move to this slot' : 'Book this slot'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )
        })}
      </View>
    </Screen>
  )
}

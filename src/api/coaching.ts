import { authFetch, publicFetch } from './http'

export type SessionType = {
  id: string
  label: string
  minutes: number
  description: string
}

export type Coach = {
  id: string
  slug: string
  name: string
  title: string
  headline: string
  specialities: string[]
  languages: string[]
  accent: string
  initials: string
  timezone: string
  session_types: SessionType[]
  bio?: string
  cancel_window_hours?: number
}

export type AvailabilityDay = { date: string; weekday: string; slots: string[] }

export type Availability = {
  session: SessionType
  timezone: string
  days: AvailabilityDay[]
}

export type Booking = {
  id: string
  coach: { id: string; name: string; slug: string }
  session_type: string
  session_label: string
  minutes: number
  starts_at: string
  ends_at: string
  timezone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  focus: string
  notes: string
  can_cancel: boolean
  cancel_window_hours: number
}

export const coaching = {
  coaches: () => publicFetch<{ items: Coach[] }>('/coaching/coaches'),

  availability: (slug: string, sessionType?: string, days = 21) => {
    const q = new URLSearchParams({ days: String(days) })
    if (sessionType) q.set('session_type', sessionType)
    return publicFetch<Availability>(`/coaching/coaches/${slug}/availability?${q}`)
  },

  bookings: (upcoming?: boolean) => {
    const qs = upcoming === undefined ? '' : `?upcoming=${upcoming}`
    return authFetch<{ items: Booking[] }>(`/coaching/bookings${qs}`)
  },

  book: (payload: { coach: string; starts_at: string; session_type: string; focus?: string }) =>
    authFetch<{ booking: Booking }>('/coaching/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancel: (id: string, reason = '') =>
    authFetch<{ booking: Booking }>(`/coaching/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

export function slotTime(iso: string, timezone: string) {
  return new Date(iso).toLocaleString(undefined, { timeZone: timezone, hour: '2-digit', minute: '2-digit' })
}

export function slotDay(iso: string, timezone: string) {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

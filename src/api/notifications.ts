import { authFetch } from './http'

export type Notification = {
  id: string
  kind: 'account' | 'security' | 'support' | 'coaching' | 'analysis' | 'system' | string
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

export const notifications = {
  list: (opts: { limit?: number } = {}) => {
    const q = new URLSearchParams()
    if (opts.limit) q.set('limit', String(opts.limit))
    const qs = q.toString()
    return authFetch<{ items: Notification[]; unread: number }>(`/notifications${qs ? `?${qs}` : ''}`)
  },
  unreadCount: () => authFetch<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) => authFetch<{ unread: number }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => authFetch<{ marked: number; unread: number }>('/notifications/read-all', { method: 'POST' }),
}

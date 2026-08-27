import { authFetch } from './http'

export type TicketStatus = 'open' | 'awaiting_support' | 'awaiting_user' | 'resolved' | 'closed'

export type Ticket = {
  id: string
  subject: string
  category: string
  priority: string
  status: TicketStatus
  message_count: number
  unread_for_user: number
  created_at: string
  updated_at: string
  last_message_at: string
  resolved_at: string | null
  preview: string
}

export type TicketMessage = {
  id: string
  author_role: 'user' | 'support' | 'system'
  author_name: string
  body: string
  attachments: { id: string; name: string; content_type: string; size: number }[]
  created_at: string
}

export type SupportMeta = {
  categories: { value: string; label: string }[]
  priorities: { value: string; label: string }[]
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  awaiting_support: 'With support',
  awaiting_user: 'Needs your reply',
  resolved: 'Resolved',
  closed: 'Closed',
}

function form(fields: Record<string, string>) {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.append(key, value))
  return body
}

export const support = {
  meta: () => authFetch<SupportMeta>('/support/meta'),

  list: (opts: { liveOnly?: boolean } = {}) => {
    const q = new URLSearchParams()
    if (opts.liveOnly) q.set('live_only', 'true')
    const qs = q.toString()
    return authFetch<{ items: Ticket[]; unread: number }>(`/support/tickets${qs ? `?${qs}` : ''}`)
  },

  create: (fields: { subject: string; body: string; category: string; priority: string }) =>
    authFetch<{ ticket: Ticket }>('/support/tickets', {
      method: 'POST',
      body: form({
        subject: fields.subject,
        body: fields.body,
        category: fields.category,
        priority: fields.priority,
        context_page: 'mobile',
        context_ref: '',
      }),
    }),

  read: (id: string) => authFetch<{ ticket: Ticket; messages: TicketMessage[] }>(`/support/tickets/${id}`),

  reply: (id: string, body: string) =>
    authFetch<{ message: TicketMessage; ticket: Ticket }>(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: form({ body }),
    }),

  setStatus: (id: string, status: 'resolved' | 'awaiting_support') =>
    authFetch<{ ticket: Ticket }>(`/support/tickets/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
}

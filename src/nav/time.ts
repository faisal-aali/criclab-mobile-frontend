export function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(0, (Date.now() - then) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86_400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604_800) return `${Math.floor(secs / 86_400)}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

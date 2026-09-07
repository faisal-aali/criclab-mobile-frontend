import type { Href } from 'expo-router'

function firstSegment(path: string, prefix: string) {
  return path.slice(prefix.length).replace(/\/$/, '').split('/')[0] || ''
}

/** Map web workspace paths from notification `link` fields onto Expo routes. */
export function openLabLink(router: { push: (href: Href) => void }, link: string | null) {
  if (!link) return
  const path = link.replace(/^https?:\/\/[^/]+/, '').split('?')[0]

  if (path.startsWith('/app/support/')) {
    router.push(`/tickets/${firstSegment(path, '/app/support/')}` as Href)
    return
  }
  if (path === '/app/support') {
    router.push('/tickets')
    return
  }
  if (path === '/app/coaching') {
    router.push('/coaching')
    return
  }
  if (path === '/app/settings') {
    router.push('/profile')
    return
  }
  if (path === '/app/leaderboard') {
    router.push('/leaderboard')
    return
  }
  if (path === '/app/history') {
    router.push('/history')
    return
  }
  if (path === '/app/train') {
    router.push('/train')
    return
  }
  if (path.startsWith('/app/results/')) {
    router.push(`/results/${firstSegment(path, '/app/results/')}` as Href)
    return
  }
  if (path.startsWith('/app/processing/')) {
    router.push(`/processing/${firstSegment(path, '/app/processing/')}` as Href)
    return
  }
  if (path.startsWith('/app/ball-flight/processing/')) {
    router.push(`/balltrack/processing/${firstSegment(path, '/app/ball-flight/processing/')}` as Href)
    return
  }
  if (path.startsWith('/app/ball-flight/results/')) {
    router.push(`/balltrack/session/${firstSegment(path, '/app/ball-flight/results/')}` as Href)
    return
  }
  if (path.startsWith('/app/ball-flight')) {
    router.push('/balltrack')
    return
  }
  router.push('/')
}

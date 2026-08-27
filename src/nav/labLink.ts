import type { Href } from 'expo-router'

/** Map web workspace paths from notification `link` fields onto Expo routes. */
export function openLabLink(router: { push: (href: Href) => void }, link: string | null) {
  if (!link) return
  const path = link.replace(/^https?:\/\/[^/]+/, '')
  if (path.startsWith('/app/support/')) {
    router.push(`/tickets/${path.slice('/app/support/'.length)}` as Href)
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
    router.push(`/results/${path.slice('/app/results/'.length)}` as Href)
    return
  }
  if (path.startsWith('/app/ball-flight')) {
    router.push('/balltrack')
    return
  }
  router.push('/')
}

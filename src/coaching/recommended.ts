import { getDelivery, listDeliveries, type DrillRecommendation } from '../api/client'
import { listBalltrackSessions } from '../balltrack/api'

function catalogRecs(list?: DrillRecommendation[] | null): DrillRecommendation[] {
  const out: DrillRecommendation[] = []
  const seen = new Set<string>()
  for (const d of list || []) {
    const id = d.drill_id || d.youtube_id
    if (!id || !d.youtube_id || seen.has(id)) continue
    seen.add(id)
    out.push(d)
  }
  return out
}

function when(iso?: string) {
  const t = iso ? Date.parse(iso) : NaN
  return Number.isFinite(t) ? t : 0
}

export type RecommendedShelf = {
  items: DrillRecommendation[]
  source: 'action' | 'ballflight' | null
}

/**
 * Catalog drills attached to this person's latest lab report.
 * Never invents IDs — only hydrates what Action / Ball flight analysis already returned.
 */
export async function loadRecommendedDrills(): Promise<RecommendedShelf> {
  const [deliveries, sessions] = await Promise.all([
    listDeliveries().catch(() => ({ items: [] as { id: string; created_at?: string }[] })),
    listBalltrackSessions().catch(() => ({ items: [] })),
  ])

  type Cand = {
    at: number
    source: 'action' | 'ballflight'
    load: () => Promise<DrillRecommendation[]>
  }
  const cands: Cand[] = []

  for (const d of deliveries.items.slice(0, 3)) {
    cands.push({
      at: when(d.created_at),
      source: 'action',
      load: async () => catalogRecs((await getDelivery(d.id)).analysis?.recommendations),
    })
  }

  for (const s of sessions.items.slice(0, 3)) {
    const inline = catalogRecs(s.analysis?.recommendations)
    cands.push({
      at: when(s.created_at),
      source: 'ballflight',
      load: async () => inline,
    })
  }

  cands.sort((a, b) => b.at - a.at)
  for (const c of cands) {
    try {
      const items = await c.load()
      if (items.length) return { items, source: c.source }
    } catch {
      /* try the next report */
    }
  }
  return { items: [], source: null }
}

export function recommendedLead(source: RecommendedShelf['source']) {
  if (source === 'ballflight') {
    return 'From your latest Ball flight session. Every clip is in the CricLab catalog — none of it is invented.'
  }
  if (source === 'action') {
    return 'From your latest Action report. Every clip is in the CricLab catalog — none of it is invented.'
  }
  return 'Film an Action or Ball flight clip. This shelf only shows catalog drills from that report.'
}

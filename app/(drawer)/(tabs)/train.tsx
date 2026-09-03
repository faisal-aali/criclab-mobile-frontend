import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { listDrills, type DrillCatalogItem, type DrillRecommendation } from '../../../src/api/client'
import { AppHeader } from '../../../src/components/AppHeader'
import { DrillCard, DrillShelf, drillKey } from '../../../src/components/DrillShelf'
import { PageHero, Screen } from '../../../src/components/Screen'
import { loadRecommendedDrills, recommendedLead } from '../../../src/coaching/recommended'
import { EmptyState, ListShimmer } from '../../../src/shimmer'
import { colors } from '../../../src/theme'

function label(tag: string) {
  return tag.replace(/_/g, ' ')
}

export default function TrainScreen() {
  const [items, setItems] = useState<DrillCatalogItem[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [active, setActive] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recs, setRecs] = useState<DrillRecommendation[]>([])
  const [recSource, setRecSource] = useState<'action' | 'ballflight' | null>(null)
  const [recsLoading, setRecsLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let alive = true
      setLoading(true)
      setRecsLoading(true)
      setPlayingId(null)

      listDrills()
        .then((res) => {
          if (!alive) return
          setItems(res.items)
          setTags(res.tags)
          setError(null)
        })
        .catch((err) => {
          if (!alive) return
          setError(err instanceof Error ? err.message : 'Could not load drills')
        })
        .finally(() => {
          if (alive) setLoading(false)
        })

      loadRecommendedDrills()
        .then((r) => {
          if (!alive) return
          setRecs(r.items)
          setRecSource(r.source)
        })
        .catch(() => {
          if (!alive) return
          setRecs([])
          setRecSource(null)
        })
        .finally(() => {
          if (alive) setRecsLoading(false)
        })

      return () => {
        alive = false
        setPlayingId(null)
      }
    }, []),
  )

  const filtered = useMemo(() => {
    if (active === 'all') return items
    return items.filter((d) => d.tags.includes(active))
  }, [items, active])

  return (
    <Screen>
      <AppHeader />
      <PageHero
        kicker="COACHING"
        title="Train"
        lead="Catalog drills from the lab. Play them here — CricLab does not invent a plan or send you out to YouTube."
      />

      {recsLoading ? <ListShimmer rows={2} /> : null}
      {!recsLoading ? (
        <DrillShelf
          heading="Recommended"
          lead={recommendedLead(recSource)}
          drills={recs}
          playingId={playingId}
          onPlay={setPlayingId}
          eager
          empty={recommendedLead(null)}
        />
      ) : null}

      <Text style={{ marginTop: 24, fontSize: 18, fontWeight: '800', color: colors.chalk }}>Library</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {['all', ...tags].map((t) => {
          const on = active === t
          return (
            <Pressable
              key={t}
              onPress={() => setActive(t)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 7,
                backgroundColor: on ? colors.lime : colors.card,
                borderWidth: 1,
                borderColor: on ? colors.lime : colors.line,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: on ? colors.onLime : colors.chalk }}>
                {t === 'all' ? 'All' : label(t)}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {error ? <Text style={{ marginTop: 12, color: colors.ball }}>{error}</Text> : null}
      {loading ? <ListShimmer rows={3} /> : null}
      {!loading && filtered.length === 0 && !error ? (
        <EmptyState title="No drills" subtitle="The catalog is empty for this filter." />
      ) : null}

      <View style={{ marginTop: 16, gap: 12 }}>
        {filtered.map((d) => (
          <DrillCard
            key={d.id}
            drill={d}
            playing={playingId === drillKey(d)}
            onPlay={() => setPlayingId(drillKey(d))}
          />
        ))}
      </View>
    </Screen>
  )
}

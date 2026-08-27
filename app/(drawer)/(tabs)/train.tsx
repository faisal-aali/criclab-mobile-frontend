import * as WebBrowser from 'expo-web-browser'
import { useEffect, useMemo, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { listDrills, type DrillCatalogItem } from '../../../src/api/client'
import { AppHeader } from '../../../src/components/AppHeader'
import { Screen } from '../../../src/components/Screen'
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

  useEffect(() => {
    listDrills()
      .then((res) => {
        setItems(res.items)
        setTags(res.tags)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load drills'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (active === 'all') return items
    return items.filter((d) => d.tags.includes(active))
  }, [items, active])

  return (
    <Screen>
      <AppHeader />
      <Text style={{ marginTop: 18, fontSize: 12, fontWeight: '800', letterSpacing: 2, color: colors.lime }}>
        COACHING
      </Text>
      <Text style={{ marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.chalk }}>Train</Text>
      <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 22 }}>
        Drill library from the lab. Open a clip on YouTube — CricLab does not invent a plan from thin air.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
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
          <Pressable
            key={d.id}
            onPress={() =>
              WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${d.youtube_id}`)
            }
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.line,
              overflow: 'hidden',
            }}
          >
            {d.youtube_id ? (
              <Image
                source={{ uri: `https://img.youtube.com/vi/${d.youtube_id}/hqdefault.jpg` }}
                style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.night }}
              />
            ) : null}
            <View style={{ padding: 14 }}>
              <Text style={{ fontWeight: '800', color: colors.chalk }}>{d.title}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {d.tags.map((t) => (
                  <Text
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: colors.muted,
                    }}
                  >
                    {label(t)}
                  </Text>
                ))}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

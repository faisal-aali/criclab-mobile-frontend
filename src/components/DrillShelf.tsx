import { Text, View } from 'react-native'
import type { DrillCatalogItem, DrillRecommendation } from '../api/client'
import { colors, layout } from '../theme'
import { YoutubeEmbed } from './YoutubeEmbed'

export type DrillItem = DrillRecommendation | DrillCatalogItem

export function drillKey(item: DrillItem) {
  if ('drill_id' in item && item.drill_id) return item.drill_id
  if ('id' in item) return item.id
  return item.youtube_id
}

function label(tag: string) {
  return tag.replace(/_/g, ' ')
}

export function DrillCard({
  drill,
  playing,
  onPlay,
  eager,
}: {
  drill: DrillItem
  playing: boolean
  onPlay: () => void
  eager?: boolean
}) {
  const reason = 'reason' in drill ? drill.reason : undefined
  const tags = drill.tags || []
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: layout.radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: 'hidden',
      }}
    >
      <YoutubeEmbed
        youtubeId={drill.youtube_id}
        title={drill.title}
        active={playing}
        onActivate={onPlay}
        eager={eager}
      />
      <View style={{ padding: 14 }}>
        <Text style={{ fontWeight: '800', color: colors.chalk }}>{drill.title}</Text>
        {reason ? (
          <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.muted }}>{reason}</Text>
        ) : null}
        {tags.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {tags.map((t) => (
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
        ) : null}
      </View>
    </View>
  )
}

export function DrillShelf({
  drills,
  heading,
  lead,
  playingId,
  onPlay,
  eager,
  empty,
}: {
  drills?: DrillItem[] | null
  heading: string
  lead?: string
  playingId: string | null
  onPlay: (id: string) => void
  eager?: boolean
  empty?: string
}) {
  const items = (drills || []).filter((d) => d.youtube_id)
  if (!items.length) {
    return empty ? (
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.chalk }}>{heading}</Text>
        <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.muted }}>{empty}</Text>
      </View>
    ) : null
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.chalk }}>{heading}</Text>
      {lead ? (
        <Text style={{ marginTop: 6, fontSize: 13, lineHeight: 20, color: colors.muted }}>{lead}</Text>
      ) : null}
      <View style={{ marginTop: 12, gap: 12 }}>
        {items.map((d) => {
          const id = drillKey(d)
          return (
            <DrillCard
              key={id}
              drill={d}
              playing={playingId === id}
              onPlay={() => onPlay(id)}
              eager={eager}
            />
          )
        })}
      </View>
    </View>
  )
}

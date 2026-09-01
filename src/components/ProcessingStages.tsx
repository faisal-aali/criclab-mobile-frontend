import { ActivityIndicator, Text, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import type { StageDetail } from '../api/client'
import {
  formatEta,
  formatStageDetail,
  resolveStageIndex,
  stageFraction,
  type PipelineStage,
} from '../processing/stages'
import { colors } from '../theme'

const RING = 70
const CIRC = 2 * Math.PI * RING

export function ProcessingStages({
  stages,
  progress,
  stage,
  doneKey,
  status,
  message,
  etaSeconds,
  stageDetail,
  failed,
}: {
  stages: PipelineStage[]
  progress?: number
  stage?: string
  doneKey: string
  status?: string
  message?: string | null
  etaSeconds?: number | null
  stageDetail?: StageDetail | null
  failed?: boolean
}) {
  const pct = Math.max(0, Math.min(100, progress ?? 0))
  const currentIdx = resolveStageIndex(stages, stage, doneKey)
  const etaLabel = failed ? null : formatEta(etaSeconds)
  const dashOffset = CIRC * (1 - pct / 100)

  return (
    <View>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <View style={{ width: 168, height: 168 }}>
          <Svg width={168} height={168} viewBox="0 0 168 168">
            <Defs>
              <LinearGradient id="progressArc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors.lime} />
                <Stop offset="60%" stopColor={colors.limeDeep} />
                <Stop offset="100%" stopColor={colors.seam} />
              </LinearGradient>
            </Defs>
            <Circle cx={84} cy={84} r={RING} fill="none" stroke={colors.line} strokeWidth={10} />
            <Circle
              cx={84}
              cy={84}
              r={RING}
              fill="none"
              stroke={failed ? colors.ball : 'url(#progressArc)'}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 84 84)"
            />
          </Svg>
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: colors.chalk, lineHeight: 40 }}>
              {Math.round(pct)}
              <Text style={{ fontSize: 16 }}>%</Text>
            </Text>
            <Text style={{ marginTop: 2, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: colors.muted }}>
              COMPLETE
            </Text>
            {etaLabel ? (
              <Text style={{ marginTop: 6, fontSize: 11, fontWeight: '600', color: colors.muted }}>{etaLabel} left</Text>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={{ marginTop: 16, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: colors.muted }}>
        RIGHT NOW
      </Text>
      <Text style={{ marginTop: 6, fontSize: 17, fontWeight: '800', color: colors.chalk, lineHeight: 24 }}>
        {message || 'Getting your clip ready…'}
      </Text>
      {!failed ? (
        <View
          style={{
            marginTop: 12,
            alignSelf: 'flex-start',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(182,242,74,0.22)',
            backgroundColor: 'rgba(182,242,74,0.06)',
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.chalk }}>
            {etaLabel ? `Estimated time remaining: ${etaLabel.toLowerCase()}` : 'Estimating time remaining…'}
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: 22, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 4 }}>
        {stages.map((s, i) => {
          const done = !failed && (currentIdx > i || status === 'completed')
          const active = !failed && currentIdx === i && status !== 'completed'
          const broken = Boolean(failed && currentIdx === i)
          const detail = active ? formatStageDetail(stageDetail) : null
          const frac = active ? stageFraction(stageDetail) : null
          return (
            <View
              key={s.key}
              style={{
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: active ? 'rgba(182,242,74,0.10)' : broken ? colors.roseBg : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: broken
                      ? 'rgba(240,113,103,0.4)'
                      : done
                        ? 'rgba(110,231,183,0.4)'
                        : active
                          ? 'rgba(182,242,74,0.5)'
                          : colors.line,
                    backgroundColor: broken
                      ? 'rgba(240,113,103,0.15)'
                      : done
                        ? colors.emeraldBg
                        : active
                          ? 'rgba(182,242,74,0.15)'
                          : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: broken ? colors.ball : done ? colors.emerald : active ? colors.lime : colors.muted,
                    }}
                  >
                    {broken ? '!' : done ? '✓' : i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontWeight: active || broken ? '700' : '500',
                      color: broken ? colors.ball : active || done ? colors.chalk : colors.muted,
                    }}
                  >
                    {s.label}
                  </Text>
                  {detail ? (
                    <Text style={{ marginTop: 2, fontSize: 11, fontWeight: '600', color: colors.lime }}>
                      {detail}
                    </Text>
                  ) : null}
                </View>
                {active ? <ActivityIndicator color={colors.lime} /> : null}
              </View>
              {active && frac != null ? (
                <View style={{ marginLeft: 38, marginTop: 8, height: 4, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(frac * 100)}%`, height: 4, backgroundColor: colors.lime }} />
                </View>
              ) : null}
            </View>
          )
        })}
      </View>
    </View>
  )
}

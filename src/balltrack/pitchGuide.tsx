import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import Svg, { Defs, Line, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg'
import type { Box } from './types'

const PITCH_LENGTH_M = 20.12
const CREASE_M = 1.22

function clampBox(box: Box): Box {
  const w = Math.min(0.72, Math.max(0.06, box.w))
  const h = Math.min(0.4, Math.max(0.05, box.h))
  return {
    w,
    h,
    x: Math.min(1 - w, Math.max(0, box.x)),
    y: Math.min(1 - h, Math.max(0.04, box.y)),
  }
}

function WicketSet({
  x,
  baseY,
  w,
  h,
}: {
  x: number
  baseY: number
  w: number
  h: number
}) {
  const postW = Math.max(3, w * 0.17)
  const gap = (w - postW * 3) / 2
  const bailH = Math.max(2.5, h * 0.08)
  const postH = Math.max(8, h - bailH)
  const topY = baseY - postH - bailH
  const posts = [0, 1, 2].map((i) => {
    const left = x + i * (postW + gap)
    const topW = postW * 0.78
    const inset = (postW - topW) / 2
    return {
      points: [
        `${left},${baseY}`,
        `${left + postW},${baseY}`,
        `${left + postW - inset},${topY + bailH}`,
        `${left + inset},${topY + bailH}`,
      ].join(' '),
      bailX: left,
    }
  })
  const bailY = topY + bailH * 0.15
  return (
    <>
      {posts.map((p, i) => (
        <Polygon key={i} points={p.points} fill="#F5D76E" stroke="#B8860B" strokeWidth={1.2} />
      ))}
      <Rect x={x} y={bailY} width={w} height={bailH * 0.7} rx={1.2} fill="#E8C547" stroke="#8B6914" strokeWidth={0.8} />
      <Rect
        x={x + w * 0.02}
        y={bailY - bailH * 0.15}
        width={w * 0.96}
        height={bailH * 0.35}
        rx={1}
        fill="#FCE7A0"
      />
    </>
  )
}

export function PitchOverlay({ bowler, batter }: { bowler: Box; batter: Box }) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  if (!size.w) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize(e.nativeEvent.layout)} />
  }

  const nearL = bowler.x * size.w
  const nearR = (bowler.x + bowler.w) * size.w
  const nearBase = (bowler.y + bowler.h) * size.h
  const farL = batter.x * size.w
  const farR = (batter.x + batter.w) * size.w
  const farBase = (batter.y + batter.h) * size.h

  const quad = `${nearL},${nearBase} ${nearR},${nearBase} ${farR},${farBase} ${farL},${farBase}`

  const creaseT = CREASE_M / PITCH_LENGTH_M
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const nearCrease = {
    x1: lerp(nearL, farL, creaseT),
    y1: lerp(nearBase, farBase, creaseT),
    x2: lerp(nearR, farR, creaseT),
    y2: lerp(nearBase, farBase, creaseT),
  }
  const farCrease = {
    x1: lerp(nearL, farL, 1 - creaseT),
    y1: lerp(nearBase, farBase, 1 - creaseT),
    x2: lerp(nearR, farR, 1 - creaseT),
    y2: lerp(nearBase, farBase, 1 - creaseT),
  }

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      <Svg width={size.w} height={size.h}>
        <Defs>
          <LinearGradient id="pitchFade" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#1D4ED8" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#60A5FA" stopOpacity="0.22" />
          </LinearGradient>
        </Defs>
        <Polygon points={quad} fill="url(#pitchFade)" stroke="#3B82F6" strokeWidth={3} />
        <Line
          x1={(nearL + nearR) / 2}
          y1={nearBase}
          x2={(farL + farR) / 2}
          y2={farBase}
          stroke="#93C5FD"
          strokeWidth={2}
          strokeDasharray="10 8"
        />
        <Line {...nearCrease} stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
        <Line {...farCrease} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
        <WicketSet x={nearL} baseY={nearBase} w={nearR - nearL} h={bowler.h * size.h} />
        <WicketSet x={farL} baseY={farBase} w={farR - farL} h={batter.h * size.h} />
      </Svg>
    </View>
  )
}

export function DraggableStumpBox({
  box,
  label,
  onChange,
  layout,
}: {
  box: Box
  label: string
  onChange: (box: Box) => void
  layout: { w: number; h: number }
}) {
  const pan = Gesture.Pan().onChange((e) => {
    if (!layout.w) return
    runOnJS(onChange)(
      clampBox({
        ...box,
        x: box.x + e.changeX / layout.w,
        y: box.y + e.changeY / layout.h,
      }),
    )
  })
  const resize = Gesture.Pan().onChange((e) => {
    if (!layout.w) return
    runOnJS(onChange)(
      clampBox({
        ...box,
        w: box.w + e.changeX / layout.w,
        h: box.h + e.changeY / layout.h,
      }),
    )
  })

  return (
    <GestureDetector gesture={pan}>
      <View
        style={{
          position: 'absolute',
          left: `${box.x * 100}%`,
          top: `${box.y * 100}%`,
          width: `${box.w * 100}%`,
          height: `${box.h * 100}%`,
          borderWidth: 2,
          borderColor: '#E11D2A',
          borderStyle: 'dashed',
          borderRadius: 4,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            marginTop: -20,
            color: '#E11D2A',
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {label}
        </Text>
        <GestureDetector gesture={resize}>
          <View
            style={{
              position: 'absolute',
              right: -8,
              bottom: -8,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#E11D2A',
              borderWidth: 2,
              borderColor: '#fff',
            }}
          />
        </GestureDetector>
      </View>
    </GestureDetector>
  )
}

export { clampBox }

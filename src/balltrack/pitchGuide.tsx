import { useRef, useState } from 'react'
import { PanResponder, StyleSheet, Text, View } from 'react-native'
import Svg, { Defs, Line, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg'
import type { Box } from './types'

const PITCH_LENGTH_M = 20.12
const CREASE_M = 1.22
const HANDLE = 28

function clampBox(box: Box): Box {
  const w = Math.min(0.85, Math.max(0.05, box.w))
  const h = Math.min(0.5, Math.max(0.05, box.h))
  return {
    w,
    h,
    x: Math.min(1 - w, Math.max(0, box.x)),
    y: Math.min(1 - h, Math.max(0.02, box.y)),
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
    return [
      `${left},${baseY}`,
      `${left + postW},${baseY}`,
      `${left + postW - inset},${topY + bailH}`,
      `${left + inset},${topY + bailH}`,
    ].join(' ')
  })
  const bailY = topY + bailH * 0.15
  return (
    <>
      {posts.map((points, i) => (
        <Polygon key={i} points={points} fill="#F5D76E" stroke="#B8860B" strokeWidth={1.2} />
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
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} />
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
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
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

export function ResizableStumpBox({
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
  const start = useRef(box)
  const boxRef = useRef(box)
  const layoutRef = useRef(layout)
  boxRef.current = box
  layoutRef.current = layout

  function makeCorner(kind: 'nw' | 'ne' | 'sw' | 'se') {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.current = boxRef.current
      },
      onPanResponderMove: (_, g) => {
        const s = start.current
        const lw = layoutRef.current.w || 1
        const lh = layoutRef.current.h || 1
        const dx = g.dx / lw
        const dy = g.dy / lh
        const cx = s.x + s.w / 2
        const cy = s.y + s.h / 2
        let nextW = s.w
        let nextH = s.h
        if (kind === 'se' || kind === 'ne') nextW = s.w + dx
        if (kind === 'sw' || kind === 'nw') nextW = s.w - dx
        if (kind === 'se' || kind === 'sw') nextH = s.h + dy
        if (kind === 'ne' || kind === 'nw') nextH = s.h - dy
        onChange(clampBox({ w: nextW, h: nextH, x: cx - nextW / 2, y: cy - nextH / 2 }))
      },
    })
  }

  const nw = useRef(makeCorner('nw')).current
  const ne = useRef(makeCorner('ne')).current
  const sw = useRef(makeCorner('sw')).current
  const se = useRef(makeCorner('se')).current

  const handle = {
    position: 'absolute' as const,
    width: HANDLE,
    height: HANDLE,
    borderRadius: 6,
    backgroundColor: '#E11D2A',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 6,
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.w * 100}%`,
        height: `${box.h * 100}%`,
        zIndex: 8,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          borderWidth: 2,
          borderColor: '#E11D2A',
          borderStyle: 'dashed',
          borderRadius: 4,
          backgroundColor: 'rgba(225,29,42,0.10)',
        }}
      >
        <Text
          style={{
            position: 'absolute',
            top: -22,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#E11D2A',
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {label}
        </Text>
      </View>
      <View {...nw.panHandlers} style={[handle, { top: -HANDLE / 2, left: -HANDLE / 2 }]} />
      <View {...ne.panHandlers} style={[handle, { top: -HANDLE / 2, right: -HANDLE / 2 }]} />
      <View {...sw.panHandlers} style={[handle, { bottom: -HANDLE / 2, left: -HANDLE / 2 }]} />
      <View {...se.panHandlers} style={[handle, { bottom: -HANDLE / 2, right: -HANDLE / 2 }]} />
    </View>
  )
}

export const DraggableStumpBox = ResizableStumpBox

export { clampBox }

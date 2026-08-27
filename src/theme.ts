export const colors = {
  night: '#05090a',
  charcoal: '#0b1113',
  card: '#11181a',
  lime: '#b6f24a',
  limeDeep: '#8fd12b',
  chalk: '#f6f9f7',
  seam: '#d9743c',
  ball: '#f07167',
  muted: 'rgba(246,249,247,0.55)',
  line: 'rgba(255,255,255,0.14)',
  white: '#ffffff',
  ink: '#f6f9f7',
  onLime: '#05090a',
  // Used by existing screens: titles, buttons, deep fills
  pitch: '#b6f24a',
  pitchDeep: '#05090a',
  mist: '#0b1113',
  crease: '#11181a',
  amber: '#f5c16c',
  amberBg: 'rgba(245,193,108,0.14)',
  rose: '#f07167',
  roseBg: 'rgba(240,113,103,0.14)',
  emerald: '#6ee7b7',
  emeraldBg: 'rgba(110,231,183,0.12)',
} as const

export const cardStyle = {
  backgroundColor: colors.card,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.line,
} as const

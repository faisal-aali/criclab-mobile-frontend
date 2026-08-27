import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme'

export function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T | ''
  onChange: (v: T) => void
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {options.map((o) => {
        const on = value === o.value
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: on ? colors.lime : colors.card,
              borderWidth: 1,
              borderColor: on ? colors.lime : colors.line,
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 13, color: on ? colors.onLime : colors.chalk }}>
              {o.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.chalk, marginTop: 14 }}>{children}</Text>
  )
}

export const fieldInputStyle = {
  marginTop: 6,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.charcoal,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 16,
  color: colors.chalk,
} as const

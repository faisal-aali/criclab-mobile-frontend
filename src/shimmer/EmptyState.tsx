import { Text, View } from 'react-native'
import { colors } from '../theme'

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.line,
        borderRadius: 18,
        padding: 28,
        alignItems: 'center',
        backgroundColor: colors.card,
      }}
    >
      <Text style={{ fontWeight: '800', color: colors.chalk }}>{title}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 6, textAlign: 'center', color: colors.muted, lineHeight: 20 }}>{subtitle}</Text>
      ) : null}
    </View>
  )
}

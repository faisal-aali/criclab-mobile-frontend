import { View } from 'react-native'
import { InboxBell } from './InboxBell'
import { ProcessingIndicator } from './ProcessingIndicator'

export function HeaderChrome() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <InboxBell />
      <ProcessingIndicator />
    </View>
  )
}

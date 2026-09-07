import { Modal, Text, View } from 'react-native'
import type { ClipUploadProgress } from '../api/client'
import { colors } from '../theme'

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function ClipUploadOverlay({
  progress,
  label = 'Sending your clip',
}: {
  progress: ClipUploadProgress | null
  label?: string
}) {
  if (!progress) return null
  const cloud = progress.phase === 'cloudinary'
  const pct = cloud && progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : null
  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            backgroundColor: colors.charcoal,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.6, color: colors.lime }}>{label.toUpperCase()}</Text>
          <Text style={{ marginTop: 8, fontSize: 20, fontWeight: '800', color: colors.chalk }}>
            {cloud ? 'Uploading your video' : 'Handing off to analysis'}
          </Text>
          <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.muted }}>
            {cloud && pct != null
              ? `${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
              : 'The lab is picking up the clip. You can leave this screen after it queues.'}
          </Text>
          <View style={{ marginTop: 16, height: 8, borderRadius: 4, backgroundColor: colors.line, overflow: 'hidden' }}>
            <View
              style={{
                width: pct == null ? '33%' : `${pct}%`,
                height: 8,
                backgroundColor: colors.lime,
              }}
            />
          </View>
          <Text style={{ marginTop: 8, textAlign: 'right', fontWeight: '800', color: colors.lime }}>
            {pct != null ? `${pct}%` : '…'}
          </Text>
        </View>
      </View>
    </Modal>
  )
}

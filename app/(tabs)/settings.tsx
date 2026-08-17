import { useEffect, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { getHealth } from '../../src/api/client'
import { getApiBase, setApiBase, suggestedLanHint } from '../../src/api/config'
import { Logo } from '../../src/components/Logo'
import { Screen } from '../../src/components/Screen'
import { colors } from '../../src/theme'

export default function SettingsScreen() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    getApiBase().then(setUrl)
  }, [])

  async function save() {
    const clean = await setApiBase(url)
    setUrl(clean)
    Alert.alert('Saved', `API base is now ${clean}`)
  }

  async function ping() {
    try {
      await setApiBase(url)
      const h = await getHealth()
      setStatus(h.ok === false ? 'API responded but not healthy' : 'Connected to Cric-Lab API')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not connect')
    }
  }

  return (
    <Screen>
      <Logo />
      <Text style={{ marginTop: 18, fontSize: 32, fontWeight: '800', color: colors.pitch }}>Settings</Text>
      <Text style={{ marginTop: 8, lineHeight: 22, color: colors.muted }}>
        This app talks to the Cric-Lab FastAPI backend from the other project. Start that server, then point this
        phone at it.
      </Text>

      <Text style={{ marginTop: 20, fontWeight: '700', color: colors.pitch }}>API base URL</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.white,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.ink,
        }}
        placeholder="http://192.168.1.10:8000"
        placeholderTextColor={colors.muted}
      />
      <Text style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.muted }}>{suggestedLanHint()}</Text>
      <Text style={{ marginTop: 6, fontSize: 12, lineHeight: 18, color: colors.muted }}>
        On the Mac run uvicorn with --host 0.0.0.0 so a real phone can connect.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pressable
          onPress={save}
          style={{
            flex: 1,
            backgroundColor: colors.pitch,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '800' }}>Save</Text>
        </Pressable>
        <Pressable
          onPress={ping}
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.pitch,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.pitch, fontWeight: '800' }}>Test connection</Text>
        </Pressable>
      </View>
      {status ? (
        <Text style={{ marginTop: 14, color: status.startsWith('Connected') ? colors.emerald : colors.ball }}>
          {status}
        </Text>
      ) : null}

      <View
        style={{
          marginTop: 28,
          backgroundColor: colors.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '800', color: colors.pitch }}>What this app does</Text>
        <Text style={{ marginTop: 8, color: colors.muted, lineHeight: 20 }}>
          Upload a side-on bowling clip. The Python pipeline (pose, metrics, overlay, Gemma, PDF) still runs on your
          computer. This is the mobile client — not a second copy of the vision lab.
        </Text>
      </View>
    </Screen>
  )
}

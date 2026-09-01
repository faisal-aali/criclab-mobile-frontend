import type { PickedVideo } from '../api/client'

let pending: PickedVideo | null = null

export function stashActionClip(clip: PickedVideo) {
  pending = clip
}

export function consumeActionClip(): PickedVideo | null {
  const next = pending
  pending = null
  return next
}

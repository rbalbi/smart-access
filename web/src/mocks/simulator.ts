import type { LiveMessage } from '@/api/client'
import { nextEvent, nextException, seededRng } from './stream'

const rng = seededRng(Date.now())

/** Emits an access event every 3-6 s and an exception roughly every 2 min. */
export function startSimulator(onMessage: (msg: LiveMessage) => void) {
  let timer: ReturnType<typeof setTimeout>
  const tick = () => {
    const now = new Date()
    if (rng() < 0.04) {
      onMessage({ kind: 'exception', exception: nextException(rng, now) })
    } else {
      onMessage({ kind: 'event', event: nextEvent(rng, now) })
    }
    timer = setTimeout(tick, 3000 + rng() * 3000)
  }
  timer = setTimeout(tick, 3000)
  return () => clearTimeout(timer)
}

/** Dev toolbar hook: push a critical exception right now. */
export function injectCritical(onMessage: (msg: LiveMessage) => void) {
  onMessage({
    kind: 'exception',
    exception: nextException(rng, new Date(), { critical: true }),
  })
}

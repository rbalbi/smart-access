import type {
  AccessEvent,
  AuditEntry,
  Building,
  ConsoleSnapshot,
  ExceptionItem,
  PeopleSnapshot,
  Site,
} from '@/types'

// Swap VITE_API_URL to point at the real backend; MSW serves /api until then.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
}

export type LiveMessage =
  | { kind: 'event'; event: AccessEvent }
  | { kind: 'exception'; exception: ExceptionItem }

export type Unsubscribe = () => void

export const api = {
  buildings: () => get<Building[]>('/buildings'),
  sites: () => get<Pick<Site, 'id' | 'name' | 'address'>[]>('/sites'),
  console: (siteId: string) => get<ConsoleSnapshot>(`/sites/${siteId}/console`),
  people: (siteId: string) => get<PeopleSnapshot>(`/sites/${siteId}/people`),
  recordAudit: (entry: AuditEntry) => post('/audit', entry),

  /**
   * Live access events for a site. The real backend will push these over a
   * WebSocket or SSE; until then a local simulator emits them.
   */
  subscribe: async (
    siteId: string,
    onMessage: (msg: LiveMessage) => void,
  ): Promise<Unsubscribe> => {
    if (!USE_MOCKS) {
      throw new Error(`Live stream for ${siteId} needs a backend endpoint`)
    }
    const { startSimulator } = await import('@/mocks/simulator')
    return startSimulator(onMessage)
  },
}

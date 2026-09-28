import type { AccessEvent, Alert, Building } from '@/types'

// Swap VITE_API_URL to point at the real backend; MSW serves /api until then.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  buildings: () => get<Building[]>('/buildings'),
  accessEvents: () => get<AccessEvent[]>('/access-events'),
  alerts: () => get<Alert[]>('/alerts'),
}

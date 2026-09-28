import type { AccessEvent } from '@/types'

export const accessEvents: AccessEvent[] = [
  {
    id: 'e1',
    timestamp: '2026-09-28T08:02:11Z',
    buildingId: 'b1',
    door: 'Main Lobby',
    person: 'J. Alvarez',
    method: 'mobile',
    decision: 'granted',
  },
  {
    id: 'e2',
    timestamp: '2026-09-28T08:04:37Z',
    buildingId: 'b2',
    door: 'Loading Dock B',
    person: 'Unknown badge',
    method: 'badge',
    decision: 'denied',
  },
  {
    id: 'e3',
    timestamp: '2026-09-28T08:05:02Z',
    buildingId: 'b3',
    door: 'Gate 2',
    person: 'M. Chen',
    method: 'biometric',
    decision: 'granted',
  },
]

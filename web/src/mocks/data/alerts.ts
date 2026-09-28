import type { Alert } from '@/types'

export const alerts: Alert[] = [
  {
    id: 'a1',
    timestamp: '2026-09-28T07:45:00Z',
    buildingId: 'b3',
    severity: 'high',
    title: 'Controller offline: Gate 4',
    resolved: false,
  },
  {
    id: 'a2',
    timestamp: '2026-09-28T06:12:00Z',
    buildingId: 'b2',
    severity: 'medium',
    title: 'Repeated denied attempts at Loading Dock B',
    resolved: false,
  },
]

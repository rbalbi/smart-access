// Domain types shared by the UI and the mock API.
// These become the contract with the real backend later.

export type Building = {
  id: string
  name: string
  type: 'office' | 'factory' | 'warehouse'
  city: string
  occupancy: number
  capacity: number
  devicesOnline: number
  devicesTotal: number
}

export type AccessDecision = 'granted' | 'denied'

export type AccessEvent = {
  id: string
  timestamp: string
  buildingId: string
  door: string
  person: string
  method: 'badge' | 'mobile' | 'biometric'
  decision: AccessDecision
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type Alert = {
  id: string
  timestamp: string
  buildingId: string
  severity: AlertSeverity
  title: string
  resolved: boolean
}

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

export type Site = {
  id: string
  name: string
  address: string
  /** IANA zone; every timestamp on the console renders in the site's zone. */
  timeZone: string
  gateway: string
}

export type Role = 'operations' | 'security'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type CredentialKind =
  'badge' | 'mobile' | 'biometric' | 'pin' | 'visitor-pass' | 'qr-pass'

export type Credential = {
  kind: CredentialKind
  /** Only the last four digits ever leave the backend. */
  last4?: string
  note?: string
}

export type Person = {
  givenName: string
  familyName: string
  /** Shown instead of the name in privacy mode, e.g. "Contractor". */
  roleLabel: string
  org?: string
}

export type SignalTone = 'ok' | 'bad' | 'warn' | 'neutral'

export type Signal = {
  label: string
  value: string
  tone: SignalTone
}

export type Reasoning = {
  policy: string
  /** Short name for dense rows, e.g. "Contractor pre-reg". */
  policyShort: string
  policyVersion: string
  signals: Signal[]
  /** 0-1, or null when the decision was rule-based rather than scored. */
  confidence: number | null
  /** Why a person had to decide (exceptions only). */
  routedBecause?: string
}

export type ExceptionType =
  | 'forced-door'
  | 'tailgating'
  | 'badge-denied'
  | 'door-held-open'
  | 'visitor-no-invite'
  | 'controller-battery'
  | 'controller-offline'
  | 'restricted-area'

export type ExceptionStatus = 'open' | 'resolved' | 'escalated'

export type ExceptionItem = {
  id: string
  type: ExceptionType
  severity: Severity
  title: string
  location: string
  occurredAt: string
  summary: string
  subject?: Person
  credential?: Credential
  /** Security-classified: Operations sees a locked placeholder only. */
  classified: boolean
  routingId?: string
  reasoning: Reasoning
  assignee?: string
  status: ExceptionStatus
  /** Door held open: when the door opened and the allowed duration. */
  heldOpen?: { since: string; limitSeconds: number }
  battery?: { percent: number; minutesRemaining: number }
  visitor?: { host: string; hostOrg: string; notifiedAt: string }
  cameraId?: string
}

export type AccessOutcome = 'admitted' | 'denied' | 'relocked' | 'suppressed'

export type TimelineEntry = {
  at: string
  text: string
  actor?: string
  emphasis?: 'current' | 'outcome'
}

export type AccessEvent = {
  id: string
  occurredAt: string
  outcome: AccessOutcome
  location: string
  /** Who, when the event concerns a person. */
  subject?: Person
  /** What, when it doesn't (e.g. "Door held open alarm suppressed"). */
  headline?: string
  context?: string
  credential?: Credential
  reasoning: Reasoning
  timeline: TimelineEntry[]
  authorizationWindow?: string
  relatedExceptionId?: string
  /** Decided by the edge controller while the console was disconnected. */
  recordedOffline?: boolean
  cameraId?: string
}

export type DoorState = 'online' | 'offline' | 'battery'

export type Door = {
  id: string
  name: string
  state: DoorState
}

export type ConsoleSnapshot = {
  site: Site
  doors: Door[]
  exceptions: ExceptionItem[]
  events: AccessEvent[]
  /** Counters for events before the snapshot (today, since local midnight). */
  today: { handled: number; total: number }
  weekAutonomy: number[]
  /** Resolution times (seconds) of exceptions people closed today. */
  resolutionSeconds: number[]
  baselineResolutionSeconds: number
}

export type Decision = {
  auditId: string
  targetId: string
  targetKind: 'exception' | 'event'
  action: string
  label: string
  actor: string
  at: string
  note?: string
  /** Until when the one-click "Reverse" is offered. */
  reversibleUntil?: string
}

export type AuditEntry = {
  id: string
  at: string
  actor: string
  summary: string
  targetId?: string
}

export type ConnectionState = 'live' | 'lost'

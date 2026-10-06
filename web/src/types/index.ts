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

// ---------- People & Credentials ----------

export type PersonType = 'tenant' | 'staff' | 'contractor'

export type CredentialStatus = 'active' | 'expired' | 'suspended' | 'revoked'

export type IssuedCredential = Credential & {
  id: string
  status: CredentialStatus
  /** "Apple Wallet (iPhone 15 Pro)", "HID iCLASS SE". */
  device?: string
  issuedAt: string
  /** Issued by a roster sync or a rule, rather than by a person. */
  autoProvisioned: boolean
  expiresAt?: string
  lastTap?: { at: string; location: string }
}

export type AccessGroup = {
  id: string
  name: string
  /** Server rooms, security operations: Security role only. */
  restricted: boolean
  /** Master or all-doors groups, flagged in the directory. */
  elevated?: boolean
  schedule: string
  doorIds: string[]
}

export type LastAccess = {
  at: string
  /** Absent for administrative entries ("Manual hold by HR"). */
  outcome?: 'admitted' | 'denied'
  location: string
}

export type DirectoryPerson = {
  /** "PER-008812". */
  id: string
  person: Person
  /** Show "Tanaka Yuki" rather than "Yuki Tanaka". */
  familyNameFirst?: boolean
  type: PersonType
  email: string
  phone: string
  /** Contractors: the tenant or team that vouches for them. */
  sponsor?: string
  source: 'roster' | 'manual'
  /** "SCIM Roster Integration · Tenant ID: KST-9044". */
  sourceDetail: string
  syncedAt: string
  credentials: IssuedCredential[]
  groupIds: string[]
  /** A contractor's end date extension waiting on Security. */
  extensionRequested?: boolean
  lastAccess?: LastAccess
  /** Open Live Activity exception about this person. */
  exceptionId?: string
}

export type ReviewKind =
  | 'access-extension'
  | 'roster-mismatch'
  | 'possible-duplicate'
  | 'mobile-not-activated'
  | 'stale-suspension'

export type ReviewAction = {
  id: string
  label: string
  tone: 'secondary' | 'outline'
  /** Removes access, so it asks for confirmation first. */
  removesAccess?: boolean
}

export type ReviewItem = {
  id: string
  kind: ReviewKind
  severity: Exclude<Severity, 'critical'>
  personId: string
  /** Shown instead of the person's name, e.g. both duplicate spellings. */
  title?: string
  /** "Contractor · Castellan Insurance". */
  context: string
  detail: string
  createdAt: string
  /** Security-classified: Operations sees a masked summary only. */
  classified: boolean
  maskedDetail?: string
  requestId?: string
  exceptionId?: string
  /** Link text for the exception, e.g. "3 denied attempts today". */
  exceptionNote?: string
  actions: ReviewAction[]
}

export type RosterSync = {
  tenant: string
  syncedAt: string
  ok: boolean
  people: number
}

export type PeopleSnapshot = {
  people: DirectoryPerson[]
  review: ReviewItem[]
  groups: AccessGroup[]
  rosters: RosterSync[]
  /** Credential changes made without a person, last 7 days. */
  automation: {
    issued: number
    revokedOnOffboarding: number
    expiredOnSchedule: number
    neededPerson: number
  }
}

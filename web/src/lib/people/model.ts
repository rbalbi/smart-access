import type {
  AccessGroup,
  CredentialKind,
  DirectoryPerson,
  IssuedCredential,
  Role,
} from '@/types'
import type { PrivacyContext } from '@/lib/console/format'

// Derived facts about people and credentials. Pure: everything takes `now`.

const DAY = 86_400_000
/** Credentials that end within this window show "Expiring in Nd". */
export const EXPIRING_WINDOW_DAYS = 7
/** Renewals and approvals extend by this much. */
export const RENEWAL_DAYS = 90

export type CredentialState = 'active' | 'expired' | 'suspended' | 'revoked'

/** An active credential past its end date counts as expired. */
export function credentialState(
  c: IssuedCredential,
  now: string,
): CredentialState {
  if (c.status === 'active' && c.expiresAt && c.expiresAt <= now)
    return 'expired'
  return c.status
}

export type PersonStatusKey =
  | 'active'
  | 'expiring'
  | 'pending-extension'
  | 'expired'
  | 'suspended'
  | 'no-credential'

export type PersonStatus = {
  key: PersonStatusKey
  label: string
  tone: 'ok' | 'bad' | 'neutral'
}

export const statusLabels: Record<PersonStatusKey, string> = {
  active: 'Active',
  expiring: 'Expiring soon',
  'pending-extension': 'Pending extension',
  expired: 'Expired',
  suspended: 'Suspended',
  'no-credential': 'No credential',
}

const credentialNoun: Record<CredentialKind, string> = {
  badge: 'badge',
  mobile: 'mobile credential',
  biometric: 'biometric',
  pin: 'PIN',
  'visitor-pass': 'visitor pass',
  'qr-pass': 'QR pass',
}

export function personStatus(p: DirectoryPerson, now: string): PersonStatus {
  const live = p.credentials.filter((c) => c.status !== 'revoked')
  const states = live.map((c) => credentialState(c, now))
  const active = live.filter((_, i) => states[i] === 'active')

  if (live.length === 0)
    return { key: 'no-credential', label: 'No credential', tone: 'neutral' }
  if (p.extensionRequested)
    return {
      key: 'pending-extension',
      label: 'Pending extension',
      tone: 'neutral',
    }
  if (active.length === 0) {
    const expired = live.find((_, i) => states[i] === 'expired')
    if (expired)
      return {
        key: 'expired',
        label: `Expired ${credentialNoun[expired.kind]}`,
        tone: 'bad',
      }
    return { key: 'suspended', label: 'Suspended', tone: 'bad' }
  }
  const soonest = active
    .map((c) => c.expiresAt)
    .filter((e): e is string => !!e)
    .sort()[0]
  if (soonest) {
    const days = Math.ceil((Date.parse(soonest) - Date.parse(now)) / DAY)
    if (days <= EXPIRING_WINDOW_DAYS)
      return { key: 'expiring', label: `Expiring in ${days}d`, tone: 'neutral' }
  }
  return { key: 'active', label: 'Active', tone: 'ok' }
}

// ---------- Names ----------

export function fullName(p: DirectoryPerson) {
  const { givenName, familyName } = p.person
  return p.familyNameFirst
    ? `${familyName} ${givenName}`
    : `${givenName} ${familyName}`
}

/** Directory names are full by default; privacy mode shows the role only. */
export function directoryName(p: DirectoryPerson, ctx: PrivacyContext) {
  return ctx.privacy ? p.person.roleLabel : fullName(p)
}

export function directoryInitials(p: DirectoryPerson, ctx: PrivacyContext) {
  if (ctx.privacy) return p.person.roleLabel.slice(0, 2).toUpperCase()
  const { givenName, familyName } = p.person
  return p.familyNameFirst
    ? `${familyName[0]}${givenName[0]}`
    : `${givenName[0]}${familyName[0]}`
}

/** "t.reyes@kestrel-analytics.com" -> "t•••••@kestrel-analytics.com". */
export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${local[0]}•••••@${domain}`
}

export const typeLabels = {
  tenant: 'Tenant employee',
  staff: 'Building staff',
  contractor: 'Contractor',
} as const

/**
 * Second line of the classification column: the organization, or for a
 * contractor engaged directly by a tenant, who sponsors them.
 */
export function classificationDetail(p: DirectoryPerson) {
  const org = p.person.org ?? ''
  if (p.type === 'contractor' && p.sponsor && org.startsWith(p.sponsor))
    return `Sponsor: ${p.sponsor}`
  return org
}

// ---------- Credentials ----------

const credentialTitles: Record<CredentialKind, string> = {
  badge: 'Physical badge',
  mobile: 'Mobile Wallet Key',
  biometric: 'Biometric template',
  pin: 'PIN code',
  'visitor-pass': 'Visitor pass',
  'qr-pass': 'QR pass',
}

export function credentialTitle(kind: CredentialKind) {
  return credentialTitles[kind]
}

/** Biometrics are Security-only (prompt 02). */
export function canManageCredential(kind: CredentialKind, role: Role) {
  return kind !== 'biometric' || role === 'security'
}

// ---------- Access groups ----------

export function groupsFor(p: DirectoryPerson, groups: AccessGroup[]) {
  return p.groupIds
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is AccessGroup => !!g)
}

export function visibleGroups(groups: AccessGroup[], role: Role) {
  return role === 'security' ? groups : groups.filter((g) => !g.restricted)
}

/** Doors this person's groups open, as a count. */
export function doorCount(p: DirectoryPerson, groups: AccessGroup[]) {
  return new Set(groupsFor(p, groups).flatMap((g) => g.doorIds)).size
}

export type DoorCheck =
  | { allowed: true; group: AccessGroup }
  | {
      allowed: false
      reason: 'no-group' | 'no-credential'
      /** Restricted groups that would allow it (Security sees names). */
      restrictedMatch?: AccessGroup
    }

/** "Can this person open this door, and why?" */
export function checkDoor(
  p: DirectoryPerson,
  doorId: string,
  groups: AccessGroup[],
  now: string,
): DoorCheck {
  const usable = p.credentials.some((c) => credentialState(c, now) === 'active')
  const match = groupsFor(p, groups).find((g) => g.doorIds.includes(doorId))
  if (!usable) return { allowed: false, reason: 'no-credential' }
  if (!match) return { allowed: false, reason: 'no-group' }
  return { allowed: true, group: match }
}

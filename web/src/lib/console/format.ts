import type { Credential, CredentialKind, Person } from '@/types'

// All formatting goes through Intl with the site's time zone; the UI never
// hard-codes a date or time string.

const LOCALE = undefined // the viewer's locale

export function formatTime(
  iso: string,
  timeZone: string,
  opts: { seconds?: boolean; clock24?: boolean } = {},
) {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    second: opts.seconds === false ? undefined : '2-digit',
    hourCycle: opts.clock24 ? 'h23' : undefined,
    timeZone,
  }).format(new Date(iso))
}

/** "09:14:08" style clock used in the dense event stream. */
export function formatClock(iso: string, timeZone: string) {
  return formatTime(iso, timeZone, { clock24: true })
}

export function formatDateTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

export function isSameSiteDay(a: string, b: string, timeZone: string) {
  const day = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso))
  return day(a) === day(b)
}

/** "Today · 7:42:19 AM" or "Sep 26, 2026, 4:15 PM". */
export function formatRelativeDay(iso: string, now: string, timeZone: string) {
  return isSameSiteDay(iso, now, timeZone)
    ? `Today · ${formatTime(iso, timeZone)}`
    : formatDateTime(iso, timeZone)
}

export function timeZoneAbbr(timeZone: string, at = new Date()) {
  return (
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value ?? timeZone
  )
}

/** 252 -> "4m 12s"; 45 -> "45s"; 7800 -> "2h 10m". */
export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

/** 252 -> "04:12" timer display. */
export function formatTimer(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function formatPercent(ratio: number, fractionDigits = 1) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(ratio)
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat(LOCALE).format(n)
}

export type ConfidenceBand = 'high' | 'medium' | 'low'

/** Bands are illustrative; real thresholds belong to the policy screen. */
export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.7) return 'medium'
  return 'low'
}

export function formatConfidence(confidence: number | null) {
  if (confidence === null) return 'Rule-based'
  const band = confidenceBand(confidence)
  return `${Math.round(confidence * 100)}% (${band[0].toUpperCase()}${band.slice(1)})`
}

// ---------- Privacy ----------

export type PrivacyContext = { privacy: boolean; revealed?: boolean }

/**
 * Default: given name + family initial ("Kenji W."). Privacy mode (for screen
 * sharing): role and organization only. Revealed: full name (audit-logged).
 */
export function displayName(person: Person, ctx: PrivacyContext) {
  if (ctx.privacy) return person.org ? `${person.roleLabel}` : person.roleLabel
  if (ctx.revealed) return `${person.givenName} ${person.familyName}`
  return `${person.givenName} ${person.familyName.charAt(0)}.`
}

export function initials(person: Person, ctx: PrivacyContext) {
  if (ctx.privacy) return person.roleLabel.slice(0, 2).toUpperCase()
  return `${person.givenName.charAt(0)}${person.familyName.charAt(0)}`
}

const credentialLabels: Record<CredentialKind, string> = {
  badge: 'Badge',
  mobile: 'Mobile',
  biometric: 'Biometric',
  pin: 'PIN',
  'visitor-pass': 'Visitor pass',
  'qr-pass': 'QR mobile pass',
}

export function credentialLabel(kind: CredentialKind) {
  return credentialLabels[kind]
}

export function formatCredential(credential: Credential) {
  const base = credentialLabels[credential.kind]
  const digits = credential.last4 ? ` ••••${credential.last4}` : ''
  const note = credential.note ? ` (${credential.note})` : ''
  return `${base}${digits}${note}`
}

/** "+1 617-555-0192" -> "+1 •••-•••-0192". */
export function maskPhone(phone: string) {
  return phone.replace(/\d(?=[\d-]{4})/g, '•')
}

/** Masks personal identifiers that appear inside free text. */
export function maskFreeText(text: string, privacy: boolean) {
  let out = text.replace(/\+\d[\d\s-]{7,}\d/g, (m) => maskPhone(m))
  if (privacy) out = out.replace(/Plate #\w+/g, 'Plate #•••••')
  return out
}

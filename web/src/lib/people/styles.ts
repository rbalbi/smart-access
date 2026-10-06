import {
  Fingerprint,
  IdCard,
  KeyRound,
  QrCode,
  Smartphone,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import type { CredentialKind, ReviewItem, ReviewKind } from '@/types'

// Class maps shared by the People & Credentials components. Colors come only
// from the console tokens in index.css.

export const credentialIcons: Record<CredentialKind, LucideIcon> = {
  mobile: Smartphone,
  badge: IdCard,
  'qr-pass': QrCode,
  pin: KeyRound,
  biometric: Fingerprint,
  'visitor-pass': Ticket,
}

/** Small outlined button used across the screen (Figma: 4px radius, 12px). */
export const outlineButton =
  'inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded border border-border px-2.5 text-xs whitespace-nowrap text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5'

export const iconButton =
  'inline-flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5'

const reviewKindLabels: Record<ReviewKind, string> = {
  'access-extension': 'Access extension',
  'roster-mismatch': 'Roster/badge mismatch',
  'possible-duplicate': 'Possible duplicate',
  'mobile-not-activated': 'Not activated',
  'stale-suspension': 'Stale suspension',
}

const reviewSeverity = {
  high: {
    short: 'High',
    tag: 'border-sev-critical/40 bg-sev-critical-bg/60 text-sev-critical-fg',
    dot: 'bg-sev-critical',
    text: 'text-sev-critical',
  },
  medium: {
    short: 'Med',
    tag: 'border-brand/30 bg-brand-strong/30 text-brand-soft',
    dot: 'bg-brand',
    text: 'text-brand-text',
  },
  low: {
    short: 'Low',
    tag: 'border-border bg-surface-5 text-muted-foreground',
    dot: 'bg-subtle-foreground',
    text: 'text-muted-foreground',
  },
} as const

export function reviewKindLabel(kind: ReviewKind) {
  return reviewKindLabels[kind]
}

export function reviewSeverityStyle(severity: ReviewItem['severity']) {
  return reviewSeverity[severity]
}

export const removalReasons = [
  'Lost or stolen',
  'Left the organization',
  'Policy violation',
  'Contract ended',
  'Requested by tenant admin',
  'Other',
]

import { Ban, CalendarX2, ChevronDown, Lock } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { StatusDot } from '@/components/console/primitives'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  credentialIcons,
  outlineButton,
  removalReasons,
  reviewKindLabel,
  reviewSeverityStyle,
} from '@/lib/people/styles'
import {
  credentialState,
  directoryInitials,
  type PersonStatus,
} from '@/lib/people/model'
import { cn } from '@/lib/utils'
import type {
  AccessGroup,
  DirectoryPerson,
  IssuedCredential,
  ReviewItem,
} from '@/types'

// Building blocks shared by the People & Credentials screen. Colors come only
// from the console tokens in index.css.

export function PersonAvatar({
  person,
  privacy,
  selected,
  size = 'md',
}: {
  person: DirectoryPerson
  privacy: boolean
  selected?: boolean
  size?: 'md' | 'lg'
}) {
  const contractor = person.type === 'contractor'
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center border font-semibold',
        size === 'lg'
          ? 'size-14 rounded-xl text-xl leading-7'
          : 'size-8 rounded-full text-xs',
        selected || size === 'lg'
          ? 'border-brand/30 bg-brand-strong text-brand-soft'
          : contractor
            ? 'border-dashed border-subtle-foreground/60 bg-surface-5 text-subtle-foreground'
            : 'border-border bg-surface-5 text-foreground',
      )}
    >
      {directoryInitials(person, { privacy })}
    </span>
  )
}

const pillTone = {
  ok: 'border-ok/30 bg-ok-bg/30 text-ok',
  bad: 'border-sev-critical/30 bg-sev-critical-bg/60 text-sev-critical-fg',
  neutral: 'border-border bg-surface-4 text-muted-foreground',
}
const dotTone = { ok: 'ok', bad: 'bad', neutral: 'muted' } as const

export function StatusPill({
  status,
  size = 'md',
}: {
  status: Pick<PersonStatus, 'label' | 'tone'>
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border whitespace-nowrap',
        size === 'sm'
          ? 'px-2 py-0.5 text-[10px] leading-[15px] font-medium'
          : 'px-2 py-[3px] text-[11px] leading-4 font-medium',
        pillTone[status.tone],
      )}
    >
      <StatusDot
        tone={dotTone[status.tone]}
        className={size === 'sm' ? 'size-1' : 'size-1.5'}
      />
      {status.label}
    </span>
  )
}

/** "📱 ••••7731" chip in the directory's credentials column. */
export function CredentialChip({
  credential,
  now,
  secondary,
}: {
  credential: IssuedCredential
  now: string
  secondary?: boolean
}) {
  const state = credentialState(credential, now)
  const Icon =
    state === 'expired'
      ? CalendarX2
      : state === 'suspended'
        ? Ban
        : credentialIcons[credential.kind]
  const label =
    state === 'suspended'
      ? 'Suspended'
      : credential.last4
        ? `••••${credential.last4}`
        : credential.kind === 'pin'
          ? 'PIN'
          : 'Enrolled'
  const kind = credential.kind === 'qr-pass' ? 'QR pass' : credential.kind
  return (
    <span
      title={`${kind}${credential.last4 ? ` ending ${credential.last4}` : ''} · ${state}`}
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded border px-2 py-[3px] font-mono text-[11px] leading-4 whitespace-nowrap',
        state === 'expired'
          ? 'border-sev-critical/40 bg-sev-critical-bg/40 text-sev-critical-fg'
          : 'border-border bg-surface-4',
        state === 'suspended' && 'font-sans text-subtle-foreground',
        state === 'active' &&
          (secondary ? 'text-muted-foreground' : 'text-foreground'),
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          'size-3 shrink-0',
          state === 'active' && !secondary && 'text-brand',
        )}
      />
      <span className="sr-only">{kind} </span>
      {label}
    </span>
  )
}

export function GroupChip({
  group,
  struck,
}: {
  group: AccessGroup
  struck?: boolean
}) {
  return (
    <span
      title={`${group.name} · ${group.schedule}`}
      className={cn(
        'inline-flex max-w-[170px] items-center gap-1 rounded border border-border bg-surface-2 px-2 py-0.5 text-[11px] leading-4',
        struck ? 'text-subtle-foreground line-through' : 'text-foreground',
      )}
    >
      {group.restricted && (
        <Lock aria-label="Restricted" className="size-3 shrink-0 text-warn" />
      )}
      <span className="line-clamp-2">{group.name}</span>
    </span>
  )
}

/** "HIGH · ACCESS EXTENSION". */
export function ReviewTag({ item }: { item: ReviewItem }) {
  const s = reviewSeverityStyle(item.severity)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border px-[7px] py-px font-mono text-[10px] leading-[15px] whitespace-nowrap uppercase',
        s.tag,
      )}
    >
      {s.short} · {reviewKindLabel(item.kind)}
    </span>
  )
}

export type FilterOption = { value: string; label: string }

/** "Org: All organizations ▾" dropdown in the directory toolbar. */
export function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded border bg-surface-3 px-2.5 text-xs font-medium whitespace-nowrap outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring',
          value === 'all' ? 'border-border' : 'border-brand/50',
        )}
      >
        <span className="text-subtle-foreground">{label}:</span>
        <span className="max-w-48 truncate">{current.label}</span>
        <ChevronDown aria-hidden className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-auto min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((o) => (
              <DropdownMenuRadioItem
                key={o.value}
                value={o.value}
                className="text-xs"
              >
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Confirmation for changes that remove access. Restoring access never needs
 * one; removing it always asks for a reason, which goes to the audit trail.
 */
export function ConfirmRemoval({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setReason('')
        onOpenChange(o)
      }}
    >
      <DialogContent className="border border-border bg-surface-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs leading-5">
            {description}
          </DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="pb-1.5 text-xs font-medium">
            Reason (required, logged to the audit trail)
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {removalReasons.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                onClick={() => setReason(r)}
                className={cn(
                  'rounded border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  reason === r
                    ? 'border-brand bg-brand/20 text-brand-text'
                    : 'border-border text-muted-foreground hover:bg-surface-5 hover:text-foreground',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
        <DialogFooter className="border-border bg-surface-2">
          <button
            type="button"
            className={outlineButton}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason}
            onClick={() => {
              onConfirm(reason)
              setReason('')
              onOpenChange(false)
            }}
            className="inline-flex h-7 items-center rounded bg-sev-critical px-3 text-xs font-semibold text-white outline-none hover:bg-sev-critical/85 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import type { VariantProps } from 'class-variance-authority'
import { ArrowUp, BellOff, Check, Lock, X, type LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { actionButtonVariants, severityStyles } from '@/lib/console/styles'
import { confidenceBand, formatConfidence } from '@/lib/console/format'
import type { AccessOutcome, Severity, Signal } from '@/types'

// Small building blocks shared by the KPI strip, both lanes and the drawer.
// Colors come only from the console tokens in index.css.

/** "CRITICAL" tag at the start of an exception card. */
export function SeverityBadge({
  severity,
  classified,
}: {
  severity: Severity
  classified?: boolean
}) {
  const s = severityStyles[severity]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded px-2 py-0.5 font-mono text-[11px] leading-4 font-bold tracking-[0.05em] uppercase',
        classified ? 'bg-surface-5 text-muted-foreground' : [s.bg, s.fg],
      )}
    >
      {classified ? 'Classified' : s.label}
    </span>
  )
}

/** Colored left edge of a card; decorative, severity is also in the badge. */
export function SeverityStrip({
  severity,
  muted,
}: {
  severity: Severity
  muted?: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute inset-y-0 left-0 w-1 rounded-l-lg',
        muted ? 'bg-muted-foreground' : severityStyles[severity].strip,
      )}
    />
  )
}

/**
 * Severity filter chip, used both in the Needs-you filter strip and in the
 * Open exceptions KPI so the two always look and behave the same.
 */
export function SeverityChip({
  severity,
  count,
  pressed,
  onClick,
  variant = 'label',
}: {
  severity: Severity | 'all'
  count: number
  pressed: boolean
  onClick: () => void
  /** "label": "High (2)"; "count": "2 High" with icon (KPI card). */
  variant?: 'label' | 'count'
}) {
  const s = severity === 'all' ? null : severityStyles[severity]
  const Icon = s?.icon
  const name = s ? s.label : 'All'
  const short = severity === 'medium' ? 'Med' : name
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded px-2 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        s ? [s.bg, s.fg] : 'bg-surface-5 text-foreground',
        variant === 'count' && 'font-mono text-[11px]',
        pressed
          ? 'font-medium ring-1 ring-current'
          : 'opacity-90 hover:opacity-100',
      )}
    >
      {variant === 'count' ? (
        <>
          {Icon && <Icon aria-hidden className="size-3" />}
          {count} {short}
        </>
      ) : (
        <>
          {name} ({count})
        </>
      )}
    </button>
  )
}

const outcomeStyles: Record<
  AccessOutcome,
  { className: string; icon: LucideIcon; label: string }
> = {
  admitted: {
    className: 'bg-ok-bg/60 text-ok-fg',
    icon: Check,
    label: 'Admitted',
  },
  denied: {
    className: 'bg-sev-critical-bg/80 text-sev-critical-fg',
    icon: X,
    label: 'Denied',
  },
  relocked: {
    className: 'bg-surface-5 text-brand',
    icon: Lock,
    label: 'Relocked',
  },
  suppressed: {
    className: 'bg-surface-5 text-muted-foreground',
    icon: BellOff,
    label: 'Suppressed',
  },
}

export function OutcomeBadge({
  outcome,
  size = 'sm',
}: {
  outcome: AccessOutcome
  size?: 'sm' | 'md'
}) {
  const o = outcomeStyles[outcome]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded whitespace-nowrap',
        size === 'sm'
          ? 'px-1.5 py-0.5 text-[11px] leading-4'
          : 'px-2 py-0.5 text-[11px] leading-4 font-medium',
        o.className,
      )}
    >
      <o.icon aria-hidden className="size-3" />
      {o.label}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded bg-surface-3 px-1 font-mono text-[11px] leading-4 text-muted-foreground">
      {children}
    </kbd>
  )
}

export function StatusDot({
  tone,
  pulse,
  className,
}: {
  tone: 'ok' | 'bad' | 'warn' | 'muted'
  pulse?: boolean
  className?: string
}) {
  const color = {
    ok: 'bg-ok',
    bad: 'bg-sev-critical',
    warn: 'bg-warn',
    muted: 'bg-muted-foreground',
  }[tone]
  return (
    <span
      aria-hidden
      className={cn('relative inline-flex size-1.5 shrink-0', className)}
    >
      {pulse && (
        <span
          className={cn(
            'absolute inset-0 animate-ping rounded-full opacity-75 motion-reduce:hidden',
            color,
          )}
        />
      )}
      <span
        className={cn('relative inline-flex size-full rounded-full', color)}
      />
    </span>
  )
}

/** "↑ 3 new events" button shown while the stream is paused. */
export function NoticePill({
  children,
  hint,
  tone = 'brand',
  onClick,
}: {
  children: ReactNode
  hint: string
  tone?: 'brand' | 'ok' | 'critical'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-full px-3 py-1 text-left text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
        tone === 'critical'
          ? 'bg-sev-critical-bg text-sev-critical-fg'
          : 'bg-surface-4',
        tone === 'brand' && 'text-brand',
        tone === 'ok' && 'text-ok',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <ArrowUp aria-hidden className="size-3 shrink-0" />
        <span className="truncate">{children}</span>
      </span>
      <span className="shrink-0 text-[11px] font-normal text-muted-foreground">
        {hint}
      </span>
    </button>
  )
}

const bandColor = {
  high: { text: 'text-ok', bar: 'bg-ok' },
  medium: { text: 'text-sev-high-fg', bar: 'bg-sev-high' },
  low: { text: 'text-sev-critical-fg', bar: 'bg-sev-critical' },
}

/** Confidence as number + band word (+ optional bar). Never color alone. */
export function Confidence({
  value,
  bar,
  label = 'Confidence',
}: {
  value: number | null
  bar?: boolean
  label?: string
}) {
  const band = value === null ? null : confidenceBand(value)
  const color = band ? bandColor[band] : null
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-[11px] leading-4">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-mono font-bold whitespace-nowrap',
            color?.text ?? 'text-muted-foreground',
          )}
        >
          {formatConfidence(value)}
        </span>
      </div>
      {bar && value !== null && (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-5"
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value * 100)}
        >
          <div
            className={cn('h-full rounded-full', color?.bar)}
            style={{ width: `${value * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

const toneText = {
  ok: 'text-ok',
  bad: 'text-sev-critical-fg font-bold',
  warn: 'text-sev-high-fg',
  neutral: 'text-foreground',
}

/** Sensor readings behind a decision, in a terminal-style inset. */
export function SignalList({
  signals,
  title,
  mask = (v) => v,
}: {
  signals: Signal[]
  title?: string
  mask?: (value: string) => string
}) {
  return (
    <div className="flex flex-col gap-1 rounded bg-surface-0 p-2.5 font-mono text-[11px] leading-4">
      {title && (
        <p className="text-[11px] font-bold tracking-[0.05em] text-muted-foreground uppercase">
          {title}
        </p>
      )}
      <dl className="flex flex-col gap-0.5">
        {signals.map((s) => (
          <div key={s.label} className="flex flex-wrap justify-between gap-x-3">
            <dt className="text-muted-foreground">{s.label}</dt>
            <dd className={cn('text-right', toneText[s.tone])}>
              {mask(s.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Uppercase section label ("WHY THE SYSTEM DID THIS"). */
export function SectionLabel({
  children,
  as: Tag = 'h3',
  className,
}: {
  children: ReactNode
  as?: 'h2' | 'h3' | 'p'
  className?: string
}) {
  return (
    <Tag
      className={cn(
        'font-mono text-[11px] leading-4 font-normal tracking-[0.05em] text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function ActionButton({
  tone,
  className,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof actionButtonVariants>) {
  return (
    <button
      type="button"
      className={cn(actionButtonVariants({ tone }), className)}
      {...props}
    />
  )
}

/** Skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded bg-surface-5 motion-reduce:animate-none',
        className,
      )}
    />
  )
}

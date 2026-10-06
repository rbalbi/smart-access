import {
  Ban,
  Camera,
  Eye,
  Flag,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConsole } from '@/hooks/useConsole'
import { useNow } from '@/hooks/useNow'
import { overrideReasons } from '@/lib/console/actions'
import {
  displayName,
  formatCredential,
  formatRelativeDay,
  formatTime,
  initials,
  maskFreeText,
  nowIso,
  timeZoneAbbr,
} from '@/lib/console/format'
import { nextAuditId } from '@/lib/console/state'
import { showDecisionToast } from '@/lib/console/toast'
import { cn } from '@/lib/utils'
import type { AccessEvent } from '@/types'
import {
  ActionButton,
  Confidence,
  Kbd,
  OutcomeBadge,
  SectionLabel,
  SignalList,
} from './primitives'

/**
 * Details for one automatic decision. It covers the Handled lane only, so the
 * Needs-you list never moves while it is open.
 */
export function EventDrawer({ className }: { className?: string }) {
  const { state, dispatch } = useConsole()
  const event = state.events.find((e) => e.id === state.selectedEventId)

  useEffect(() => {
    dispatch({ type: 'auto-pause', reason: 'drawer-open', active: !!event })
  }, [event, dispatch])

  if (!event) return null
  return <DrawerBody key={event.id} event={event} className={className} />
}

function DrawerBody({
  event,
  className,
}: {
  event: AccessEvent
  className?: string
}) {
  const { state, dispatch, announce } = useConsole()
  const tz = state.site.timeZone
  const titleId = useId()
  const reasonId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [reason, setReason] = useState<string | null>(null)
  const revealed = state.revealed.includes(event.id)
  const decisions = state.decisions.filter((d) => d.targetId === event.id)
  const revoked = decisions.find((d) => d.action === 'revoke')
  const flagged = decisions.find((d) => d.action === 'flag')
  const feedback = state.feedback[event.id]
  const disabled = state.connection === 'lost'
  const mask = (text: string) => maskFreeText(text, state.privacy)
  const now = useNow(30_000)

  const close = useCallback(() => {
    dispatch({ type: 'select-event', eventId: null })
    // Return focus to the row that opened the drawer.
    requestAnimationFrame(() =>
      document.getElementById(`event-${event.id}`)?.focus(),
    )
  }, [dispatch, event.id])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const override = (kind: 'revoke' | 'flag') => {
    const at = nowIso()
    const auditId = nextAuditId(state, at)
    dispatch({
      type: 'override-event',
      eventId: event.id,
      kind,
      reason: reason ?? undefined,
      at,
    })
    const title =
      kind === 'revoke'
        ? `Today’s access revoked · ${event.location}`
        : `Flagged for manager review · ${event.location}`
    showDecisionToast({ title, auditId })
    announce(`${title}. Logged to audit trail ${auditId}.`)
  }

  const person = event.subject
  const name = person
    ? displayName(person, { privacy: state.privacy, revealed })
    : (event.headline ?? 'Automatic action')

  return (
    <aside
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border-l border-border bg-surface-3 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border bg-surface-4 p-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <OutcomeBadge outcome={event.outcome} size="md" />
            <h2 id={titleId} className="text-sm leading-5 font-semibold">
              {event.location} · {formatTime(event.occurredAt, tz)}
            </h2>
          </div>
          <p className="font-mono text-[11px] text-subtle-foreground">
            Event ID: {event.id}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
            <Kbd>Esc</Kbd> to close
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close details"
            className="inline-flex size-7 items-center justify-center rounded text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 overflow-y-auto p-5">
        <section className="flex flex-col gap-2">
          <SectionLabel>1. What happened</SectionLabel>
          <div className="flex flex-col gap-2 rounded-lg bg-surface-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                {person && (
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-5 text-xs font-bold text-brand"
                  >
                    {initials(person, { privacy: state.privacy })}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm leading-5 font-semibold">
                    {name}
                  </p>
                  <p className="text-[11px] leading-4 text-muted-foreground">
                    {person
                      ? [person.roleLabel, person.org]
                          .filter(Boolean)
                          .join(' · ')
                      : event.context}
                  </p>
                </div>
              </div>
              {event.subject && event.context && (
                <span className="shrink-0 rounded bg-surface-5 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {event.context}
                </span>
              )}
            </div>
            {person && !revealed && (
              <button
                type="button"
                disabled={state.privacy}
                onClick={() =>
                  dispatch({
                    type: 'reveal-name',
                    targetId: event.id,
                    name,
                    at: nowIso(),
                  })
                }
                className="flex w-fit items-center gap-1 text-[11px] text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:text-subtle-foreground disabled:no-underline"
              >
                <Eye aria-hidden className="size-3" />
                {state.privacy
                  ? 'Names hidden in privacy mode'
                  : 'Reveal full name (logged)'}
              </button>
            )}
            {(event.credential || event.authorizationWindow) && (
              <dl className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-[11px] leading-4">
                {event.credential && (
                  <div>
                    <dt className="text-subtle-foreground">Credential</dt>
                    <dd className="font-mono">
                      {formatCredential(event.credential)}
                    </dd>
                  </div>
                )}
                {event.authorizationWindow && (
                  <div>
                    <dt className="text-subtle-foreground">
                      Authorization window
                    </dt>
                    <dd className="font-mono">
                      {event.authorizationWindow} {timeZoneAbbr(tz)}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>2. Why the system did this</SectionLabel>
          <div className="flex flex-col gap-3 rounded-lg bg-surface-2 p-3">
            <div>
              <p className="text-[11px] text-subtle-foreground">
                Policy applied
              </p>
              <p className="text-xs font-semibold">
                “{event.reasoning.policy}”{' '}
                <span className="font-mono font-normal text-brand-text">
                  {event.reasoning.policyVersion}
                </span>
              </p>
            </div>
            <Confidence value={event.reasoning.confidence} bar />
            <SignalList
              signals={event.reasoning.signals}
              title="Sensor readings"
              mask={mask}
            />
            {state.role === 'security' && !state.privacy && event.cameraId && (
              <figure className="flex aspect-video max-h-36 flex-col items-center justify-center gap-1 rounded border border-dashed border-border bg-surface-0 text-muted-foreground">
                <Camera aria-hidden className="size-5" />
                <figcaption className="font-mono text-[11px]">
                  Camera still · {event.cameraId} (not available in demo)
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionLabel>3. Audit timeline</SectionLabel>
          <ol className="ml-1.5 flex flex-col gap-3 border-l border-border pl-4">
            {[
              ...event.timeline,
              ...decisions.map((d) => ({
                at: d.at,
                text: `${d.label}${d.note ? ` (${d.note})` : ''} · ${d.auditId}`,
                actor: d.actor,
                emphasis: 'override' as const,
              })),
            ].map((entry, i) => (
              <li key={i} className="relative flex flex-col gap-0.5">
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-1 -left-[22.5px] size-3 rounded-full border border-border',
                    entry.emphasis === 'current' &&
                      'border-none bg-brand ring-2 ring-surface-1',
                    entry.emphasis === 'outcome' && 'border-none bg-ok',
                    entry.emphasis === 'override' && 'border-none bg-sev-high',
                    !entry.emphasis && 'bg-surface-5',
                  )}
                />
                <time
                  dateTime={entry.at}
                  className={cn(
                    'font-mono text-[11px] leading-4',
                    entry.emphasis === 'current' && 'font-bold text-brand',
                    entry.emphasis === 'outcome' && 'text-ok',
                    !entry.emphasis && 'text-subtle-foreground',
                    entry.emphasis === 'override' && 'text-sev-high-fg',
                  )}
                >
                  {formatRelativeDay(entry.at, now, tz)}
                </time>
                <p
                  className={cn(
                    'text-xs leading-4',
                    entry.emphasis
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {mask(entry.text)}
                  {entry.actor && !state.privacy && (
                    <>
                      {' · '}
                      <span className="font-semibold text-foreground">
                        {entry.actor}
                      </span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="flex flex-col gap-3 rounded-lg bg-surface-2 p-4"
          aria-labelledby={`${titleId}-override`}
        >
          <div className="flex items-center justify-between">
            <h3
              id={`${titleId}-override`}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck aria-hidden className="size-3.5" />
              Human override
            </h3>
            <span className="font-mono text-[11px] text-ok">
              Every action is audited
            </span>
          </div>

          {event.credential && event.outcome === 'admitted' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor={reasonId}
                className="text-[11px] text-muted-foreground"
              >
                Reason (required to revoke)
              </label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as string | null)}
                disabled={!!revoked || disabled}
              >
                <SelectTrigger
                  id={reasonId}
                  size="sm"
                  className="h-8 w-full border-none bg-surface-3 text-xs"
                >
                  <SelectValue placeholder="Select a reason…" />
                </SelectTrigger>
                <SelectContent>
                  {overrideReasons.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ActionButton
                tone="danger"
                className="h-8 w-full"
                disabled={!reason || !!revoked || disabled}
                onClick={() => override('revoke')}
              >
                <Ban aria-hidden />
                {revoked
                  ? 'Today’s access revoked'
                  : 'Revoke today’s access for this credential'}
              </ActionButton>
            </div>
          )}
          <ActionButton
            className="h-8 w-full"
            disabled={!!flagged || disabled}
            onClick={() => override('flag')}
          >
            <Flag aria-hidden />
            {flagged
              ? 'Flagged for manager review'
              : 'Flag event for manager review'}
          </ActionButton>
          {disabled && (
            <p className="text-[11px] text-sev-critical-fg">
              Overrides are paused until the console reconnects.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p
              id={`${titleId}-fb`}
              className="text-[11px] text-muted-foreground"
            >
              Was this system decision right?
            </p>
            <div
              role="group"
              aria-labelledby={`${titleId}-fb`}
              className="flex gap-1.5"
            >
              {(['yes', 'no'] as const).map((value) => (
                <ActionButton
                  key={value}
                  tone={feedback === value ? 'soft' : 'secondary'}
                  aria-pressed={feedback === value}
                  disabled={!!feedback}
                  onClick={() =>
                    dispatch({
                      type: 'feedback',
                      eventId: event.id,
                      value,
                      at: nowIso(),
                    })
                  }
                >
                  {value === 'yes' ? (
                    <ThumbsUp aria-hidden />
                  ) : (
                    <ThumbsDown aria-hidden />
                  )}
                  {value === 'yes' ? 'Yes' : 'No'}
                </ActionButton>
              ))}
            </div>
          </div>
          <p className="font-mono text-[11px] leading-4 text-subtle-foreground">
            {feedback
              ? 'Thanks. Your feedback is logged and used to tune autonomy.'
              : `Decided automatically by SmartAccess · ${event.id}`}
          </p>
        </section>
      </div>
    </aside>
  )
}

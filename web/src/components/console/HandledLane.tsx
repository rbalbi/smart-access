import {
  ArrowRight,
  ChevronRight,
  CloudOff,
  Flag,
  Search,
  ShieldOff,
} from 'lucide-react'
import { Link } from 'react-router'
import { useConsole } from '@/hooks/useConsole'
import {
  displayName,
  formatClock,
  formatCredential,
  formatNumber,
  formatTime,
} from '@/lib/console/format'
import { visibleEvents, type OutcomeFilter } from '@/lib/console/state'
import { cn } from '@/lib/utils'
import type { AccessEvent, Decision } from '@/types'
import { NoticePill, OutcomeBadge, StatusDot } from './primitives'

const outcomeTabs: { value: OutcomeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'admitted', label: 'Admitted' },
  { value: 'denied', label: 'Denied' },
  { value: 'actions', label: 'Actions' },
]

export function HandledLane({ className }: { className?: string }) {
  const { state, dispatch } = useConsole()
  const events = visibleEvents(state)
  const pending = state.pendingEvents.length

  return (
    <section
      aria-labelledby="handled-heading"
      className={cn('flex flex-col rounded-xl bg-surface-2', className)}
    >
      <header className="sticky top-14 z-10 flex flex-col gap-2 rounded-t-xl bg-surface-2/95 px-4 pt-4 pb-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2">
            <h2
              id="handled-heading"
              className="text-base leading-6 font-semibold tracking-[-0.025em]"
            >
              Handled automatically
            </h2>
            <span className="rounded-full bg-ok-bg px-2 py-0.5 font-mono text-xs whitespace-nowrap text-ok-fg">
              {formatNumber(state.today.handled)} today
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono text-[11px] whitespace-nowrap text-ok">
            <StatusDot tone="ok" />
            No human touch needed
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div
            role="group"
            aria-label="Filter by outcome"
            className="flex gap-1"
          >
            {outcomeTabs.map((tab) => {
              const pressed = state.stream.outcome === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() =>
                    dispatch({
                      type: 'set-stream-filter',
                      stream: { outcome: tab.value },
                    })
                  }
                  className={cn(
                    'h-6 rounded px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pressed
                      ? 'bg-surface-5 font-medium text-foreground'
                      : 'bg-surface-3 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="relative w-36">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              aria-label="Filter the handled stream"
              placeholder="Filter stream…"
              value={state.stream.query}
              onChange={(e) =>
                dispatch({
                  type: 'set-stream-filter',
                  stream: { query: e.target.value },
                })
              }
              className="h-7 w-full rounded bg-surface-3 pr-2 pl-6 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
        </div>
        {pending > 0 && (
          <NoticePill
            tone="ok"
            hint="Show"
            onClick={() => dispatch({ type: 'show-pending', lane: 'events' })}
          >
            {pending} new event{pending > 1 ? 's' : ''} handled automatically
          </NoticePill>
        )}
      </header>

      <ol
        aria-label="Automatic decisions, newest first"
        className="flex flex-1 flex-col gap-1 p-2"
      >
        {events.map((event) => (
          <li key={event.id}>
            <EventRow
              event={event}
              selected={state.selectedEventId === event.id}
              decisions={state.decisions.filter((d) => d.targetId === event.id)}
            />
          </li>
        ))}
        {events.length === 0 && (
          <li className="px-3 py-10 text-center text-xs text-muted-foreground">
            No events match this filter.
          </li>
        )}
      </ol>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-border bg-surface-3 px-3 py-3 text-xs">
        <span className="text-muted-foreground">
          Showing today only ({formatNumber(state.today.handled)} events)
        </span>
        <Link
          to="/audit-log"
          className="flex items-center gap-1 font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          See full history in Audit log
          <ArrowRight aria-hidden className="size-3" />
        </Link>
      </footer>
    </section>
  )
}

function EventRow({
  event,
  selected,
  decisions,
}: {
  event: AccessEvent
  selected: boolean
  decisions: Decision[]
}) {
  const { state, dispatch } = useConsole()
  const tz = state.site.timeZone
  const who = event.subject
    ? displayName(event.subject, {
        privacy: state.privacy,
        revealed: state.revealed.includes(event.id),
      })
    : event.headline
  const context = event.subject
    ? state.privacy
      ? undefined
      : event.subject.org
    : event.context
  const where = [
    event.location,
    event.credential && formatCredential(event.credential),
  ]
    .filter(Boolean)
    .join(' · ')
  const revoked = decisions.some((d) => d.action === 'revoke')
  const flagged = decisions.some((d) => d.action === 'flag')

  return (
    <button
      type="button"
      id={`event-${event.id}`}
      aria-current={selected ? 'true' : undefined}
      aria-label={`${event.outcome} at ${formatTime(event.occurredAt, tz)}: ${who}, ${where}. Open details`}
      onClick={() =>
        dispatch({ type: 'select-event', eventId: selected ? null : event.id })
      }
      className={cn(
        'flex h-14 w-full items-center justify-between gap-3 rounded-lg px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-l-2 border-brand bg-surface-5/80 pl-3.5'
          : 'hover:bg-surface-5/50',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <time
          dateTime={event.occurredAt}
          className={cn(
            'shrink-0 font-mono text-[11px]',
            selected ? 'font-bold text-brand-text' : 'text-subtle-foreground',
          )}
        >
          {formatClock(event.occurredAt, tz)}
        </time>
        <OutcomeBadge outcome={event.outcome} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-xs leading-4">
            {who}
            {context && (
              <span className="text-subtle-foreground"> · {context}</span>
            )}
          </span>
          <span className="truncate font-mono text-[11px] leading-4 text-subtle-foreground">
            {where}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {(revoked || flagged || event.recordedOffline) && (
          <span className="flex flex-col items-end gap-0.5">
            {revoked && (
              <Tag icon={<ShieldOff aria-hidden className="size-3" />}>
                Revoked
              </Tag>
            )}
            {flagged && !revoked && (
              <Tag icon={<Flag aria-hidden className="size-3" />}>Flagged</Tag>
            )}
            {event.recordedOffline && (
              <Tag icon={<CloudOff aria-hidden className="size-3" />}>
                Recorded offline
              </Tag>
            )}
          </span>
        )}
        <span className="flex max-w-28 flex-col items-end text-right">
          {event.reasoning.confidence === null ? (
            <span className="text-[11px] leading-4 text-muted-foreground">
              Rule-based
            </span>
          ) : (
            <span className="font-mono text-[11px] leading-4 text-ok">
              {Math.round(event.reasoning.confidence * 100)}%
              <span className="sr-only"> confidence</span>
            </span>
          )}
          <span
            className={cn(
              'w-full truncate text-[11px] leading-4',
              selected ? 'text-brand-soft' : 'text-subtle-foreground',
            )}
          >
            {event.reasoning.policyShort}
          </span>
        </span>
        <ChevronRight
          aria-hidden
          className={cn(
            'size-3.5',
            selected ? 'text-brand' : 'text-subtle-foreground',
          )}
        />
      </span>
    </button>
  )
}

function Tag({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-surface-4 px-1.5 text-[11px] leading-4 whitespace-nowrap text-muted-foreground">
      {icon}
      {children}
    </span>
  )
}

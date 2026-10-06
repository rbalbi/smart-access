import { CircleCheckBig, SearchX, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConsole } from '@/hooks/useConsole'
import { useNow } from '@/hooks/useNow'
import type { ExceptionAction } from '@/lib/console/actions'
import { displayName } from '@/lib/console/format'
import {
  chipCounts,
  isPaused,
  nextAuditId,
  REVERSE_WINDOW_MS,
  visibleExceptions,
  type SeverityFilter,
} from '@/lib/console/state'
import { showDecisionToast } from '@/lib/console/toast'
import { cn } from '@/lib/utils'
import type { ExceptionItem, ExceptionType } from '@/types'
import { ExceptionCard } from './ExceptionCard'
import { NoticePill, SeverityChip, Skeleton } from './primitives'

const typeOptions: { value: ExceptionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'forced-door', label: 'Forced door' },
  { value: 'tailgating', label: 'Tailgating' },
  { value: 'badge-denied', label: 'Badge denied' },
  { value: 'door-held-open', label: 'Door held open' },
  { value: 'visitor-no-invite', label: 'Visitor without invite' },
  { value: 'controller-offline', label: 'Controller offline' },
  { value: 'controller-battery', label: 'Controller on battery' },
  { value: 'restricted-area', label: 'Restricted area' },
]

const severities: SeverityFilter[] = [
  'all',
  'critical',
  'high',
  'medium',
  'low',
]

export function NeedsYouLane({ className }: { className?: string }) {
  const { state, dispatch, announce, scenario } = useConsole()
  const now = useNow(1000)
  const items = scenario === 'empty' ? [] : visibleExceptions(state)
  const counts = chipCounts(state)
  const disabled = state.connection === 'lost'
  const pending = state.pendingExceptions
  const pendingCritical = pending.filter((e) => e.severity === 'critical')

  // Critical items start with their reasoning open; the rest start closed.
  const [whyOpen, setWhyOpen] = useState<Record<string, boolean>>({})
  const isWhyOpen = (e: ExceptionItem) =>
    whyOpen[e.id] ?? e.severity === 'critical'
  const anyWhyOpen = items.some(isWhyOpen)
  useEffect(() => {
    dispatch({ type: 'auto-pause', reason: 'why-open', active: anyWhyOpen })
  }, [anyWhyOpen, dispatch])

  // Pause while the pointer or keyboard focus is in this lane, so cards
  // never move under the person working through them.
  const laneRef = useRef<HTMLElement>(null)
  const hover = useRef(false)
  const focus = useRef(false)
  const syncLanePause = useCallback(() => {
    dispatch({
      type: 'auto-pause',
      reason: 'lane-focus',
      active: hover.current || focus.current,
    })
  }, [dispatch])

  // After a decision, move focus to the next card (or the lane heading).
  const focusAfter = useRef<string | null>(null)
  useEffect(() => {
    if (focusAfter.current === null) return
    const target = focusAfter.current
    focusAfter.current = null
    const el =
      document.getElementById(`exception-${target}`) ??
      document.getElementById('needs-you-heading')
    el?.focus()
  })

  const decide = (
    item: ExceptionItem,
    action: ExceptionAction,
    note?: string,
  ) => {
    const index = items.findIndex((e) => e.id === item.id)
    const next = items[index + 1] ?? items[index - 1]
    focusAfter.current = next?.id ?? ''
    const at = new Date().toISOString()
    dispatch({
      type: 'decide',
      exceptionId: item.id,
      actionId: action.id,
      note,
      at,
    })
    const subject = item.subject
      ? `${displayName(item.subject, { privacy: state.privacy })}, `
      : ''
    const title = `${action.pastTense} · ${subject}${item.location}`
    const auditId = nextAuditId(state, at)
    showDecisionToast({
      title,
      auditId,
      reversibleUntil: new Date(
        Date.parse(at) + REVERSE_WINDOW_MS,
      ).toISOString(),
      onReverse: () => {
        dispatch({ type: 'reverse', auditId, at: new Date().toISOString() })
        announce(`Reversed: ${action.pastTense}. The exception is open again.`)
      },
    })
    announce(`${title}. Logged to audit trail ${auditId}.`)
  }

  const filtersActive =
    state.filters.severity !== 'all' ||
    state.filters.type !== 'all' ||
    state.filters.assignedToMe ||
    state.search.trim() !== ''

  return (
    <section
      ref={laneRef}
      aria-labelledby="needs-you-heading"
      className={cn('flex flex-col rounded-xl bg-surface-2', className)}
      onPointerEnter={() => {
        hover.current = true
        syncLanePause()
      }}
      onPointerLeave={() => {
        hover.current = false
        syncLanePause()
      }}
      onFocus={() => {
        focus.current = true
        syncLanePause()
      }}
      onBlur={(e) => {
        if (laneRef.current?.contains(e.relatedTarget as Node)) return
        focus.current = false
        syncLanePause()
      }}
    >
      <header className="sticky top-14 z-10 flex flex-col gap-0.5 rounded-t-xl bg-surface-2/95 px-4 pt-4 pb-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2.5">
            <h2
              id="needs-you-heading"
              tabIndex={-1}
              className="text-base leading-6 font-semibold tracking-[-0.025em] outline-none"
            >
              Needs you
            </h2>
            <span className="rounded-full bg-sev-critical-bg px-2 py-0.5 font-mono text-xs font-bold text-sev-critical-fg">
              {counts.all}
              <span className="sr-only"> open exceptions</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Routed by policy rules or low confidence
          </p>
        </div>
        <p className="pb-2.5 text-xs text-muted-foreground">
          Exceptions the system routed to a person. Everything else is handled
          automatically.
        </p>

        <div className="flex flex-col gap-2 rounded-lg bg-surface-3 p-2">
          <div
            role="group"
            aria-label="Filter by severity"
            className="flex flex-wrap gap-1"
          >
            {severities.map((sev) => (
              <SeverityChip
                key={sev}
                severity={sev}
                count={counts[sev]}
                pressed={state.filters.severity === sev}
                onClick={() =>
                  dispatch({ type: 'set-filter', filters: { severity: sev } })
                }
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              items={typeOptions}
              value={state.filters.type}
              onValueChange={(value) =>
                dispatch({
                  type: 'set-filter',
                  filters: { type: (value ?? 'all') as ExceptionType | 'all' },
                })
              }
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter by exception type"
                className="h-7 min-w-36 border-none bg-surface-4 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Checkbox
                checked={state.filters.assignedToMe}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: 'set-filter',
                    filters: { assignedToMe: checked },
                  })
                }
              />
              Assigned to me
            </label>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="pt-2">
            <NoticePill
              tone={pendingCritical.length ? 'critical' : 'brand'}
              hint="Show"
              onClick={() => {
                dispatch({ type: 'show-pending', lane: 'exceptions' })
                const first = pendingCritical[0] ?? pending[0]
                focusAfter.current = first.id
              }}
            >
              {pendingCritical.length
                ? `${pendingCritical.length} new critical exception${pendingCritical.length > 1 ? 's' : ''} (${pendingCritical[0].location})`
                : `${pending.length} new exception${pending.length > 1 ? 's' : ''} arrived`}
              {pendingCritical.length > 0 &&
              pending.length > pendingCritical.length
                ? ` + ${pending.length - pendingCritical.length} more`
                : ''}
            </NoticePill>
          </div>
        )}
        {disabled && (
          <p
            role="status"
            className="mt-2 flex items-center gap-1.5 rounded bg-sev-critical-bg px-2.5 py-1.5 text-xs text-sev-critical-fg"
          >
            <WifiOff aria-hidden className="size-3.5" />
            Decisions are paused until the console reconnects.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-3.5 p-4" aria-live="off">
        {items.map((item) => (
          <ExceptionCard
            key={item.id}
            item={item}
            role={state.role}
            privacy={state.privacy}
            timeZone={state.site.timeZone}
            now={now}
            disabled={disabled}
            whyOpen={isWhyOpen(item)}
            onWhyOpenChange={(open) =>
              setWhyOpen((m) => ({ ...m, [item.id]: open }))
            }
            onDecide={(action, note) => decide(item, action, note)}
            onAssignToMe={() =>
              dispatch({
                type: 'assign-to-me',
                exceptionId: item.id,
                at: new Date().toISOString(),
              })
            }
            onAddNote={(note) => {
              dispatch({
                type: 'add-note',
                exceptionId: item.id,
                note,
                at: new Date().toISOString(),
              })
              announce('Note added to the audit trail.')
            }}
          />
        ))}

        {items.length === 0 &&
          (filtersActive && scenario !== 'empty' ? (
            <EmptyState
              icon={<SearchX aria-hidden className="size-6" />}
              title="No exceptions match these filters"
              action={
                <button
                  type="button"
                  className="text-xs font-medium text-brand underline-offset-4 hover:underline"
                  onClick={() => {
                    dispatch({
                      type: 'set-filter',
                      filters: {
                        severity: 'all',
                        type: 'all',
                        assignedToMe: false,
                      },
                    })
                    dispatch({ type: 'set-search', search: '' })
                  }}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={<CircleCheckBig aria-hidden className="size-6 text-ok" />}
              title="Nothing needs you right now"
              body="New exceptions appear here as soon as the system routes them to a person."
            />
          ))}
      </div>
      {isPaused(state) && items.length > 0 && (
        <span className="sr-only">Live updates paused</span>
      )}
    </section>
  )
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-surface-3 px-6 py-12 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-sm font-semibold">{title}</p>
      {body && <p className="max-w-72 text-xs text-muted-foreground">{body}</p>}
      {action}
    </div>
  )
}

export function LaneSkeleton({ rows, tall }: { rows: number; tall?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={tall ? 'h-36 w-full' : 'h-14 w-full'} />
      ))}
    </div>
  )
}

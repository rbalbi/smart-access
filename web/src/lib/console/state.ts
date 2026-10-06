import type {
  AccessEvent,
  AccessOutcome,
  AuditEntry,
  ConnectionState,
  ConsoleSnapshot,
  Decision,
  Door,
  ExceptionItem,
  ExceptionType,
  Role,
  Severity,
  Site,
} from '@/types'
import { findAction } from './actions'

// Pure state for the Live Activity console. Everything here is testable
// without React; components dispatch actions and read selectors.

export const REVERSE_WINDOW_MS = 30_000

export type AutoPauseReason = 'lane-focus' | 'why-open' | 'drawer-open'

export type SeverityFilter = Severity | 'all'
export type OutcomeFilter = 'all' | 'admitted' | 'denied' | 'actions'

export type ConsoleState = {
  site: Site
  doors: Door[]
  role: Role
  actor: string
  privacy: boolean
  connection: ConnectionState
  /** When the last live update arrived; shown in the connection banner. */
  lastUpdateAt: string

  exceptions: ExceptionItem[]
  events: AccessEvent[]
  /** Arrived while paused; shown behind the "N new" pills. */
  pendingExceptions: ExceptionItem[]
  pendingEvents: AccessEvent[]

  manualPause: boolean
  autoPause: AutoPauseReason[]

  decisions: Decision[]
  audit: AuditEntry[]
  auditSeq: number
  /** Names the viewer chose to reveal (logged). */
  revealed: string[]
  feedback: Record<string, 'yes' | 'no'>

  today: { handled: number; total: number }
  weekAutonomy: number[]
  resolutionSeconds: number[]
  baselineResolutionSeconds: number

  filters: {
    severity: SeverityFilter
    type: ExceptionType | 'all'
    assignedToMe: boolean
  }
  stream: { outcome: OutcomeFilter; query: string }
  /** Top-bar search; narrows both lanes. */
  search: string
  selectedEventId: string | null
  /** Items closed by someone else while this viewer was looking. */
  resolvedElsewhere: string[]
}

export type ConsoleAction =
  | { type: 'receive-event'; event: AccessEvent; at: string }
  | { type: 'receive-exception'; exception: ExceptionItem; at: string }
  | { type: 'show-pending'; lane: 'exceptions' | 'events' }
  | { type: 'set-manual-pause'; paused: boolean }
  | { type: 'auto-pause'; reason: AutoPauseReason; active: boolean }
  | {
      type: 'decide'
      exceptionId: string
      actionId: string
      note?: string
      at: string
    }
  | { type: 'reverse'; auditId: string; at: string }
  | {
      type: 'override-event'
      eventId: string
      kind: 'revoke' | 'flag'
      reason?: string
      at: string
    }
  | { type: 'assign-to-me'; exceptionId: string; at: string }
  | { type: 'add-note'; exceptionId: string; note: string; at: string }
  | { type: 'resolved-elsewhere'; exceptionId: string; by: string; at: string }
  | { type: 'reveal-name'; targetId: string; name: string; at: string }
  | { type: 'feedback'; eventId: string; value: 'yes' | 'no'; at: string }
  | { type: 'set-role'; role: Role; actor: string }
  | { type: 'set-privacy'; privacy: boolean }
  | { type: 'set-connection'; connection: ConnectionState; at: string }
  | { type: 'set-filter'; filters: Partial<ConsoleState['filters']> }
  | { type: 'set-stream-filter'; stream: Partial<ConsoleState['stream']> }
  | { type: 'set-search'; search: string }
  | { type: 'select-event'; eventId: string | null }

export function initialState(
  snapshot: ConsoleSnapshot,
  opts: { role: Role; actor: string; now: string },
): ConsoleState {
  return {
    site: snapshot.site,
    doors: snapshot.doors,
    role: opts.role,
    actor: opts.actor,
    privacy: false,
    connection: 'live',
    lastUpdateAt: opts.now,
    exceptions: snapshot.exceptions,
    events: snapshot.events,
    pendingExceptions: [],
    pendingEvents: [],
    manualPause: false,
    autoPause: [],
    decisions: [],
    audit: [],
    // Continue the site's audit sequence (the design shows AUD-…-000981).
    auditSeq: 981,
    revealed: [],
    feedback: {},
    today: snapshot.today,
    weekAutonomy: snapshot.weekAutonomy,
    resolutionSeconds: snapshot.resolutionSeconds,
    baselineResolutionSeconds: snapshot.baselineResolutionSeconds,
    filters: { severity: 'all', type: 'all', assignedToMe: false },
    stream: { outcome: 'all', query: '' },
    search: '',
    selectedEventId: null,
    resolvedElsewhere: [],
  }
}

export function isPaused(state: ConsoleState) {
  return state.manualPause || state.autoPause.length > 0
}

/** The ID the next audit entry will get, e.g. AUD-0928-000982. */
export function nextAuditId(state: ConsoleState, at: string) {
  const mmdd = `${at.slice(5, 7)}${at.slice(8, 10)}`
  return `AUD-${mmdd}-${String(state.auditSeq + 1).padStart(6, '0')}`
}

function withAudit(
  state: ConsoleState,
  entry: Omit<AuditEntry, 'id'>,
): [ConsoleState, string] {
  const id = nextAuditId(state, entry.at)
  return [
    {
      ...state,
      auditSeq: state.auditSeq + 1,
      audit: [{ ...entry, id }, ...state.audit],
    },
    id,
  ]
}

export function reducer(
  state: ConsoleState,
  action: ConsoleAction,
): ConsoleState {
  switch (action.type) {
    case 'receive-event': {
      const today = {
        handled: state.today.handled + 1,
        total: state.today.total + 1,
      }
      const base = { ...state, today, lastUpdateAt: action.at }
      return isPaused(state)
        ? { ...base, pendingEvents: [action.event, ...state.pendingEvents] }
        : { ...base, events: [action.event, ...state.events] }
    }

    case 'receive-exception': {
      const today = { ...state.today, total: state.today.total + 1 }
      const base = { ...state, today, lastUpdateAt: action.at }
      return isPaused(state)
        ? {
            ...base,
            pendingExceptions: [action.exception, ...state.pendingExceptions],
          }
        : { ...base, exceptions: [action.exception, ...state.exceptions] }
    }

    case 'show-pending':
      return action.lane === 'events'
        ? {
            ...state,
            events: [...state.pendingEvents, ...state.events],
            pendingEvents: [],
          }
        : {
            ...state,
            exceptions: [...state.pendingExceptions, ...state.exceptions],
            pendingExceptions: [],
          }

    case 'set-manual-pause': {
      const next = { ...state, manualPause: action.paused }
      return isPaused(next) ? next : flushPending(next)
    }

    case 'auto-pause': {
      const without = state.autoPause.filter((r) => r !== action.reason)
      const next = {
        ...state,
        autoPause: action.active ? [...without, action.reason] : without,
      }
      // Once nothing is pausing the stream, queued items join the list so
      // newer items never land above older hidden ones.
      return isPaused(next) ? next : flushPending(next)
    }

    case 'decide': {
      const item = state.exceptions.find((e) => e.id === action.exceptionId)
      if (!item || item.status !== 'open' || state.connection === 'lost')
        return state
      const def = findAction(item.type, state.role, action.actionId)
      if (!def) return state
      if (def.requiresNote && !action.note?.trim()) return state

      const [audited, id] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `${def.pastTense} · ${item.title}, ${item.location}`,
        targetId: item.id,
      })
      const decision: Decision = {
        auditId: id,
        targetId: item.id,
        targetKind: 'exception',
        action: def.id,
        label: def.pastTense,
        actor: state.actor,
        at: action.at,
        note: action.note?.trim() || undefined,
        reversibleUntil: new Date(
          Date.parse(action.at) + REVERSE_WINDOW_MS,
        ).toISOString(),
      }
      const seconds =
        (Date.parse(action.at) - Date.parse(item.occurredAt)) / 1000
      return {
        ...audited,
        decisions: [decision, ...state.decisions],
        resolutionSeconds: [...state.resolutionSeconds, seconds],
        exceptions: state.exceptions.map((e) =>
          e.id === item.id
            ? {
                ...e,
                status: def.id === 'escalate' ? 'escalated' : 'resolved',
              }
            : e,
        ),
      }
    }

    case 'reverse': {
      const decision = state.decisions.find((d) => d.auditId === action.auditId)
      if (!decision || !canReverse(decision, action.at)) return state
      const [audited] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `Reversed ${decision.auditId} (${decision.label})`,
        targetId: decision.targetId,
      })
      return {
        ...audited,
        decisions: state.decisions.filter((d) => d !== decision),
        resolutionSeconds: state.resolutionSeconds.slice(0, -1),
        exceptions: state.exceptions.map((e) =>
          e.id === decision.targetId ? { ...e, status: 'open' } : e,
        ),
      }
    }

    case 'override-event': {
      const event = state.events.find((e) => e.id === action.eventId)
      if (!event || state.connection === 'lost') return state
      if (action.kind === 'revoke' && !action.reason?.trim()) return state
      const label =
        action.kind === 'revoke'
          ? "Today's access revoked for this credential"
          : 'Flagged for manager review'
      const [audited, id] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `${label} · ${event.id}${action.reason ? ` · Reason: ${action.reason}` : ''}`,
        targetId: event.id,
      })
      const decision: Decision = {
        auditId: id,
        targetId: event.id,
        targetKind: 'event',
        action: action.kind,
        label,
        actor: state.actor,
        at: action.at,
        note: action.reason,
      }
      return { ...audited, decisions: [decision, ...state.decisions] }
    }

    case 'assign-to-me': {
      const [audited] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `Assigned to ${state.actor}`,
        targetId: action.exceptionId,
      })
      return {
        ...audited,
        exceptions: state.exceptions.map((e) =>
          e.id === action.exceptionId ? { ...e, assignee: state.actor } : e,
        ),
      }
    }

    case 'add-note': {
      if (!action.note.trim()) return state
      const [audited] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `Note added: ${action.note.trim()}`,
        targetId: action.exceptionId,
      })
      return audited
    }

    case 'resolved-elsewhere': {
      // Applied even while paused, so nobody acts on a closed item.
      const [audited] = withAudit(state, {
        at: action.at,
        actor: action.by,
        summary: 'Resolved from another console',
        targetId: action.exceptionId,
      })
      return {
        ...audited,
        resolvedElsewhere: [...state.resolvedElsewhere, action.exceptionId],
        exceptions: state.exceptions.map((e) =>
          e.id === action.exceptionId ? { ...e, status: 'resolved' } : e,
        ),
      }
    }

    case 'reveal-name': {
      if (state.privacy || state.revealed.includes(action.targetId))
        return state
      const [audited] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `Revealed full name of ${action.name}`,
        targetId: action.targetId,
      })
      return { ...audited, revealed: [...state.revealed, action.targetId] }
    }

    case 'feedback': {
      const [audited] = withAudit(state, {
        at: action.at,
        actor: state.actor,
        summary: `Decision feedback: ${action.value === 'yes' ? 'correct' : 'incorrect'}`,
        targetId: action.eventId,
      })
      return {
        ...audited,
        feedback: { ...state.feedback, [action.eventId]: action.value },
      }
    }

    case 'set-role':
      return { ...state, role: action.role, actor: action.actor }

    case 'set-privacy':
      // Turning privacy on also re-masks anything revealed earlier.
      return {
        ...state,
        privacy: action.privacy,
        revealed: action.privacy ? [] : state.revealed,
      }

    case 'set-connection':
      return {
        ...state,
        connection: action.connection,
        lastUpdateAt:
          action.connection === 'live' ? action.at : state.lastUpdateAt,
      }

    case 'set-filter':
      return { ...state, filters: { ...state.filters, ...action.filters } }

    case 'set-stream-filter':
      return { ...state, stream: { ...state.stream, ...action.stream } }

    case 'set-search':
      return { ...state, search: action.search }

    case 'select-event':
      return { ...state, selectedEventId: action.eventId }
  }
}

function flushPending(state: ConsoleState): ConsoleState {
  return {
    ...state,
    events: [...state.pendingEvents, ...state.events],
    exceptions: [...state.pendingExceptions, ...state.exceptions],
    pendingEvents: [],
    pendingExceptions: [],
  }
}

export function canReverse(decision: Decision, now: string) {
  return (
    decision.targetKind === 'exception' &&
    !!decision.reversibleUntil &&
    Date.parse(now) < Date.parse(decision.reversibleUntil)
  )
}

// ---------- Selectors ----------

const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function openExceptions(state: ConsoleState) {
  return state.exceptions
    .filter((e) => e.status === 'open')
    .sort(
      (a, b) =>
        severityRank[a.severity] - severityRank[b.severity] ||
        Date.parse(a.occurredAt) - Date.parse(b.occurredAt),
    )
}

export function severityCounts(state: ConsoleState) {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  for (const e of openExceptions(state)) counts[e.severity]++
  return counts
}

function includesText(fields: (string | undefined)[], q: string) {
  return fields.filter(Boolean).join(' ').toLowerCase().includes(q)
}

/** Search never matches hidden details of classified items for Operations. */
function matchesSearch(e: ExceptionItem, state: ConsoleState) {
  const q = state.search.trim().toLowerCase()
  if (!q) return true
  if (e.classified && state.role !== 'security')
    return includesText([e.location], q)
  return includesText(
    [
      e.title,
      e.location,
      e.summary,
      e.subject?.givenName,
      e.subject?.familyName,
      e.subject?.org,
      e.visitor?.host,
    ],
    q,
  )
}

/** Open exceptions after every filter except severity. */
function filteredBase(state: ConsoleState) {
  const { type, assignedToMe } = state.filters
  return openExceptions(state).filter(
    (e) =>
      (type === 'all' || e.type === type) &&
      (!assignedToMe || e.assignee === state.actor) &&
      matchesSearch(e, state),
  )
}

/** Exceptions after the lane filters; counts in the chips use the same base. */
export function visibleExceptions(state: ConsoleState) {
  const { severity } = state.filters
  return filteredBase(state).filter(
    (e) => severity === 'all' || e.severity === severity,
  )
}

/** Counts per severity with the non-severity filters applied. */
export function chipCounts(state: ConsoleState) {
  const base = filteredBase(state)
  const counts: Record<SeverityFilter, number> = {
    all: base.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  for (const e of base) counts[e.severity]++
  return counts
}

const outcomeGroups: Record<Exclude<OutcomeFilter, 'all'>, AccessOutcome[]> = {
  admitted: ['admitted'],
  denied: ['denied'],
  actions: ['relocked', 'suppressed'],
}

export function visibleEvents(state: ConsoleState) {
  const { outcome } = state.stream
  const queries = [state.stream.query, state.search]
    .map((q) => q.trim().toLowerCase())
    .filter(Boolean)
  return state.events.filter((e) => {
    if (outcome !== 'all' && !outcomeGroups[outcome].includes(e.outcome))
      return false
    const fields = [
      e.location,
      e.headline,
      e.context,
      e.subject?.givenName,
      e.subject?.familyName,
      e.subject?.org,
      e.reasoning.policy,
    ]
    return queries.every((q) => includesText(fields, q))
  })
}

export function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function kpis(state: ConsoleState) {
  const autonomy = state.today.total
    ? state.today.handled / state.today.total
    : 0
  const weekAvg =
    state.weekAutonomy.reduce((a, b) => a + b, 0) /
    Math.max(1, state.weekAutonomy.length)
  const medianSeconds = median(state.resolutionSeconds)
  const baseline = state.baselineResolutionSeconds
  const online = state.doors.filter((d) => d.state !== 'offline').length
  return {
    autonomy,
    autonomyDeltaPts: (autonomy - weekAvg) * 100,
    weekAvg,
    handled: state.today.handled,
    total: state.today.total,
    open: openExceptions(state).length,
    severity: severityCounts(state),
    medianSeconds,
    baselineSeconds: baseline,
    fasterBySeconds: baseline - medianSeconds,
    improvement: baseline ? (baseline - medianSeconds) / baseline : 0,
    doorsOnline: online,
    doorsTotal: state.doors.length,
    doorsOffline: state.doors.filter((d) => d.state === 'offline'),
    doorsOnBattery: state.doors.filter((d) => d.state === 'battery'),
  }
}

export function decisionFor(state: ConsoleState, targetId: string) {
  return state.decisions.find((d) => d.targetId === targetId)
}

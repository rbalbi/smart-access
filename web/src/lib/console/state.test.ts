import { buildSnapshot } from '@/mocks/data/console'
import { nextEvent, nextException, seededRng } from '@/mocks/stream'
import { actionsFor } from './actions'
import {
  canReverse,
  chipCounts,
  initialState,
  isPaused,
  kpis,
  median,
  openExceptions,
  reducer,
  visibleEvents,
  visibleExceptions,
  type ConsoleState,
} from './state'

const NOW = new Date('2026-09-28T13:15:02Z') // 9:15:02 AM EDT
const at = (secondsLater: number) =>
  new Date(NOW.getTime() + secondsLater * 1000).toISOString()

function fresh(): ConsoleState {
  return initialState(buildSnapshot(NOW), {
    role: 'operations',
    actor: 'Maria Alvarez',
    now: NOW.toISOString(),
  })
}

const rng = seededRng(42)

describe('seed data matches the design', () => {
  it('has consistent KPI numbers', () => {
    const k = kpis(fresh())
    expect(k.autonomy).toBeCloseTo(1284 / 1326)
    expect(Math.round(k.autonomyDeltaPts * 10) / 10).toBe(1.6)
    expect(k.medianSeconds).toBe(252) // 4m 12s
    expect(k.fasterBySeconds).toBe(88) // 1m 28s
    expect(k.doorsOnline).toBe(47)
    expect(k.doorsTotal).toBe(48)
    expect(k.doorsOffline.map((d) => d.name)).toEqual(['Dock 4'])
  })

  it('lists every offline door as an exception', () => {
    const s = fresh()
    for (const door of kpis(s).doorsOffline) {
      expect(openExceptions(s).some((e) => e.location === door.name)).toBe(true)
    }
  })

  it('sorts open exceptions by severity, then oldest first', () => {
    const order = openExceptions(fresh()).map((e) => e.severity)
    expect(order[0]).toBe('critical')
    expect(order.at(-1)).toBe('low')
  })
})

describe('live stream pausing', () => {
  it('adds events straight to the lane when live', () => {
    const s = fresh()
    const event = nextEvent(rng, NOW)
    const next = reducer(s, { type: 'receive-event', event, at: at(1) })
    expect(next.events[0]).toBe(event)
    expect(next.pendingEvents).toHaveLength(0)
    expect(next.today.handled).toBe(s.today.handled + 1)
  })

  it('queues events and exceptions while auto-paused', () => {
    let s = reducer(fresh(), {
      type: 'auto-pause',
      reason: 'why-open',
      active: true,
    })
    expect(isPaused(s)).toBe(true)
    const event = nextEvent(rng, NOW)
    const exception = nextException(rng, NOW, { critical: true })
    s = reducer(s, { type: 'receive-event', event, at: at(1) })
    s = reducer(s, { type: 'receive-exception', exception, at: at(2) })
    expect(s.events).not.toContain(event)
    expect(s.pendingEvents).toEqual([event])
    expect(s.pendingExceptions).toEqual([exception])
    // KPIs keep counting even while the lists are frozen.
    expect(s.today.total).toBe(1326 + 2)
  })

  it('shows queued items when the pill is clicked', () => {
    let s = reducer(fresh(), { type: 'set-manual-pause', paused: true })
    const event = nextEvent(rng, NOW)
    s = reducer(s, { type: 'receive-event', event, at: at(1) })
    s = reducer(s, { type: 'show-pending', lane: 'events' })
    expect(s.events[0]).toBe(event)
    expect(s.pendingEvents).toHaveLength(0)
  })

  it('stays paused until every pause reason is gone, then flushes', () => {
    let s = fresh()
    s = reducer(s, { type: 'auto-pause', reason: 'lane-focus', active: true })
    s = reducer(s, { type: 'auto-pause', reason: 'drawer-open', active: true })
    const event = nextEvent(rng, NOW)
    s = reducer(s, { type: 'receive-event', event, at: at(1) })
    s = reducer(s, { type: 'auto-pause', reason: 'lane-focus', active: false })
    expect(isPaused(s)).toBe(true)
    expect(s.pendingEvents).toHaveLength(1)
    s = reducer(s, { type: 'auto-pause', reason: 'drawer-open', active: false })
    expect(isPaused(s)).toBe(false)
    expect(s.events[0]).toBe(event)
  })

  it('manual pause outlives auto-pause', () => {
    let s = reducer(fresh(), { type: 'set-manual-pause', paused: true })
    s = reducer(s, { type: 'auto-pause', reason: 'why-open', active: true })
    s = reducer(s, { type: 'auto-pause', reason: 'why-open', active: false })
    expect(isPaused(s)).toBe(true)
  })

  it('applies "resolved elsewhere" even while paused', () => {
    let s = reducer(fresh(), { type: 'set-manual-pause', paused: true })
    s = reducer(s, {
      type: 'resolved-elsewhere',
      exceptionId: 'EXC-4469',
      by: 'David Okafor',
      at: at(5),
    })
    expect(openExceptions(s).some((e) => e.id === 'EXC-4469')).toBe(false)
    expect(s.resolvedElsewhere).toContain('EXC-4469')
  })
})

describe('decisions', () => {
  it('records an audit entry and closes the exception', () => {
    const s = reducer(fresh(), {
      type: 'decide',
      exceptionId: 'EXC-4463',
      actionId: 'grant-once',
      at: at(10),
    })
    const decision = s.decisions[0]
    expect(decision.auditId).toBe('AUD-0928-000982')
    expect(decision.label).toBe('One-time entry granted')
    expect(s.audit[0].id).toBe(decision.auditId)
    expect(openExceptions(s).some((e) => e.id === 'EXC-4463')).toBe(false)
  })

  it('blocks resolving a forced door without a note', () => {
    const s = fresh()
    const blocked = reducer(s, {
      type: 'decide',
      exceptionId: 'EXC-4471',
      actionId: 'resolve',
      note: '   ',
      at: at(10),
    })
    expect(blocked).toBe(s)
    const ok = reducer(s, {
      type: 'decide',
      exceptionId: 'EXC-4471',
      actionId: 'resolve',
      note: 'Maintenance crew, confirmed by radio',
      at: at(10),
    })
    expect(ok.decisions[0].note).toBe('Maintenance crew, confirmed by radio')
  })

  it('refuses decisions while the console is disconnected', () => {
    const s = reducer(fresh(), {
      type: 'set-connection',
      connection: 'lost',
      at: at(1),
    })
    const next = reducer(s, {
      type: 'decide',
      exceptionId: 'EXC-4463',
      actionId: 'grant-once',
      at: at(2),
    })
    expect(next).toBe(s)
  })

  it('updates the median resolution time', () => {
    const before = kpis(fresh()).medianSeconds
    const s = reducer(fresh(), {
      type: 'decide',
      exceptionId: 'EXC-4452', // opened 24 min ago: a slow resolution
      actionId: 'acknowledge',
      at: at(0),
    })
    expect(kpis(s).medianSeconds).toBeGreaterThan(before)
  })
})

describe('reverse window', () => {
  const decided = () =>
    reducer(fresh(), {
      type: 'decide',
      exceptionId: 'EXC-4463',
      actionId: 'grant-once',
      at: at(0),
    })

  it('can reverse within 30 seconds', () => {
    const s = decided()
    const d = s.decisions[0]
    expect(canReverse(d, at(29))).toBe(true)
    const reversed = reducer(s, {
      type: 'reverse',
      auditId: d.auditId,
      at: at(29),
    })
    expect(openExceptions(reversed).some((e) => e.id === 'EXC-4463')).toBe(true)
    expect(reversed.audit[0].summary).toContain(`Reversed ${d.auditId}`)
    expect(kpis(reversed).medianSeconds).toBe(kpis(fresh()).medianSeconds)
  })

  it('cannot reverse after 30 seconds', () => {
    const s = decided()
    const d = s.decisions[0]
    expect(canReverse(d, at(30))).toBe(false)
    expect(
      reducer(s, { type: 'reverse', auditId: d.auditId, at: at(31) }),
    ).toBe(s)
  })
})

describe('overriding an automatic decision', () => {
  it('requires a reason to revoke', () => {
    const s = fresh()
    expect(
      reducer(s, {
        type: 'override-event',
        eventId: 'EVT-00412',
        kind: 'revoke',
        at: at(1),
      }),
    ).toBe(s)
    const next = reducer(s, {
      type: 'override-event',
      eventId: 'EVT-00412',
      kind: 'revoke',
      reason: 'Person no longer authorized',
      at: at(1),
    })
    expect(next.audit[0].summary).toContain(
      'Reason: Person no longer authorized',
    )
  })

  it('flags for review without a reason', () => {
    const next = reducer(fresh(), {
      type: 'override-event',
      eventId: 'EVT-00412',
      kind: 'flag',
      at: at(1),
    })
    expect(next.decisions[0].label).toBe('Flagged for manager review')
  })
})

describe('filters', () => {
  it('chip counts match the visible list', () => {
    let s = fresh()
    expect(chipCounts(s)).toEqual({
      all: 8,
      critical: 1,
      high: 2,
      medium: 4,
      low: 1,
    })
    s = reducer(s, { type: 'set-filter', filters: { severity: 'medium' } })
    expect(visibleExceptions(s)).toHaveLength(chipCounts(s).medium)
  })

  it('"Assigned to me" narrows the list and the counts together', () => {
    let s = reducer(fresh(), {
      type: 'assign-to-me',
      exceptionId: 'EXC-4468',
      at: at(1),
    })
    s = reducer(s, { type: 'set-filter', filters: { assignedToMe: true } })
    expect(visibleExceptions(s).map((e) => e.id)).toEqual(['EXC-4468'])
    expect(chipCounts(s)).toEqual({
      all: 1,
      critical: 0,
      high: 1,
      medium: 0,
      low: 0,
    })
  })

  it('counts drop when an exception is decided', () => {
    const s = reducer(fresh(), {
      type: 'decide',
      exceptionId: 'EXC-4469',
      actionId: 'request-close',
      at: at(1),
    })
    expect(chipCounts(s).medium).toBe(3)
    expect(kpis(s).severity.medium).toBe(3)
  })

  it('filters the handled stream by outcome and text', () => {
    let s = reducer(fresh(), {
      type: 'set-stream-filter',
      stream: { outcome: 'actions' },
    })
    expect(visibleEvents(s).map((e) => e.outcome)).toEqual([
      'relocked',
      'suppressed',
    ])
    s = reducer(s, {
      type: 'set-stream-filter',
      stream: { outcome: 'all', query: 'acme' },
    })
    expect(visibleEvents(s).map((e) => e.id)).toEqual(['EVT-00412'])
  })
})

describe('top-bar search', () => {
  it('narrows both lanes', () => {
    const s = reducer(fresh(), { type: 'set-search', search: 'dock 3' })
    expect(visibleExceptions(s).map((e) => e.id)).toEqual(['EXC-4469'])
    expect(visibleEvents(s).map((e) => e.id)).toEqual(['EVT-00412'])
    expect(chipCounts(s).all).toBe(1)
  })

  it('does not reveal classified details to Operations', () => {
    const ops = reducer(fresh(), { type: 'set-search', search: 'volkov' })
    expect(visibleExceptions(ops)).toHaveLength(0)
    const sec = reducer(
      reducer(ops, {
        type: 'set-role',
        role: 'security',
        actor: 'David Okafor',
      }),
      { type: 'set-search', search: 'volkov' },
    )
    expect(visibleExceptions(sec).map((e) => e.id)).toEqual(['EXC-4466'])
  })
})

describe('roles', () => {
  it('Operations escalates to Security; Security opens an incident', () => {
    expect(actionsFor('tailgating', 'operations').at(-1)?.label).toBe(
      'Escalate to Security',
    )
    expect(actionsFor('tailgating', 'security').at(-1)?.label).toBe(
      'Escalate to incident',
    )
  })

  it('every exception type offers a decision plus escalate', () => {
    const s = fresh()
    for (const e of s.exceptions) {
      const actions = actionsFor(e.type, 'operations')
      expect(actions.length).toBeGreaterThanOrEqual(2)
      expect(actions.at(-1)?.id).toBe('escalate')
    }
  })
})

describe('privacy', () => {
  it('logs revealing a name, and privacy mode re-masks it', () => {
    let s = reducer(fresh(), {
      type: 'reveal-name',
      targetId: 'EVT-00412',
      name: 'Rahul M.',
      at: at(1),
    })
    expect(s.revealed).toContain('EVT-00412')
    expect(s.audit[0].summary).toBe('Revealed full name of Rahul M.')
    s = reducer(s, { type: 'set-privacy', privacy: true })
    expect(s.revealed).toEqual([])
    const again = reducer(s, {
      type: 'reveal-name',
      targetId: 'EVT-00412',
      name: 'Rahul M.',
      at: at(2),
    })
    expect(again).toBe(s)
  })
})

describe('median', () => {
  it('handles odd, even and empty lists', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
    expect(median([])).toBe(0)
  })
})

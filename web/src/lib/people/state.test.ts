import { buildPeopleSnapshot } from '@/mocks/data/people'
import { personStatus } from './model'
import {
  credentialStats,
  filterPeople,
  initialPeopleState,
  pageOf,
  peopleReducer,
  sortedReview,
  typeCounts,
  type PeopleAction,
  type PeopleState,
} from './state'

const NOW = new Date('2026-10-06T13:15:02Z') // 9:15 AM EDT
const now = NOW.toISOString()
const fresh = () => initialPeopleState(buildPeopleSnapshot(NOW))
const audited = (n = 982) => ({ auditId: `AUD-1006-000${n}`, at: now })
const person = (s: PeopleState, id: string) =>
  s.people.find((p) => p.id === id)!

describe('people snapshot', () => {
  it('matches the design’s directory size and mix', () => {
    const s = fresh()
    expect(typeCounts(s.people)).toEqual({
      all: 1912,
      tenant: 1684,
      staff: 46,
      contractor: 182,
    })
  })

  it('counts only working credentials', () => {
    const stats = credentialStats(fresh().people, now)
    expect(stats.total).toBe(
      stats.mobile + stats.badge + stats.qr + stats.other,
    )
    expect(stats.holders).toBeLessThan(1912)
  })
})

describe('personStatus', () => {
  it('derives the statuses shown in the design', () => {
    const s = fresh()
    const label = (id: string) => personStatus(person(s, id), now).label
    expect(label('PER-008812')).toBe('Active')
    expect(label('PER-006120')).toBe('Expired badge')
    expect(label('PER-009977')).toBe('Pending extension')
    expect(label('PER-010233')).toBe('Expiring in 2d')
    expect(label('PER-003377')).toBe('Suspended')
  })
})

describe('filters and paging', () => {
  it('searches by the last 4 digits of a credential', () => {
    const s = peopleReducer(fresh(), {
      type: 'set-filters',
      filters: { query: '7731' },
    })
    expect(filterPeople(s, now, 'operations').map((p) => p.id)).toContain(
      'PER-008812',
    )
  })

  it('keeps restricted groups out of Operations filters', () => {
    const s = peopleReducer(fresh(), {
      type: 'set-filters',
      filters: { group: 'server-room' },
    })
    expect(filterPeople(s, now, 'operations')).toHaveLength(0)
    expect(filterPeople(s, now, 'security').map((p) => p.id)).toContain(
      'PER-009977',
    )
  })

  it('pages 1,912 people into 39 pages of 50', () => {
    const page = pageOf(fresh().people, 0, 50)
    expect(page.pages).toBe(39)
    expect([page.from, page.to]).toEqual([1, 50])
  })

  it('changing a filter returns to page 1 and clears the selection', () => {
    let s = peopleReducer(fresh(), { type: 'set-page', page: 4 })
    s = peopleReducer(s, { type: 'toggle-select', id: 'PER-008812' })
    s = peopleReducer(s, { type: 'set-filters', filters: { type: 'staff' } })
    expect(s.page).toBe(0)
    expect(s.selected).toEqual([])
  })
})

describe('needs review', () => {
  it('sorts by severity, then oldest first', () => {
    expect(sortedReview(fresh().review).map((r) => r.severity)).toEqual([
      'high',
      'medium',
      'medium',
      'low',
      'low',
    ])
  })

  it('renewing Kenji’s badge clears the item and restores access', () => {
    const s = peopleReducer(fresh(), {
      type: 'resolve-review',
      itemId: 'REV-4463',
      actionId: 'renew-badge',
      ...audited(),
    })
    expect(s.review.find((r) => r.id === 'REV-4463')).toBeUndefined()
    const kenji = person(s, 'PER-006120')
    expect(personStatus(kenji, now).key).toBe('active')
    // Oct 5 + 90 days, as the button promised.
    expect(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
      }).format(new Date(kenji.credentials[0].expiresAt!)),
    ).toBe('2027-01-03')
  })

  it('merging duplicates keeps one record with both credentials', () => {
    const s = peopleReducer(fresh(), {
      type: 'merge',
      keepId: 'PER-008001',
      mergeId: 'PER-010412',
      reviewId: 'REV-0142',
      ...audited(),
    })
    expect(s.people.find((p) => p.id === 'PER-010412')).toBeUndefined()
    expect(person(s, 'PER-008001').credentials).toHaveLength(2)
  })
})

describe('reverse', () => {
  it('undoes a review decision, including the review item', () => {
    const before = fresh()
    const actions: PeopleAction[] = [
      {
        type: 'resolve-review',
        itemId: 'REV-3377',
        actionId: 'revoke-badge',
        ...audited(),
      },
      { type: 'reverse', auditId: audited().auditId },
    ]
    const after = actions.reduce(peopleReducer, before)
    expect(after.review.map((r) => r.id)).toEqual(
      before.review.map((r) => r.id),
    )
    expect(person(after, 'PER-003377')).toBe(person(before, 'PER-003377'))
  })

  it('undoes a merge, putting the duplicate back where it was', () => {
    const before = fresh()
    const index = before.people.findIndex((p) => p.id === 'PER-010412')
    const after = [
      {
        type: 'merge',
        keepId: 'PER-008001',
        mergeId: 'PER-010412',
        reviewId: 'REV-0142',
        ...audited(),
      },
      { type: 'reverse', auditId: audited().auditId },
    ].reduce(peopleReducer as never, before) as PeopleState
    expect(after.people.findIndex((p) => p.id === 'PER-010412')).toBe(index)
    expect(person(after, 'PER-008001').credentials).toHaveLength(1)
  })

  it('removes a person it added', () => {
    const s = fresh()
    const added = peopleReducer(s, {
      type: 'add-person',
      person: { ...person(s, 'PER-008812'), id: 'PER-099999' },
      ...audited(),
    })
    expect(added.people).toHaveLength(1913)
    const undone = peopleReducer(added, {
      type: 'reverse',
      auditId: audited().auditId,
    })
    expect(undone.people).toHaveLength(1912)
  })
})

describe('credentials', () => {
  it('replace revokes the old credential and issues a new one', () => {
    const s = peopleReducer(fresh(), {
      type: 'credential',
      personId: 'PER-008812',
      credentialId: 'CRD-77310',
      op: 'replace',
      ...audited(),
    })
    const creds = person(s, 'PER-008812').credentials
    expect(creds.map((c) => c.status)).toEqual(['revoked', 'active'])
    expect(creds[1].last4).not.toBe('7731')
  })

  it('saving groups clears the drawer draft', () => {
    let s = peopleReducer(fresh(), {
      type: 'set-group-draft',
      personId: 'PER-008812',
      groupIds: ['kestrel-staff'],
    })
    s = peopleReducer(s, {
      type: 'set-groups',
      personId: 'PER-008812',
      groupIds: ['kestrel-staff'],
      ...audited(),
    })
    expect(s.groupDrafts).toEqual({})
    expect(person(s, 'PER-008812').groupIds).toEqual(['kestrel-staff'])
  })
})

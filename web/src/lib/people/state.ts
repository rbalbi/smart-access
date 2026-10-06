import type {
  AccessGroup,
  CredentialKind,
  DirectoryPerson,
  IssuedCredential,
  PeopleSnapshot,
  PersonType,
  ReviewItem,
  Role,
  Severity,
} from '@/types'
import {
  credentialState,
  fullName,
  personStatus,
  RENEWAL_DAYS,
  type PersonStatusKey,
} from './model'

// Pure state for People & Credentials. Every change that touches a person
// records what it replaced, keyed by audit ID, so the toast can reverse it.

const DAY = 86_400_000

export type DirectoryFilters = {
  query: string
  type: PersonType | 'all'
  org: string | 'all'
  status: PersonStatusKey | 'all'
  credential: CredentialKind | 'all'
  group: string | 'all'
}

export const defaultFilters: DirectoryFilters = {
  query: '',
  type: 'all',
  org: 'all',
  status: 'all',
  credential: 'all',
  group: 'all',
}

export type ColumnKey =
  'classification' | 'credentials' | 'groups' | 'status' | 'lastAccess'

export const PAGE_SIZES = [50, 100, 200] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export type DrawerTab = 'credentials' | 'access' | 'activity' | 'history'

type UndoEntry = {
  /** Records as they were, with their position, before the change. */
  before: { person: DirectoryPerson; index: number }[]
  /** People the change created. */
  added: string[]
  review?: { item: ReviewItem; index: number }
}

export type PeopleState = Omit<PeopleSnapshot, 'people' | 'review'> & {
  people: DirectoryPerson[]
  review: ReviewItem[]
  filters: DirectoryFilters
  page: number
  pageSize: PageSize
  density: 'comfortable' | 'compact'
  hiddenColumns: ColumnKey[]
  selected: string[]
  openPersonId: string | null
  drawerTab: DrawerTab
  adding: boolean
  reviewCollapsed: boolean
  reviewShowAll: boolean
  /** Unsaved access-group edits in the drawer, by person. */
  groupDrafts: Record<string, string[]>
  undo: Record<string, UndoEntry>
}

export type CredentialOp =
  'suspend' | 'reactivate' | 'replace' | 'renew' | 'revoke'

/** Every change carries the audit ID the console assigned to it. */
type Audited = { auditId: string; at: string }

export type PeopleAction =
  | { type: 'set-filters'; filters: Partial<DirectoryFilters> }
  | { type: 'reset-filters' }
  | { type: 'set-page'; page: number }
  | { type: 'set-page-size'; pageSize: PageSize }
  | { type: 'set-density'; density: PeopleState['density'] }
  | { type: 'toggle-column'; column: ColumnKey }
  | { type: 'toggle-select'; id: string }
  | { type: 'select'; ids: string[]; selected: boolean }
  | { type: 'clear-selection' }
  | { type: 'open-person'; id: string | null; tab?: DrawerTab }
  | { type: 'set-tab'; tab: DrawerTab }
  | { type: 'set-adding'; adding: boolean }
  | { type: 'toggle-review-collapsed' }
  | { type: 'toggle-review-show-all' }
  | { type: 'set-group-draft'; personId: string; groupIds: string[] | null }
  | ({ type: 'resolve-review'; itemId: string; actionId: string } & Audited)
  | ({
      type: 'credential'
      personId: string
      credentialId: string
      op: CredentialOp
    } & Audited)
  | ({ type: 'suspend-all'; personIds: string[] } & Audited)
  | ({ type: 'revoke-all'; personIds: string[] } & Audited)
  | ({
      type: 'add-credential'
      personId: string
      kind: CredentialKind
    } & Audited)
  | ({ type: 'set-groups'; personId: string; groupIds: string[] } & Audited)
  | ({ type: 'add-person'; person: DirectoryPerson } & Audited)
  | ({
      type: 'merge'
      keepId: string
      mergeId: string
      reviewId: string
    } & Audited)
  | { type: 'reverse'; auditId: string }

export function initialPeopleState(snapshot: PeopleSnapshot): PeopleState {
  return {
    ...snapshot,
    filters: defaultFilters,
    page: 0,
    pageSize: 50,
    density: 'comfortable',
    hiddenColumns: [],
    selected: [],
    openPersonId: null,
    drawerTab: 'credentials',
    adding: false,
    reviewCollapsed: false,
    reviewShowAll: false,
    groupDrafts: {},
    undo: {},
  }
}

// ---------- Helpers ----------

const plusDays = (iso: string, days: number) =>
  new Date(Date.parse(iso) + days * DAY).toISOString()

/** Stable, plausible last-4 digits for a newly issued credential. */
export function issueDigits(seed: string) {
  let h = 7
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 10_000
  return String(h).padStart(4, '0')
}

function updateCredential(
  p: DirectoryPerson,
  credentialId: string,
  fn: (c: IssuedCredential) => IssuedCredential,
): DirectoryPerson {
  return {
    ...p,
    credentials: p.credentials.map((c) => (c.id === credentialId ? fn(c) : c)),
  }
}

/**
 * Applies `fn` to the given people and remembers their previous versions
 * under `auditId`. Unknown IDs are ignored.
 */
function touch(
  state: PeopleState,
  ids: string[],
  auditId: string,
  fn: (p: DirectoryPerson) => DirectoryPerson,
  extra: Partial<UndoEntry> = {},
): PeopleState {
  const before: UndoEntry['before'] = []
  const people = state.people.map((p, index) => {
    if (!ids.includes(p.id)) return p
    before.push({ person: p, index })
    return fn(p)
  })
  return {
    ...state,
    people,
    undo: {
      ...state.undo,
      [auditId]: { before, added: [], ...extra },
    },
  }
}

function withoutReview(state: PeopleState, itemId: string) {
  const index = state.review.findIndex((r) => r.id === itemId)
  if (index === -1) return { review: state.review, entry: undefined }
  return {
    review: state.review.filter((r) => r.id !== itemId),
    entry: { item: state.review[index], index },
  }
}

function applyCredentialOp(
  c: IssuedCredential,
  op: CredentialOp,
  ctx: Audited,
): IssuedCredential[] {
  switch (op) {
    case 'suspend':
      return [{ ...c, status: 'suspended' }]
    case 'reactivate':
      return [{ ...c, status: 'active' }]
    case 'revoke':
      return [{ ...c, status: 'revoked' }]
    case 'renew': {
      // Continue from the old end date when it is upcoming or lapsed this
      // week (so "Renew badge to Jan 3" holds); otherwise start from today.
      const recent =
        c.expiresAt && Date.parse(ctx.at) - Date.parse(c.expiresAt) < 7 * DAY
      const from = recent && c.expiresAt ? c.expiresAt : ctx.at
      return [
        { ...c, status: 'active', expiresAt: plusDays(from, RENEWAL_DAYS) },
      ]
    }
    case 'replace':
      // The old credential stops working; the new one keeps its access.
      return [
        { ...c, status: 'revoked' },
        {
          ...c,
          id: `${c.id}-R${issueDigits(ctx.auditId).slice(2)}`,
          last4: c.last4 ? issueDigits(c.id + ctx.auditId) : undefined,
          status: 'active',
          issuedAt: ctx.at,
          autoProvisioned: false,
          lastTap: undefined,
          device:
            c.kind === 'mobile'
              ? 'Invite sent · not added to a wallet yet'
              : c.device,
        },
      ]
  }
}

function newCredential(
  kind: CredentialKind,
  personId: string,
  ctx: Audited,
): IssuedCredential {
  const devices: Partial<Record<CredentialKind, string>> = {
    badge: 'HID iCLASS SE badge',
    mobile: 'Invite sent · not added to a wallet yet',
    'qr-pass': 'Temporary QR pass',
  }
  return {
    id: `CRD-${issueDigits(personId + ctx.auditId)}${kind.length}`,
    kind,
    last4:
      kind === 'pin' || kind === 'biometric'
        ? undefined
        : issueDigits(ctx.auditId + kind),
    status: 'active',
    device: devices[kind],
    issuedAt: ctx.at,
    autoProvisioned: false,
    // Temporary passes last a week.
    expiresAt: kind === 'qr-pass' ? plusDays(ctx.at, 7) : undefined,
  }
}

// ---------- Reducer ----------

export function peopleReducer(
  state: PeopleState,
  action: PeopleAction,
): PeopleState {
  switch (action.type) {
    case 'set-filters':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        page: 0,
        selected: [],
      }
    case 'reset-filters':
      return {
        ...state,
        // The search box is not a filter chip; keep what the person typed.
        filters: { ...defaultFilters, query: state.filters.query },
        page: 0,
        selected: [],
      }
    case 'set-page':
      return { ...state, page: Math.max(0, action.page) }
    case 'set-page-size':
      return { ...state, pageSize: action.pageSize, page: 0 }
    case 'set-density':
      return { ...state, density: action.density }
    case 'toggle-column':
      return {
        ...state,
        hiddenColumns: state.hiddenColumns.includes(action.column)
          ? state.hiddenColumns.filter((c) => c !== action.column)
          : [...state.hiddenColumns, action.column],
      }
    case 'toggle-select':
      return {
        ...state,
        selected: state.selected.includes(action.id)
          ? state.selected.filter((id) => id !== action.id)
          : [...state.selected, action.id],
      }
    case 'select': {
      const rest = state.selected.filter((id) => !action.ids.includes(id))
      return {
        ...state,
        selected: action.selected ? [...rest, ...action.ids] : rest,
      }
    }
    case 'clear-selection':
      return { ...state, selected: [] }
    case 'open-person':
      return {
        ...state,
        openPersonId: action.id,
        drawerTab: action.tab ?? 'credentials',
        adding: false,
        // Unsaved group edits belong to the person they were made for.
        groupDrafts: {},
      }
    case 'set-tab':
      return { ...state, drawerTab: action.tab }
    case 'set-adding':
      return {
        ...state,
        adding: action.adding,
        openPersonId: action.adding ? null : state.openPersonId,
      }
    case 'toggle-review-collapsed':
      return { ...state, reviewCollapsed: !state.reviewCollapsed }
    case 'toggle-review-show-all':
      return { ...state, reviewShowAll: !state.reviewShowAll }
    case 'set-group-draft': {
      const groupDrafts = { ...state.groupDrafts }
      if (action.groupIds) groupDrafts[action.personId] = action.groupIds
      else delete groupDrafts[action.personId]
      return { ...state, groupDrafts }
    }

    case 'resolve-review': {
      const item = state.review.find((r) => r.id === action.itemId)
      if (!item) return state
      const { review, entry } = withoutReview(state, item.id)
      const next = touch(
        state,
        [item.personId],
        action.auditId,
        (p) => resolveEffect(p, action.actionId, action),
        { review: entry },
      )
      return { ...next, review }
    }

    case 'credential':
      return touch(state, [action.personId], action.auditId, (p) => {
        const c = p.credentials.find((x) => x.id === action.credentialId)
        if (!c) return p
        return {
          ...p,
          credentials: p.credentials.flatMap((x) =>
            x.id === c.id ? applyCredentialOp(x, action.op, action) : [x],
          ),
        }
      })

    case 'suspend-all':
    case 'revoke-all': {
      const status = action.type === 'suspend-all' ? 'suspended' : 'revoked'
      return touch(state, action.personIds, action.auditId, (p) => ({
        ...p,
        credentials: p.credentials.map((c) =>
          c.status === 'revoked' ? c : { ...c, status },
        ),
      }))
    }

    case 'add-credential':
      return touch(state, [action.personId], action.auditId, (p) => ({
        ...p,
        credentials: [
          ...p.credentials,
          newCredential(action.kind, p.id, action),
        ],
      }))

    case 'set-groups': {
      const next = touch(state, [action.personId], action.auditId, (p) => ({
        ...p,
        groupIds: action.groupIds,
      }))
      const groupDrafts = { ...state.groupDrafts }
      delete groupDrafts[action.personId]
      return { ...next, groupDrafts }
    }

    case 'add-person':
      return {
        ...state,
        people: [action.person, ...state.people],
        undo: {
          ...state.undo,
          [action.auditId]: { before: [], added: [action.person.id] },
        },
      }

    case 'merge': {
      const keep = state.people.find((p) => p.id === action.keepId)
      const merge = state.people.find((p) => p.id === action.mergeId)
      if (!keep || !merge) return state
      const { review, entry } = withoutReview(state, action.reviewId)
      const next = touch(state, [keep.id, merge.id], action.auditId, (p) => p, {
        review: entry,
      })
      return {
        ...next,
        review,
        selected: state.selected.filter((id) => id !== merge.id),
        openPersonId:
          state.openPersonId === merge.id ? keep.id : state.openPersonId,
        people: next.people
          .filter((p) => p.id !== merge.id)
          .map((p) =>
            p.id === keep.id
              ? {
                  ...p,
                  credentials: [...p.credentials, ...merge.credentials],
                  groupIds: [...new Set([...p.groupIds, ...merge.groupIds])],
                }
              : p,
          ),
      }
    }

    case 'reverse': {
      const entry = state.undo[action.auditId]
      if (!entry) return state
      let people = state.people.filter((p) => !entry.added.includes(p.id))
      // Restore in original order so re-inserted records land where they were.
      for (const { person, index } of [...entry.before].sort(
        (a, b) => a.index - b.index,
      )) {
        const at = people.findIndex((p) => p.id === person.id)
        if (at === -1)
          people = [...people.slice(0, index), person, ...people.slice(index)]
        else people = people.map((p) => (p.id === person.id ? person : p))
      }
      const review = entry.review
        ? [
            ...state.review.slice(0, entry.review.index),
            entry.review.item,
            ...state.review.slice(entry.review.index),
          ]
        : state.review
      const undo = { ...state.undo }
      delete undo[action.auditId]
      return { ...state, people, review, undo }
    }
  }
}

/** What each Needs-review decision does to the person it is about. */
function resolveEffect(
  p: DirectoryPerson,
  actionId: string,
  ctx: Audited,
): DirectoryPerson {
  switch (actionId) {
    case 'approve-extension':
      // The request runs 24 days past the current end date (see REQ-9921).
      return {
        ...p,
        extensionRequested: false,
        credentials: p.credentials.map((c) =>
          c.status === 'active' && c.expiresAt
            ? { ...c, expiresAt: plusDays(c.expiresAt, 24) }
            : c,
        ),
      }
    case 'deny-extension':
      // The pass still ends on its original date.
      return { ...p, extensionRequested: false }
    case 'renew-badge': {
      const badge = p.credentials.find((c) => c.kind === 'badge')
      return badge
        ? updateCredential(
            p,
            badge.id,
            (c) => applyCredentialOp(c, 'renew', ctx)[0],
          )
        : p
    }
    case 'revoke-invite':
    case 'revoke-badge':
      return {
        ...p,
        credentials: p.credentials.map((c) =>
          c.status === 'revoked' ? c : { ...c, status: 'revoked' },
        ),
      }
    case 'resend-invite':
      return {
        ...p,
        credentials: p.credentials.map((c) =>
          c.kind === 'mobile' && c.status === 'active'
            ? { ...c, issuedAt: ctx.at }
            : c,
        ),
      }
    default:
      // Keep expired, ask tenant, keep separate, keep suspended: log only.
      return p
  }
}

// ---------- Selectors ----------

function matchesQuery(p: DirectoryPerson, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (/^\d{1,4}$/.test(q))
    return p.credentials.some((c) => c.last4?.includes(q))
  return [fullName(p), p.email, p.person.org ?? '', p.sponsor ?? '', p.id]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export function filterPeople(
  state: Pick<PeopleState, 'people' | 'filters' | 'groups'>,
  now: string,
  role: Role,
) {
  const f = state.filters
  const hidden = new Set(
    role === 'security'
      ? []
      : state.groups.filter((g) => g.restricted).map((g) => g.id),
  )
  return state.people.filter(
    (p) =>
      (f.type === 'all' || p.type === f.type) &&
      (f.org === 'all' || p.person.org === f.org) &&
      (f.credential === 'all' ||
        p.credentials.some(
          (c) => c.kind === f.credential && c.status !== 'revoked',
        )) &&
      (f.group === 'all' ||
        (!hidden.has(f.group) && p.groupIds.includes(f.group))) &&
      (f.status === 'all' || personStatus(p, now).key === f.status) &&
      matchesQuery(p, f.query),
  )
}

export function activeFilterCount(filters: DirectoryFilters) {
  return (['org', 'status', 'credential', 'group'] as const).filter(
    (k) => filters[k] !== 'all',
  ).length
}

export function pageOf<T>(list: T[], page: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(list.length / pageSize))
  const current = Math.min(page, pages - 1)
  const start = current * pageSize
  return {
    rows: list.slice(start, start + pageSize),
    page: current,
    pages,
    from: list.length === 0 ? 0 : start + 1,
    to: Math.min(list.length, start + pageSize),
  }
}

export function typeCounts(people: DirectoryPerson[]) {
  const counts = { all: people.length, tenant: 0, staff: 0, contractor: 0 }
  for (const p of people) counts[p.type]++
  return counts
}

export function statusCounts(people: DirectoryPerson[], now: string) {
  const counts: Record<PersonStatusKey, number> = {
    active: 0,
    expiring: 0,
    'pending-extension': 0,
    expired: 0,
    suspended: 0,
    'no-credential': 0,
  }
  for (const p of people) counts[personStatus(p, now).key]++
  return counts
}

export function credentialStats(people: DirectoryPerson[], now: string) {
  const byKind: Record<CredentialKind, number> = {
    mobile: 0,
    badge: 0,
    'qr-pass': 0,
    pin: 0,
    biometric: 0,
    'visitor-pass': 0,
  }
  let holders = 0
  for (const p of people) {
    let any = false
    for (const c of p.credentials) {
      if (credentialState(c, now) !== 'active') continue
      byKind[c.kind]++
      any = true
    }
    if (any) holders++
  }
  const other = byKind.pin + byKind.biometric + byKind['visitor-pass']
  const total = byKind.mobile + byKind.badge + byKind['qr-pass'] + other
  return {
    total,
    holders,
    mobile: byKind.mobile,
    badge: byKind.badge,
    qr: byKind['qr-pass'],
    other,
  }
}

export function reviewCounts(review: ReviewItem[]) {
  const counts: Record<Exclude<Severity, 'critical'>, number> = {
    high: 0,
    medium: 0,
    low: 0,
  }
  for (const r of review) counts[r.severity]++
  return counts
}

const severityOrder = { high: 0, medium: 1, low: 2 }

/** Severity first, then oldest first. */
export function sortedReview(review: ReviewItem[]) {
  return [...review].sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      a.createdAt.localeCompare(b.createdAt),
  )
}

export function organizations(people: DirectoryPerson[]) {
  return [
    ...new Set(people.map((p) => p.person.org).filter(Boolean)),
  ].sort() as string[]
}

export function findGroup(groups: AccessGroup[], id: string) {
  return groups.find((g) => g.id === id)
}

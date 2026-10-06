import {
  Ban,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  Lock,
  MoreVertical,
  Rows3,
  Rows4,
  Search,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useDirectoryRows } from '@/hooks/useDirectoryRows'
import { Kbd } from '@/components/console/primitives'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import {
  credentialLabel,
  formatDate,
  formatNumber,
  formatTime,
  isSameSiteDay,
} from '@/lib/console/format'
import {
  classificationDetail,
  directoryName,
  fullName,
  groupsFor,
  maskEmail,
  personStatus,
  statusLabels,
  typeLabels,
  visibleGroups,
  type PersonStatusKey,
} from '@/lib/people/model'
import {
  activeFilterCount,
  organizations,
  pageOf,
  PAGE_SIZES,
  statusCounts,
  typeCounts,
  type ColumnKey,
  type DirectoryFilters,
  type PageSize,
} from '@/lib/people/state'
import { cn } from '@/lib/utils'
import type { CredentialKind, DirectoryPerson, LastAccess } from '@/types'
import {
  CredentialChip,
  FilterMenu,
  GroupChip,
  PersonAvatar,
  StatusPill,
} from './parts'
import { iconButton, outlineButton } from '@/lib/people/styles'
import { useConfirmRemoval } from '@/hooks/useConfirmRemoval'

const columnLabels: Record<ColumnKey, string> = {
  classification: 'Classification',
  credentials: 'Credentials',
  groups: 'Access groups',
  status: 'Status',
  lastAccess: 'Last access event',
}

const credentialKinds: CredentialKind[] = [
  'mobile',
  'badge',
  'qr-pass',
  'pin',
  'biometric',
]

export function Directory() {
  const rows = useDirectoryRows()
  const { state } = usePeople()
  const page = pageOf(rows, state.page, state.pageSize)

  return (
    <section
      aria-label="People directory"
      className="relative flex flex-col rounded-lg border border-border bg-surface-3 shadow-xs"
    >
      <SearchRow />
      <FilterRow total={rows.length} from={page.from} to={page.to} />
      <ActiveFilters />
      <div className="overflow-x-auto">
        <PeopleTable rows={page.rows} />
      </div>
      <Pagination total={rows.length} {...page} />
      <BulkBar rows={rows} />
    </section>
  )
}

function SearchRow() {
  const { state, dispatch } = usePeople()
  const counts = typeCounts(state.people)
  const input = useRef<HTMLInputElement>(null)

  // "/" jumps to search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]'))
        return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const segments: [DirectoryFilters['type'], string, number][] = [
    ['all', 'All', counts.all],
    ['tenant', 'Tenant employees', counts.tenant],
    ['staff', 'Building staff', counts.staff],
    ['contractor', 'Contractors', counts.contractor],
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-t-lg border-b border-border bg-surface-2 px-4 pt-4 pb-[17px]">
      <div className="relative w-full max-w-[448px] min-w-64 flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={input}
          type="search"
          aria-label="Search the directory by name, email, organization or the last 4 digits of a credential"
          placeholder="Search by name, email, organization or last 4 digits…"
          value={state.filters.query}
          onChange={(e) =>
            dispatch({
              type: 'set-filters',
              filters: { query: e.target.value },
            })
          }
          onKeyDown={(e) => {
            if (e.key === 'Escape' && state.filters.query) {
              e.preventDefault()
              dispatch({ type: 'set-filters', filters: { query: '' } })
            }
          }}
          className="h-8 w-full rounded-lg border border-border bg-surface-3 pr-10 pl-9 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
          <Kbd>/</Kbd>
        </span>
      </div>
      <div
        role="group"
        aria-label="Person type"
        className="flex max-w-full overflow-x-auto rounded-lg border border-border bg-surface-3 p-[3px]"
      >
        {segments.map(([value, label, count]) => {
          const on = state.filters.type === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() =>
                dispatch({ type: 'set-filters', filters: { type: value } })
              }
              className={cn(
                'flex h-[26px] items-center gap-1.5 rounded px-2.5 text-xs whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
                on
                  ? 'bg-surface-5 font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              <span
                className={cn(
                  'font-mono text-[10px] font-normal',
                  on ? 'text-muted-foreground' : 'text-subtle-foreground',
                )}
              >
                {formatNumber(count)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FilterRow({
  total,
  from,
  to,
}: {
  total: number
  from: number
  to: number
}) {
  const { state: c } = useConsole()
  const { state, dispatch, now } = usePeople()
  const set = (filters: Partial<DirectoryFilters>) =>
    dispatch({ type: 'set-filters', filters })
  const statuses = statusCounts(state.people, now)
  const orgs = useMemo(() => organizations(state.people), [state.people])
  const groups = visibleGroups(state.groups, c.role)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-border bg-surface-1 px-4 pt-2.5 pb-[11px]">
      <div className="flex flex-wrap items-center gap-2">
        <FilterMenu
          label="Org"
          value={state.filters.org}
          onChange={(org) => set({ org })}
          options={[
            { value: 'all', label: 'All organizations' },
            ...orgs.map((o) => ({ value: o, label: o })),
          ]}
        />
        <FilterMenu
          label="Status"
          value={state.filters.status}
          onChange={(status) => set({ status: status as PersonStatusKey })}
          options={[
            { value: 'all', label: 'All statuses' },
            ...(Object.keys(statusLabels) as PersonStatusKey[]).map((k) => ({
              value: k,
              label: `${statusLabels[k]} (${formatNumber(statuses[k])})`,
            })),
          ]}
        />
        <FilterMenu
          label="Type"
          value={state.filters.credential}
          onChange={(credential) =>
            set({ credential: credential as CredentialKind })
          }
          options={[
            { value: 'all', label: 'Any credential' },
            ...credentialKinds.map((k) => ({
              value: k,
              label: credentialLabel(k),
            })),
          ]}
        />
        <FilterMenu
          label="Group"
          value={state.filters.group}
          onChange={(group) => set({ group })}
          options={[
            { value: 'all', label: 'All groups' },
            ...groups.map((g) => ({
              value: g.id,
              label: g.restricted ? `${g.name} (restricted)` : g.name,
            })),
          ]}
        />
        <button
          type="button"
          disabled={activeFilterCount(state.filters) === 0}
          onClick={() => dispatch({ type: 'reset-filters' })}
          className="h-7 rounded px-2 text-[11px] text-subtle-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className={outlineButton}>
            <Columns3 aria-hidden />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              {(Object.keys(columnLabels) as ColumnKey[]).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  className="text-xs"
                  checked={!state.hiddenColumns.includes(col)}
                  onCheckedChange={() =>
                    dispatch({ type: 'toggle-column', column: col })
                  }
                >
                  {columnLabels[col]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          role="group"
          aria-label="Row density"
          className="flex items-center rounded border border-border bg-surface-3 p-[3px]"
        >
          {(
            [
              ['comfortable', 'Comfortable', Rows3],
              ['compact', 'Compact', Rows4],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={state.density === value}
              onClick={() => dispatch({ type: 'set-density', density: value })}
              className={cn(
                'flex size-6 items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-ring',
                state.density === value
                  ? 'bg-surface-5 text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon aria-hidden className="size-3.5" />
            </button>
          ))}
        </div>

        <p
          className="font-mono text-[11px] leading-4 whitespace-nowrap text-subtle-foreground"
          aria-live="polite"
        >
          Showing {formatNumber(from)}–{formatNumber(to)} of{' '}
          {formatNumber(total)}
        </p>
      </div>
    </div>
  )
}

function ActiveFilters() {
  const { state: c } = useConsole()
  const { state, dispatch } = usePeople()
  const f = state.filters
  const chips: [keyof DirectoryFilters, string][] = []
  if (f.org !== 'all') chips.push(['org', `Org: ${f.org}`])
  if (f.status !== 'all')
    chips.push(['status', `Status: ${statusLabels[f.status]}`])
  if (f.credential !== 'all')
    chips.push(['credential', `Type: ${credentialLabel(f.credential)}`])
  if (f.group !== 'all') {
    const g = visibleGroups(state.groups, c.role).find((x) => x.id === f.group)
    chips.push(['group', `Group: ${g?.name ?? f.group}`])
  }
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
      {chips.map(([key, label]) => (
        <span
          key={key}
          className="flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 py-0.5 pr-1 pl-2.5 text-[11px] text-brand-text"
        >
          {label}
          <button
            type="button"
            aria-label={`Remove filter ${label}`}
            onClick={() =>
              dispatch({ type: 'set-filters', filters: { [key]: 'all' } })
            }
            className="flex size-4 items-center justify-center rounded-full outline-none hover:bg-brand/20 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="size-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => dispatch({ type: 'reset-filters' })}
        className="rounded text-[11px] text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        Clear all
      </button>
    </div>
  )
}

function PeopleTable({ rows }: { rows: DirectoryPerson[] }) {
  const { state } = usePeople()
  const show = (col: ColumnKey) => !state.hiddenColumns.includes(col)
  const pageIds = rows.map((r) => r.id)
  const selectedOnPage = pageIds.filter((id) => state.selected.includes(id))
  const { dispatch } = usePeople()
  const head =
    'px-3 py-[18px] text-left font-mono text-[11px] leading-4 font-normal tracking-[0.05em] text-subtle-foreground uppercase'

  return (
    <table className="w-full min-w-[1040px] border-collapse text-xs">
      <thead className="border-b border-border bg-surface-2">
        <tr>
          <th scope="col" className="w-[46px] pl-4">
            <Checkbox
              aria-label="Select all people on this page"
              checked={
                selectedOnPage.length > 0 &&
                selectedOnPage.length === pageIds.length
              }
              indeterminate={
                selectedOnPage.length > 0 &&
                selectedOnPage.length < pageIds.length
              }
              onCheckedChange={(checked) =>
                dispatch({ type: 'select', ids: pageIds, selected: !!checked })
              }
            />
          </th>
          <th scope="col" className={cn(head, 'w-[288px]')}>
            Person
          </th>
          {show('classification') && (
            <th scope="col" className={head}>
              Classification
            </th>
          )}
          {show('credentials') && (
            <th scope="col" className={head}>
              Credentials
            </th>
          )}
          {show('groups') && (
            <th scope="col" className={head}>
              Access groups
            </th>
          )}
          {show('status') && (
            <th scope="col" className={head}>
              Status
            </th>
          )}
          {show('lastAccess') && (
            <th scope="col" className={cn(head, 'w-[130px] py-2.5')}>
              Last access event
            </th>
          )}
          <th scope="col" className="w-12">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-12 text-center">
              <p className="text-sm font-medium">No people match</p>
              <p className="pt-1 text-xs text-muted-foreground">
                Try a different search, or{' '}
                <button
                  type="button"
                  className="rounded text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    dispatch({ type: 'reset-filters' })
                    dispatch({
                      type: 'set-filters',
                      filters: { query: '', type: 'all' },
                    })
                  }}
                >
                  clear every filter
                </button>
                .
              </p>
            </td>
          </tr>
        ) : (
          rows.map((p) => <PersonRow key={p.id} person={p} show={show} />)
        )}
      </tbody>
    </table>
  )
}

function PersonRow({
  person: p,
  show,
}: {
  person: DirectoryPerson
  show: (col: ColumnKey) => boolean
}) {
  const { state: c } = useConsole()
  const { state, dispatch, now, run, canEdit } = usePeople()
  const confirm = useConfirmRemoval()
  const privacy = c.privacy
  const open = state.openPersonId === p.id
  const selected = state.selected.includes(p.id)
  const status = personStatus(p, now)
  const review = state.review.find(
    (r) => r.personId === p.id && (!r.classified || c.role === 'security'),
  )
  const name = directoryName(p, { privacy })
  const compact = state.density === 'compact'
  const cell = cn('px-3 align-middle', compact ? 'py-1.5' : 'py-3')
  const credentials = p.credentials.filter((x) => x.status !== 'revoked')
  const openDrawer = () => dispatch({ type: 'open-person', id: p.id })

  const suspendAll = () =>
    confirm.ask({
      title: `Suspend every credential for ${name}?`,
      description:
        'They will be denied at every door until a credential is reactivated. You can reverse it for 30 seconds.',
      confirmLabel: 'Suspend credentials',
      onConfirm: (reason) =>
        run({
          summary: `Suspended all credentials for ${fullName(p)} (${reason})`,
          title: `Credentials suspended · ${name}`,
          targetId: p.id,
          apply: (ctx) => ({ type: 'suspend-all', personIds: [p.id], ...ctx }),
        }),
    })

  return (
    <tr
      onClick={(e) => {
        // Clicks on controls inside the row do their own thing.
        if ((e.target as HTMLElement).closest('button, a, [role="checkbox"]'))
          return
        openDrawer()
      }}
      className={cn(
        'cursor-pointer border-t border-border transition-colors first:border-t-0 hover:bg-surface-4/60',
        review && 'bg-sev-critical-bg/10',
        open && 'bg-surface-5/60 shadow-[inset_2px_0_0_var(--brand)]',
        selected && !open && 'bg-brand/5',
      )}
    >
      <td className="w-[46px] pl-4 align-middle">
        <Checkbox
          aria-label={`Select ${name}`}
          checked={selected}
          onCheckedChange={() => dispatch({ type: 'toggle-select', id: p.id })}
        />
      </td>
      <td className={cn(cell, 'max-w-[288px]')}>
        <div className="flex items-center gap-3">
          <PersonAvatar person={p} privacy={privacy} selected={open} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id={`person-${p.id}`}
                onClick={openDrawer}
                className="truncate rounded text-left leading-4 font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {name}
              </button>
              {review && (
                <TriangleAlert
                  aria-label="Needs review"
                  className="size-3 shrink-0 text-sev-critical"
                />
              )}
            </div>
            {!compact && (
              <p className="truncate text-[11px] leading-4 text-muted-foreground">
                {privacy ? maskEmail(p.email) : p.email}
              </p>
            )}
          </div>
        </div>
      </td>
      {show('classification') && (
        <td className={cell}>
          <p className="leading-4">{typeLabels[p.type]}</p>
          {!compact && (
            <p className="text-[10px] leading-4 text-subtle-foreground">
              {classificationDetail(p)}
            </p>
          )}
        </td>
      )}
      {show('credentials') && (
        <td className={cell}>
          <div className="flex flex-col gap-1.5">
            {credentials.length === 0 ? (
              <span className="text-subtle-foreground">None</span>
            ) : (
              (compact ? credentials.slice(0, 1) : credentials).map((cr, i) => (
                <CredentialChip
                  key={cr.id}
                  credential={cr}
                  now={now}
                  secondary={i > 0}
                />
              ))
            )}
          </div>
        </td>
      )}
      {show('groups') && (
        <td className={cell}>
          <GroupsCell person={p} struck={status.key === 'suspended'} />
        </td>
      )}
      {show('status') && (
        <td className={cell}>
          <StatusPill status={status} />
        </td>
      )}
      {show('lastAccess') && (
        <td className={cell}>
          <LastAccessCell access={p.lastAccess} />
        </td>
      )}
      <td className="w-12 pr-3 text-right align-middle">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${name}`}
            className={iconButton}
          >
            <MoreVertical aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem className="text-xs" onClick={openDrawer}>
              Open details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={() =>
                dispatch({ type: 'open-person', id: p.id, tab: 'access' })
              }
            >
              Access groups
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => navigator.clipboard?.writeText(p.id)}
            >
              Copy person ID {p.id}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="text-xs"
              disabled={!canEdit || status.key === 'suspended'}
              onClick={suspendAll}
            >
              Suspend all credentials
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {confirm.dialog}
      </td>
    </tr>
  )
}

function GroupsCell({
  person,
  struck,
}: {
  person: DirectoryPerson
  struck: boolean
}) {
  const { state: c } = useConsole()
  const { state } = usePeople()
  const all = groupsFor(person, state.groups)
  const visible = visibleGroups(all, c.role)
  const hidden = all.length - visible.length
  const elevated = visible.some((g) => g.elevated)

  if (visible.length === 0 && hidden > 0) {
    return (
      <span className="flex items-center gap-1">
        <span className="rounded border border-dashed border-subtle-foreground/60 bg-surface-2 px-2 py-[3px] font-mono text-[11px] leading-4 text-subtle-foreground">
          [Restricted policy]
        </span>
        <HintIcon
          icon={Lock}
          label={`${hidden} restricted ${hidden === 1 ? 'group' : 'groups'}, visible to Security only`}
        />
      </span>
    )
  }
  if (visible.length === 0)
    return <span className="text-subtle-foreground">None</span>

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="flex items-center gap-1.5">
        <GroupChip group={visible[0]} struck={struck} />
        {visible.length > 1 && (
          <span
            title={visible
              .slice(1)
              .map((g) => g.name)
              .join(', ')}
            className="rounded border border-border bg-surface-2 px-[7px] py-0.5 text-[10px] leading-4 text-subtle-foreground"
          >
            +{visible.length - 1}
          </span>
        )}
      </span>
      {(hidden > 0 || elevated) && (
        <span className="flex items-center gap-1">
          {hidden > 0 && (
            <HintIcon
              icon={Lock}
              label={`Plus ${hidden} restricted ${hidden === 1 ? 'group' : 'groups'}, visible to Security only`}
            />
          )}
          {elevated && (
            <HintIcon
              icon={ShieldCheck}
              label="Elevated access: master group covering all doors"
              className="text-brand"
            />
          )}
        </span>
      )}
    </div>
  )
}

function HintIcon({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof Lock
  label: string
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            aria-label={label}
            className="rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Icon
          aria-hidden
          className={cn('size-3 text-subtle-foreground', className)}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function LastAccessCell({ access }: { access?: LastAccess }) {
  const { state: c } = useConsole()
  const { now } = usePeople()
  const tz = c.site.timeZone
  if (!access)
    return (
      <span className="text-[11px] text-subtle-foreground">Never used</span>
    )

  const time = formatTime(access.at, tz, { seconds: false })
  const yesterday = new Date(Date.parse(now) - 86_400_000).toISOString()
  const when = isSameSiteDay(access.at, now, tz)
    ? time
    : isSameSiteDay(access.at, yesterday, tz)
      ? `Yesterday ${time}`
      : formatDate(access.at, tz)
  const denied = access.outcome === 'denied'

  return (
    <div className="text-[11px] leading-4">
      <p className="flex flex-wrap items-center gap-x-1">
        <span
          className={cn(
            access.outcome ? 'font-medium' : 'text-muted-foreground',
            denied && 'text-sev-critical',
          )}
        >
          {when}
        </span>
        {access.outcome && (
          <span
            className={cn(
              'text-[10px] font-medium',
              denied ? 'text-sev-critical' : 'text-ok',
            )}
          >
            {denied ? '✕ Denied' : '● Admitted'}
          </span>
        )}
      </p>
      <p className="truncate text-[10px] text-subtle-foreground">
        {access.location}
      </p>
    </div>
  )
}

function Pagination({
  total,
  page,
  pages,
  from,
  to,
}: {
  total: number
  page: number
  pages: number
  from: number
  to: number
}) {
  const { state, dispatch } = usePeople()
  const go = (p: number) => dispatch({ type: 'set-page', page: p })
  const nav = (
    label: string,
    Icon: typeof ChevronLeft,
    target: number,
    disabled: boolean,
  ) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => go(target)}
      className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
    >
      <Icon aria-hidden className="size-3" />
    </button>
  )

  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t border-border bg-surface-2 px-3 pt-[13px] pb-3 text-xs"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="people-page-size" className="text-muted-foreground">
          Rows per page:
        </label>
        <select
          id="people-page-size"
          value={state.pageSize}
          onChange={(e) =>
            dispatch({
              type: 'set-page-size',
              pageSize: Number(e.target.value) as PageSize,
            })
          }
          className="h-6 rounded border border-border bg-surface-3 pr-6 pl-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="pl-2 text-subtle-foreground">
          {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}{' '}
          records
        </span>
      </div>
      <div className="flex items-center gap-1">
        {nav('First page', ChevronFirst, 0, page === 0)}
        {nav('Previous page', ChevronLeft, page - 1, page === 0)}
        <span className="px-2 font-mono text-[11px] font-bold tabular-nums">
          {page + 1} / {pages}
        </span>
        {nav('Next page', ChevronRight, page + 1, page >= pages - 1)}
        {nav('Last page', ChevronLast, pages - 1, page >= pages - 1)}
      </div>
    </nav>
  )
}

/** Sticky bar for actions on the selected rows. */
function BulkBar({ rows }: { rows: DirectoryPerson[] }) {
  const { state: c } = useConsole()
  const { state, dispatch, run, canEdit } = usePeople()
  const confirm = useConfirmRemoval()
  const selected = state.people.filter((p) => state.selected.includes(p.id))
  if (selected.length === 0) return null
  const outside = selected.filter((p) => !rows.includes(p)).length

  const exportCsv = () => {
    const header = 'id,name,type,organization,email,credentials,groups'
    const lines = selected.map((p) =>
      [
        p.id,
        c.privacy ? p.person.roleLabel : fullName(p),
        typeLabels[p.type],
        p.person.org ?? '',
        c.privacy ? maskEmail(p.email) : p.email,
        p.credentials
          .filter((x) => x.status !== 'revoked')
          .map((x) => `${x.kind}${x.last4 ? ` ••••${x.last4}` : ''}`)
          .join('; '),
        visibleGroups(groupsFor(p, state.groups), c.role)
          .map((g) => g.name)
          .join('; '),
      ]
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(','),
    )
    const blob = new Blob([[header, ...lines].join('\n')], {
      type: 'text/csv',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `people-${c.site.id}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const suspend = () =>
    confirm.ask({
      title: `Suspend credentials for ${selected.length} ${selected.length === 1 ? 'person' : 'people'}?`,
      description:
        'Every credential they hold stops working at every door until it is reactivated. You can reverse this for 30 seconds.',
      confirmLabel: 'Suspend credentials',
      onConfirm: (reason) => {
        run({
          summary: `Suspended all credentials for ${selected.length} people (${reason}): ${selected.map((p) => p.id).join(', ')}`,
          title: `Credentials suspended for ${selected.length} ${selected.length === 1 ? 'person' : 'people'}`,
          apply: (ctx) => ({
            type: 'suspend-all',
            personIds: selected.map((p) => p.id),
            ...ctx,
          }),
        })
        dispatch({ type: 'clear-selection' })
      },
    })

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-3 z-10 mx-3 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand/40 bg-surface-5 px-4 py-2.5 shadow-lg"
    >
      <p className="text-xs font-medium">
        {formatNumber(selected.length)} selected
        {outside > 0 && (
          <span className="font-normal text-muted-foreground">
            {' '}
            ({outside} not in the current view)
          </span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={outlineButton} onClick={exportCsv}>
          <Download aria-hidden />
          Export CSV
        </button>
        <button
          type="button"
          disabled={!canEdit}
          onClick={suspend}
          className={cn(
            outlineButton,
            'border-sev-critical/30 text-sev-critical-fg hover:bg-sev-critical-bg hover:text-sev-critical-fg',
          )}
        >
          <Ban aria-hidden />
          Suspend credentials
        </button>
        <button
          type="button"
          className={outlineButton}
          onClick={() => dispatch({ type: 'clear-selection' })}
        >
          Clear selection
        </button>
      </div>
      {confirm.dialog}
    </div>
  )
}

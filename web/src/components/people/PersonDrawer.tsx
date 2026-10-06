import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  CircleCheck,
  CircleX,
  Contact,
  CreditCard,
  DoorClosed,
  ExternalLink,
  Eye,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { StatusDot } from '@/components/console/primitives'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import {
  formatDate,
  formatRelativeDay,
  formatTime,
  maskPhone,
  nowIso,
} from '@/lib/console/format'
import {
  canManageCredential,
  checkDoor,
  classificationDetail,
  credentialState,
  credentialTitle,
  directoryName,
  doorCount,
  fullName,
  groupsFor,
  maskEmail,
  personStatus,
  RENEWAL_DAYS,
  typeLabels,
  visibleGroups,
} from '@/lib/people/model'
import type { CredentialOp, DrawerTab } from '@/lib/people/state'
import { cn } from '@/lib/utils'
import type {
  AccessGroup,
  CredentialKind,
  DirectoryPerson,
  IssuedCredential,
} from '@/types'
import { useDirectoryRows } from '@/hooks/useDirectoryRows'
import { PersonAvatar, StatusPill } from './parts'
import { Sheet, SheetClose, SheetTitle } from './Sheet'
import { credentialIcons, iconButton, outlineButton } from '@/lib/people/styles'
import { useConfirmRemoval } from '@/hooks/useConfirmRemoval'

export function PersonDrawer() {
  const { state, dispatch } = usePeople()
  const person = state.people.find((p) => p.id === state.openPersonId)
  return (
    <Sheet
      open={!!person}
      onClose={() => dispatch({ type: 'open-person', id: null })}
      label={person ? `Person details, ${person.id}` : 'Person details'}
      header={person ? <DrawerHeader person={person} /> : null}
      footer={person ? <DrawerFooter person={person} /> : null}
    >
      {person && <DrawerBody key={person.id} person={person} />}
    </Sheet>
  )
}

function DrawerHeader({ person }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { state, dispatch } = usePeople()
  const rows = useDirectoryRows()
  const index = rows.findIndex((p) => p.id === person.id)
  // Stepping away would drop unsaved group edits.
  const dirty = !!state.groupDrafts[person.id]
  const step = (delta: number) => {
    const next = rows[index + delta]
    if (next) dispatch({ type: 'open-person', id: next.id })
  }
  return (
    <>
      <p className="flex items-center gap-2 text-xs leading-4">
        <span className="font-mono text-[11px] text-subtle-foreground">
          {person.id}
        </span>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        {person.source === 'roster' ? (
          <span className="flex items-center gap-1 text-ok">
            <StatusDot tone="ok" />
            Synced{' '}
            {formatTime(person.syncedAt, c.site.timeZone, { seconds: false })}
          </span>
        ) : (
          <span className="text-muted-foreground">Managed in SmartAccess</span>
        )}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous person"
          disabled={dirty || index <= 0}
          title={dirty ? 'Save or discard changes first' : undefined}
          onClick={() => step(-1)}
          className={iconButton}
        >
          <ArrowUp aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next person"
          disabled={dirty || index === -1 || index >= rows.length - 1}
          title={dirty ? 'Save or discard changes first' : undefined}
          onClick={() => step(1)}
          className={iconButton}
        >
          <ArrowDown aria-hidden />
        </button>
        <span aria-hidden className="mx-1 h-4 w-px bg-border" />
        <SheetClose aria-label="Close details" className={iconButton}>
          <X aria-hidden />
        </SheetClose>
      </div>
    </>
  )
}

function DrawerBody({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { state, dispatch, now } = usePeople()
  const privacy = c.privacy
  const status = personStatus(p, now)
  const tabsId = useId()
  const credentials = p.credentials.filter((x) => x.status !== 'revoked')
  const groups = groupsFor(p, state.groups)

  const tabs: { id: DrawerTab; label: string; count?: number }[] = [
    { id: 'credentials', label: 'Credentials', count: credentials.length },
    { id: 'access', label: 'Access Groups', count: groups.length },
    { id: 'activity', label: 'Activity Log' },
    { id: 'history', label: 'Audit History' },
  ]

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex gap-4">
        <PersonAvatar person={p} privacy={privacy} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <SheetTitle className="text-xl leading-7 font-semibold tracking-[-0.025em]">
              {directoryName(p, { privacy })}
            </SheetTitle>
            <StatusPill status={status} />
          </div>
          <p className="pt-0.5 text-xs leading-4 text-muted-foreground">
            {typeLabels[p.type]} ·{' '}
            <span className="font-medium text-foreground">
              {classificationDetail(p)}
            </span>
          </p>
          <p className="pt-1 text-[11px] leading-4 text-subtle-foreground">
            {p.sourceDetail}
          </p>
        </div>
      </div>

      <ContactLine person={p} />
      <ExceptionBanner person={p} />

      <div>
        <div
          role="tablist"
          aria-label="Person details"
          className="flex gap-6 border-b border-border"
        >
          {tabs.map((t) => {
            const on = state.drawerTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${tabsId}-${t.id}`}
                aria-selected={on}
                aria-controls={`${tabsId}-${t.id}-panel`}
                onClick={() => dispatch({ type: 'set-tab', tab: t.id })}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-xs leading-4 font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  on
                    ? 'border-brand text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className="rounded-full bg-surface-5 px-1.5 font-mono text-[10px] leading-4 text-muted-foreground">
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div
          role="tabpanel"
          id={`${tabsId}-${state.drawerTab}-panel`}
          aria-labelledby={`${tabsId}-${state.drawerTab}`}
          className="pt-5"
        >
          {state.drawerTab === 'credentials' && <CredentialsTab person={p} />}
          {state.drawerTab === 'access' && <AccessTab person={p} />}
          {state.drawerTab === 'activity' && <ActivityTab person={p} />}
          {state.drawerTab === 'history' && <HistoryTab person={p} />}
        </div>
      </div>
    </div>
  )
}

function ContactLine({ person: p }: { person: DirectoryPerson }) {
  const { state: c, dispatch } = useConsole()
  const revealed = c.revealed.includes(p.id) && !c.privacy
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-3 p-[13px]">
      <p className="flex min-w-0 items-center gap-2 font-mono text-[11px] leading-4 text-muted-foreground">
        <Contact aria-hidden className="size-4 shrink-0" />
        <span className="truncate">
          {revealed ? p.email : maskEmail(p.email)} ·{' '}
          {revealed ? p.phone : maskPhone(p.phone).replace('+1 ', '')}
        </span>
      </p>
      {!revealed && (
        <button
          type="button"
          disabled={c.privacy}
          title={
            c.privacy
              ? 'Turn off privacy mode to reveal contact details'
              : 'Reveal email and phone (logged to the audit trail)'
          }
          onClick={() =>
            dispatch({
              type: 'reveal-name',
              targetId: p.id,
              name: `${fullName(p)} (contact details)`,
              at: nowIso(),
            })
          }
          className="flex shrink-0 items-center gap-1 rounded border border-brand/30 px-2 py-1 text-[11px] leading-4 font-medium text-brand outline-none hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Eye aria-hidden className="size-3" />
          Reveal
        </button>
      )}
    </div>
  )
}

function ExceptionBanner({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const exception = c.exceptions.find(
    (e) => e.id === p.exceptionId && e.status === 'open',
  )
  if (!exception) return null
  if (exception.classified && c.role !== 'security') return null
  const tz = c.site.timeZone
  return (
    <div
      role="note"
      className="flex items-start justify-between gap-3 rounded-lg border border-sev-critical/40 bg-sev-critical-bg/30 p-[15px]"
    >
      <div className="flex gap-2.5">
        <TriangleAlert
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-sev-critical"
        />
        <div>
          <p className="text-xs leading-4 font-semibold text-sev-critical-fg">
            1 open exception in Live Activity
          </p>
          <p className="pt-0.5 text-[11px] leading-4 text-sev-critical-fg/90">
            {exception.title} at{' '}
            <span className="font-medium text-foreground">
              {exception.location}
            </span>{' '}
            ({formatRelativeDay(exception.occurredAt, nowIso(), tz)})
          </p>
        </div>
      </div>
      <Link
        to="/"
        className="flex shrink-0 items-center gap-0.5 rounded pt-0.5 text-xs font-semibold text-sev-critical-fg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        View
        <ArrowRight aria-hidden className="size-3" />
        <span className="sr-only">{exception.id} in Live Activity</span>
      </Link>
    </div>
  )
}

// ---------- Credentials ----------

const opLabels: Record<CredentialOp, string> = {
  suspend: 'Suspended',
  reactivate: 'Reactivated',
  replace: 'Replaced',
  renew: 'Renewed',
  revoke: 'Revoked',
}

function credentialName(cr: IssuedCredential) {
  return `${credentialTitle(cr.kind).toLowerCase()}${cr.last4 ? ` ••••${cr.last4}` : ''}`
}

function CredentialsTab({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { run, canEdit } = usePeople()
  const credentials = p.credentials.filter((x) => x.status !== 'revoked')
  const name = directoryName(p, { privacy: c.privacy })

  const add = (kind: CredentialKind, label: string) =>
    run({
      summary: `Issued ${label.toLowerCase()} to ${fullName(p)}`,
      title: `${label} issued · ${name}`,
      targetId: p.id,
      apply: (ctx) => ({
        type: 'add-credential',
        personId: p.id,
        kind,
        ...ctx,
      }),
    })

  const kinds: [CredentialKind, string][] = [
    ['badge', 'Physical badge'],
    ['mobile', 'Mobile credential invite'],
    ['pin', 'PIN code'],
    ['qr-pass', 'Temporary pass (7 days)'],
    ['biometric', 'Biometric enrollment'],
  ]

  return (
    <div className="flex flex-col gap-4">
      {credentials.length === 0 && (
        <p className="rounded-lg border border-border bg-surface-3 p-4 text-xs text-muted-foreground">
          No working credentials. This person can’t open any door until one is
          issued.
        </p>
      )}
      {credentials.map((cr) => (
        <CredentialCard key={cr.id} person={p} credential={cr} />
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={!canEdit}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-subtle-foreground/60 py-[11px] text-xs font-medium text-muted-foreground outline-none hover:border-brand/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <CreditCard aria-hidden className="size-3.5" />
          Add credential (Physical Badge, PIN, Temp Pass)
          <ChevronDown aria-hidden className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Issue a credential</DropdownMenuLabel>
            {kinds.map(([kind, label]) => {
              const Icon = credentialIcons[kind]
              const allowed = canManageCredential(kind, c.role)
              return (
                <DropdownMenuItem
                  key={kind}
                  disabled={!allowed}
                  className="text-xs"
                  onClick={() => add(kind, label)}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                  {!allowed && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Security only
                    </span>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DoorCheck person={p} />
    </div>
  )
}

function CredentialCard({
  person: p,
  credential: cr,
}: {
  person: DirectoryPerson
  credential: IssuedCredential
}) {
  const { state: c } = useConsole()
  const { state, now, run, canEdit } = usePeople()
  const confirm = useConfirmRemoval()
  const tz = c.site.timeZone
  const st = credentialState(cr, now)
  const Icon = credentialIcons[cr.kind]
  const manageable = canManageCredential(cr.kind, c.role) && canEdit
  const name = directoryName(p, { privacy: c.privacy })
  const renewTo = useMemo(() => {
    const recent =
      cr.expiresAt &&
      Date.parse(now) - Date.parse(cr.expiresAt) < 7 * 86_400_000
    const from = recent && cr.expiresAt ? cr.expiresAt : now
    return formatDate(
      new Date(Date.parse(from) + RENEWAL_DAYS * 86_400_000).toISOString(),
      tz,
    )
  }, [cr.expiresAt, now, tz])

  const act = (op: CredentialOp, reason?: string) =>
    run({
      summary: `${opLabels[op]} ${credentialName(cr)} for ${fullName(p)}${reason ? ` (${reason})` : ''}`,
      title: `${opLabels[op]} ${credentialName(cr)} · ${name}`,
      targetId: p.id,
      apply: (ctx) => ({
        type: 'credential',
        personId: p.id,
        credentialId: cr.id,
        op,
        ...ctx,
      }),
    })

  const remove = (op: 'suspend' | 'revoke' | 'replace') =>
    confirm.ask({
      title:
        op === 'suspend'
          ? `Suspend ${credentialName(cr)}?`
          : op === 'revoke'
            ? `Revoke ${credentialName(cr)}?`
            : `Replace ${credentialName(cr)}?`,
      description:
        op === 'suspend'
          ? 'It stops working at every door until it is reactivated.'
          : op === 'revoke'
            ? 'It stops working permanently. Issue a new credential to restore access.'
            : 'The current credential stops working now and a new one is issued with the same access.',
      confirmLabel:
        op === 'suspend' ? 'Suspend' : op === 'revoke' ? 'Revoke' : 'Replace',
      onConfirm: (reason) => act(op, reason),
    })

  const statusPill =
    st === 'active'
      ? ({ label: 'Active', tone: 'ok' } as const)
      : st === 'expired'
        ? ({ label: 'Expired', tone: 'bad' } as const)
        : ({ label: 'Suspended', tone: 'bad' } as const)

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-4">
            <Icon aria-hidden className="size-4 text-brand" />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-xs leading-4 font-semibold">
              {credentialTitle(cr.kind)}
              {cr.last4 && (
                <span className="font-mono font-normal text-brand">
                  ••••{cr.last4}
                </span>
              )}
            </h3>
            {cr.device && (
              <p className="text-[11px] leading-4 text-muted-foreground">
                {cr.device}
              </p>
            )}
          </div>
        </div>
        <StatusPill status={statusPill} size="sm" />
      </div>

      <dl className="grid grid-cols-2 gap-2 rounded border border-border/60 bg-surface-2 p-[11px] text-[11px] leading-4">
        <div>
          <dt className="text-subtle-foreground">Issued:</dt>
          <dd className="font-mono">
            {formatDate(cr.issuedAt, tz)} ·{' '}
            {cr.autoProvisioned ? 'Auto-provisioned' : 'Issued manually'}
          </dd>
        </div>
        <div>
          <dt className="text-subtle-foreground">
            {cr.expiresAt
              ? st === 'expired'
                ? 'Expired:'
                : 'Expires:'
              : 'Scope:'}
          </dt>
          <dd
            className={cn(
              'font-mono',
              st === 'expired' && 'text-sev-critical-fg',
            )}
          >
            {cr.expiresAt
              ? formatDate(cr.expiresAt, tz)
              : `Applied to ${doorCount(p, state.groups)} of ${c.doors.length} doors`}
          </dd>
        </div>
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-3 border-t border-border/40 pt-[5px]">
          <dt className="text-subtle-foreground">Last verified tap:</dt>
          <dd className="font-mono">
            {cr.lastTap
              ? `${formatRelativeDay(cr.lastTap.at, now, tz).replace(' · ', ', ')} @ ${cr.lastTap.location}`
              : 'No taps yet'}
          </dd>
        </div>
      </dl>

      {manageable ? (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {st === 'active' && (
              <>
                <button
                  type="button"
                  className={cn(outlineButton, 'font-medium text-foreground')}
                  onClick={() => remove('suspend')}
                >
                  Suspend
                </button>
                <button
                  type="button"
                  className={cn(outlineButton, 'font-medium text-foreground')}
                  onClick={() => remove('replace')}
                >
                  Replace
                </button>
              </>
            )}
            {st === 'suspended' && (
              <button
                type="button"
                className={cn(outlineButton, 'font-medium text-foreground')}
                onClick={() => act('reactivate')}
              >
                Reactivate
              </button>
            )}
            {st === 'expired' && (
              <button
                type="button"
                className={cn(
                  outlineButton,
                  'bg-surface-5 font-medium text-foreground',
                )}
                onClick={() => act('renew')}
              >
                Renew to {renewTo}
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`More actions for ${credentialName(cr)}`}
              className={iconButton}
            >
              <MoreHorizontal aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {st === 'active' && cr.expiresAt && (
                <DropdownMenuItem
                  className="text-xs"
                  onClick={() => act('renew')}
                >
                  Extend to {renewTo}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-xs"
                onClick={() => navigator.clipboard?.writeText(cr.id)}
              >
                Copy credential ID
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="text-xs"
                onClick={() => remove('revoke')}
              >
                Revoke
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-subtle-foreground">
          <Lock aria-hidden className="size-3" />
          {canEdit
            ? 'Biometric credentials are managed by Security.'
            : 'Changes are paused while the console is disconnected.'}
        </p>
      )}
      {confirm.dialog}
    </article>
  )
}

/** "Can this person open this door, and why?" */
function DoorCheck({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { state, now } = usePeople()
  const inputId = useId()
  const listId = useId()
  const doors = c.doors
  const initial =
    doors.find((d) => d.name === p.credentials[0]?.lastTap?.location)?.name ??
    doors[0]?.name ??
    ''
  const [query, setQuery] = useState(initial)
  const door = doors.find(
    (d) => d.name.toLowerCase() === query.trim().toLowerCase(),
  )
  const result = door ? checkDoor(p, door.id, state.groups, now) : null
  const hiddenRule =
    result?.allowed && result.group.restricted && c.role !== 'security'

  return (
    <section
      aria-label="Check a door"
      className="mt-2 flex flex-col gap-3 rounded-lg border border-border bg-surface-3 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs leading-4 font-semibold">
          <DoorClosed aria-hidden className="size-3.5 text-brand" />
          <label htmlFor={inputId}>Check a door (Access Simulator)</label>
        </h3>
        <span className="font-mono text-[10px] text-subtle-foreground">
          Policy Simulator v3
        </span>
      </div>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={inputId}
          list={listId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a door name…"
          className="h-8 w-full rounded border border-border bg-surface-2 pr-3 pl-8 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <datalist id={listId}>
          {doors.map((d) => (
            <option key={d.id} value={d.name} />
          ))}
        </datalist>
      </div>
      <div aria-live="polite">
        {!door ? (
          query.trim() && (
            <p className="text-[11px] text-subtle-foreground">
              No door named “{query.trim()}” at {c.site.name}.
            </p>
          )
        ) : result?.allowed ? (
          <DoorResult
            allowed
            title={`Allowed · ${door.name}`}
            rule={
              hiddenRule
                ? 'A restricted policy (details visible to Security)'
                : result.group.name
            }
            detail={
              hiddenRule
                ? undefined
                : `Schedule: ${result.group.schedule} · Anti-passback: 180s strict`
            }
          />
        ) : (
          <DoorResult
            allowed={false}
            title={`Denied · ${door.name}`}
            rule={
              result?.reason === 'no-credential'
                ? 'No working credential'
                : 'No access group includes this door'
            }
            detail={
              result?.reason === 'no-credential'
                ? 'Renew, reactivate or issue a credential to restore access.'
                : 'Add a group that covers this door on the Access Groups tab.'
            }
          />
        )}
      </div>
    </section>
  )
}

function DoorResult({
  allowed,
  title,
  rule,
  detail,
}: {
  allowed: boolean
  title: string
  rule: string
  detail?: string
}) {
  const Icon = allowed ? CircleCheck : CircleX
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded border p-[13px]',
        allowed
          ? 'border-ok/30 bg-ok-bg/15'
          : 'border-sev-critical/40 bg-sev-critical-bg/30',
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-xs leading-4 font-semibold',
          allowed ? 'text-ok' : 'text-sev-critical-fg',
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {title}
      </p>
      <p className="pl-6 text-[11px] leading-4 text-muted-foreground">
        {allowed ? 'Rule: ' : 'Reason: '}
        <span className="font-medium text-foreground">{rule}</span>
      </p>
      {detail && (
        <p className="pl-6 font-mono text-[10px] leading-4 text-subtle-foreground">
          {detail}
        </p>
      )}
    </div>
  )
}

// ---------- Access groups ----------

function AccessTab({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { state, dispatch, canEdit } = usePeople()
  // Edits stay a draft until "Save changes" in the footer.
  const draft = state.groupDrafts[p.id] ?? p.groupIds
  const all = draft
    .map((id) => state.groups.find((g) => g.id === id))
    .filter((g): g is AccessGroup => !!g)
  const visible = visibleGroups(all, c.role)
  const hidden = all.length - visible.length
  const addable = visibleGroups(state.groups, c.role).filter(
    (g) => !draft.includes(g.id),
  )
  const setDraft = (groupIds: string[]) =>
    dispatch({ type: 'set-group-draft', personId: p.id, groupIds })

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {visible.map((g) => {
          const added = !p.groupIds.includes(g.id)
          return (
            <li
              key={g.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border bg-surface-3 p-3',
                added ? 'border-brand/50' : 'border-border',
              )}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  {g.restricted && (
                    <Lock
                      aria-label="Restricted"
                      className="size-3 text-warn"
                    />
                  )}
                  {g.name}
                  {added && (
                    <span className="rounded bg-brand/20 px-1.5 text-[10px] text-brand-text">
                      Unsaved
                    </span>
                  )}
                </p>
                <p className="font-mono text-[10px] leading-4 text-subtle-foreground">
                  {g.schedule} · {g.doorIds.length}{' '}
                  {g.doorIds.length === 1 ? 'door' : 'doors'}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${g.name}`}
                disabled={!canEdit}
                onClick={() => setDraft(draft.filter((id) => id !== g.id))}
                className={iconButton}
              >
                <X aria-hidden />
              </button>
            </li>
          )
        })}
        {hidden > 0 && (
          <li className="flex items-center gap-2 rounded-lg border border-dashed border-subtle-foreground/60 p-3 text-[11px] text-subtle-foreground">
            <Lock aria-hidden className="size-3" />
            {hidden} restricted {hidden === 1 ? 'group' : 'groups'}. Only
            Security can see or change {hidden === 1 ? 'it' : 'them'}.
          </li>
        )}
        {all.length === 0 && (
          <li className="rounded-lg border border-border bg-surface-3 p-3 text-xs text-muted-foreground">
            No access groups. This person can’t open any door.
          </li>
        )}
      </ul>
      {p.groupIds
        .filter((id) => !draft.includes(id))
        .map((id) => state.groups.find((g) => g.id === id))
        .filter((g): g is AccessGroup => !!g)
        .map((g) => (
          <p
            key={g.id}
            className="flex items-center justify-between gap-2 rounded border border-sev-critical/30 bg-sev-critical-bg/20 px-3 py-2 text-[11px] text-sev-critical-fg"
          >
            <span>
              <span className="line-through">{g.name}</span> will be removed
              when you save
            </span>
            <button
              type="button"
              onClick={() => setDraft([...draft, g.id])}
              className="rounded font-medium underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Undo
            </button>
          </p>
        ))}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={!canEdit || addable.length === 0}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-subtle-foreground/60 py-[11px] text-xs font-medium text-muted-foreground outline-none hover:border-brand/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Plus aria-hidden className="size-3.5" />
          Add access group
          <ChevronDown aria-hidden className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-72 w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              {c.role === 'security'
                ? 'All access groups'
                : 'Standard access groups'}
            </DropdownMenuLabel>
            {addable.map((g) => (
              <DropdownMenuItem
                key={g.id}
                className="flex-col items-start gap-0 text-xs"
                onClick={() => setDraft([...draft, g.id])}
              >
                <span className="flex items-center gap-1.5">
                  {g.restricted && <Lock aria-hidden className="size-3" />}
                  {g.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {g.schedule}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link
        to="/policies"
        target="_blank"
        className="flex items-center gap-1 self-start rounded text-[11px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        {c.role === 'security'
          ? 'Manage access group definitions'
          : 'What each group opens'}
        <ExternalLink aria-hidden className="size-3" />
        <span className="sr-only">(opens in a new tab)</span>
      </Link>
    </div>
  )
}

// ---------- Activity & history ----------

function ActivityTab({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { now } = usePeople()
  const tz = c.site.timeZone
  // Live events from this session plus the last recorded taps.
  const live = c.events
    .filter(
      (e) =>
        e.subject?.givenName === p.person.givenName &&
        e.subject?.familyName === p.person.familyName,
    )
    .map((e) => ({
      id: e.id,
      at: e.occurredAt,
      outcome: e.outcome === 'denied' ? 'denied' : 'admitted',
      location: e.location,
    }))
  const recorded = [
    ...(p.lastAccess?.outcome
      ? [{ id: 'last', ...p.lastAccess, outcome: p.lastAccess.outcome }]
      : []),
    ...p.credentials
      .filter((cr) => cr.lastTap)
      .map((cr) => ({
        id: cr.id,
        at: cr.lastTap!.at,
        outcome: 'admitted' as const,
        location: cr.lastTap!.location,
      })),
  ]
  const seen = new Set<string>()
  const entries = [...live, ...recorded]
    .filter((e) => {
      const key = `${e.at}|${e.location}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No access events in the last 30 days.
        </p>
      ) : (
        <ol className="flex flex-col">
          {entries.map((e) => (
            <li
              key={e.id + e.at}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-xs last:border-b-0"
            >
              <span className="flex items-center gap-2">
                {e.outcome === 'denied' ? (
                  <CircleX aria-hidden className="size-3.5 text-sev-critical" />
                ) : (
                  <CircleCheck aria-hidden className="size-3.5 text-ok" />
                )}
                <span>
                  {e.outcome === 'denied' ? 'Denied' : 'Admitted'} ·{' '}
                  {e.location}
                </span>
              </span>
              <span className="font-mono text-[11px] text-subtle-foreground">
                {formatRelativeDay(e.at, now, tz)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link
        to="/audit-log"
        className="flex items-center gap-1 self-start rounded text-[11px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        Full history in the Audit Log
        <ArrowRight aria-hidden className="size-3" />
      </Link>
    </div>
  )
}

function HistoryTab({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const tz = c.site.timeZone
  const session = c.audit
    .filter((a) => a.targetId === p.id)
    .map((a) => ({ at: a.at, text: a.summary, actor: a.actor, id: a.id }))
  const issued = p.credentials.map((cr) => ({
    at: cr.issuedAt,
    text: `${credentialTitle(cr.kind)}${cr.last4 ? ` ••••${cr.last4}` : ''} issued${cr.autoProvisioned ? ' from the tenant roster' : ''}`,
    actor: cr.autoProvisioned
      ? 'SmartAccess (automatic)'
      : 'Building operations',
    id: cr.id,
  }))
  const entries = [...session, ...issued].sort((a, b) =>
    b.at.localeCompare(a.at),
  )
  return (
    <ol className="flex flex-col gap-3 border-l border-border pl-4">
      {entries.map((e) => (
        <li key={e.id} className="relative text-xs">
          <span
            aria-hidden
            className="absolute top-1.5 -left-[19px] size-1.5 rounded-full bg-subtle-foreground"
          />
          <p className="leading-4">{e.text}</p>
          <p className="font-mono text-[10px] leading-4 text-subtle-foreground">
            {formatDate(e.at, tz)} {formatTime(e.at, tz, { seconds: false })} ·{' '}
            {e.actor}
            {e.id.startsWith('AUD-') && ` · ${e.id}`}
          </p>
        </li>
      ))}
    </ol>
  )
}

// ---------- Footer ----------

function DrawerFooter({ person: p }: { person: DirectoryPerson }) {
  const { state: c } = useConsole()
  const { state, dispatch, run, canEdit } = usePeople()
  const confirm = useConfirmRemoval()
  const draft = state.groupDrafts[p.id]
  const dirty =
    !!draft &&
    (draft.length !== p.groupIds.length ||
      draft.some((id) => !p.groupIds.includes(id)))
  const name = directoryName(p, { privacy: c.privacy })
  const hasCredentials = p.credentials.some((cr) => cr.status !== 'revoked')
  const close = () => dispatch({ type: 'open-person', id: null })

  const save = () => {
    if (!draft) return
    const removed = p.groupIds.filter((id) => !draft.includes(id))
    const added = draft.filter((id) => !p.groupIds.includes(id))
    const label = (ids: string[]) =>
      ids
        .map((id) => state.groups.find((g) => g.id === id)?.name ?? id)
        .join(', ')
    const parts = [
      added.length && `added ${label(added)}`,
      removed.length && `removed ${label(removed)}`,
    ].filter(Boolean)
    const commit = (reason?: string) =>
      run({
        summary: `Access groups for ${fullName(p)}: ${parts.join('; ')}${reason ? ` (${reason})` : ''}`,
        title: `Access groups updated · ${name}`,
        targetId: p.id,
        apply: (ctx) => ({
          type: 'set-groups',
          personId: p.id,
          groupIds: draft,
          ...ctx,
        }),
      })
    if (removed.length === 0) return commit()
    confirm.ask({
      title: `Remove ${label(removed)}?`,
      description: `${name} will lose the doors only ${removed.length === 1 ? 'that group' : 'those groups'} grant.`,
      confirmLabel: 'Save and remove',
      onConfirm: commit,
    })
  }

  const revokeAll = () =>
    confirm.ask({
      title: `Revoke every credential for ${name}?`,
      description:
        'All of their badges, mobile credentials, PINs and passes stop working permanently. Issue new ones to restore access.',
      confirmLabel: 'Revoke all',
      onConfirm: (reason) =>
        run({
          summary: `Revoked all credentials for ${fullName(p)} (${reason})`,
          title: `All credentials revoked · ${name}`,
          targetId: p.id,
          apply: (ctx) => ({ type: 'revoke-all', personIds: [p.id], ...ctx }),
        }),
    })

  return (
    <>
      <button
        type="button"
        disabled={!canEdit || !hasCredentials}
        onClick={revokeAll}
        className="inline-flex h-[30px] items-center rounded border border-sev-critical/30 px-3 text-xs font-medium text-sev-critical outline-none hover:bg-sev-critical-bg focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        Revoke all credentials
      </button>
      <div className="flex items-center gap-2">
        {dirty && (
          <span className="text-[11px] text-muted-foreground">
            Unsaved group changes
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (dirty)
              dispatch({
                type: 'set-group-draft',
                personId: p.id,
                groupIds: null,
              })
            close()
          }}
          className="inline-flex h-[30px] items-center rounded border border-border px-3 text-xs outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {dirty ? 'Discard' : 'Done'}
        </button>
        <button
          type="button"
          disabled={!dirty || !canEdit}
          onClick={save}
          className="inline-flex h-[30px] items-center rounded bg-brand px-3.5 text-xs font-semibold text-brand-foreground outline-none hover:bg-brand/85 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Save changes
        </button>
      </div>
      {confirm.dialog}
    </>
  )
}

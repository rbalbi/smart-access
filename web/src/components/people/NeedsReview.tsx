import {
  ArrowRight,
  ChevronsDownUp,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  Lock,
  MoreHorizontal,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import { formatDateTime, maskPhone } from '@/lib/console/format'
import {
  classificationDetail,
  directoryName,
  fullName,
  groupsFor,
  typeLabels,
} from '@/lib/people/model'
import { sortedReview } from '@/lib/people/state'
import { cn } from '@/lib/utils'
import type { DirectoryPerson, ReviewAction, ReviewItem } from '@/types'
import { REVIEW_SECTION_ID } from './PeopleHeader'
import { CredentialChip, PersonAvatar, ReviewTag } from './parts'
import { iconButton, outlineButton } from '@/lib/people/styles'
import { useConfirmRemoval } from '@/hooks/useConfirmRemoval'

/** Rows shown before "Show N more". */
const VISIBLE = 3

export function NeedsReview() {
  const { state: c } = useConsole()
  const { state, dispatch } = usePeople()
  const items = sortedReview(state.review)
  const shown = state.reviewShowAll ? items : items.slice(0, VISIBLE)
  const hidden = items.slice(VISIBLE)
  const collapsed = state.reviewCollapsed
  const confirm = useConfirmRemoval()
  const [merging, setMerging] = useState<ReviewItem | null>(null)
  const listId = `${REVIEW_SECTION_ID}-list`

  return (
    <section
      id={REVIEW_SECTION_ID}
      tabIndex={-1}
      aria-labelledby={`${REVIEW_SECTION_ID}-title`}
      className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-surface-3 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <header
        className={cn(
          'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-surface-2 px-4 pt-4 pb-[17px]',
          !collapsed && 'border-b border-border',
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <CircleAlert
            aria-hidden
            className={cn(
              'size-4 shrink-0',
              items.length ? 'text-sev-critical' : 'text-ok',
            )}
          />
          <h2
            id={`${REVIEW_SECTION_ID}-title`}
            className="text-xs leading-4 font-semibold tracking-[-0.025em] uppercase"
          >
            Needs review
          </h2>
          <span
            className={cn(
              'rounded border px-[7px] py-[3px] font-mono text-[10px] leading-[15px] font-bold',
              items.length
                ? 'border-sev-critical/30 bg-sev-critical-bg text-sev-critical-fg'
                : 'border-border bg-surface-5 text-muted-foreground',
            )}
          >
            {items.length}
          </span>
          <p className="text-xs leading-4 text-muted-foreground">
            — Credential problems routed to a person. Everything else is kept up
            to date automatically.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={listId}
          onClick={() => dispatch({ type: 'toggle-review-collapsed' })}
          className="flex items-center gap-1 rounded px-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? 'Expand' : 'Collapse'}
          {collapsed ? (
            <ChevronsUpDown aria-hidden className="size-3.5" />
          ) : (
            <ChevronsDownUp aria-hidden className="size-3.5" />
          )}
        </button>
      </header>

      {!collapsed && (
        <div id={listId}>
          {items.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-6 text-xs text-muted-foreground">
              <CircleCheck aria-hidden className="size-4 text-ok" />
              All clear. Every credential change today was handled
              automatically.
            </p>
          ) : (
            <ul>
              {shown.map((item, i) => (
                <ReviewRow
                  key={item.id}
                  item={item}
                  first={i === 0}
                  onRemove={confirm.ask}
                  onMerge={() => setMerging(item)}
                />
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-2 px-4 pt-[9px] pb-2 text-xs leading-4">
              {hidden.length > 0 ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'toggle-review-show-all' })}
                  className="flex items-center gap-1 rounded font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {state.reviewShowAll ? (
                    'Show fewer'
                  ) : (
                    <>
                      Show {hidden.length} more (
                      {hidden
                        .map((r) => reviewName(r, state.people, c.privacy))
                        .join(', ')}
                      )
                      <ArrowRight aria-hidden className="size-3" />
                    </>
                  )}
                </button>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-subtle-foreground">
                All actions logged to the site’s immutable audit trail
              </span>
            </footer>
          )}
        </div>
      )}
      {confirm.dialog}
      {merging && (
        <MergeDialog item={merging} onClose={() => setMerging(null)} />
      )}
    </section>
  )
}

function reviewName(
  item: ReviewItem,
  people: DirectoryPerson[],
  privacy: boolean,
) {
  const p = people.find((x) => x.id === item.personId)
  if (privacy) return p?.person.roleLabel ?? 'Person'
  return item.title ?? (p ? fullName(p) : item.personId)
}

function ReviewRow({
  item,
  first,
  onRemove,
  onMerge,
}: {
  item: ReviewItem
  first: boolean
  onRemove: ReturnType<typeof useConfirmRemoval>['ask']
  onMerge: () => void
}) {
  const { state: c } = useConsole()
  const { state, dispatch, run, canEdit } = usePeople()
  const person = state.people.find((p) => p.id === item.personId)
  const masked = item.classified && c.role !== 'security'
  const name = reviewName(item, state.people, c.privacy)
  const toastName = person
    ? directoryName(person, { privacy: c.privacy })
    : name
  const open = () => dispatch({ type: 'open-person', id: item.personId })

  const decide = (action: ReviewAction, reason?: string) =>
    run({
      summary: `${item.id}: ${action.label} for ${person ? fullName(person) : name}${reason ? ` (${reason})` : ''}`,
      title: `${action.label} · ${toastName}`,
      targetId: item.personId,
      apply: (ctx) => ({
        type: 'resolve-review',
        itemId: item.id,
        actionId: action.id,
        ...ctx,
      }),
    })

  const onAction = (action: ReviewAction) => {
    if (action.id === 'compare-merge') return onMerge()
    if (!action.removesAccess) return decide(action)
    onRemove({
      title: `${action.label}?`,
      description: `${name} will lose access this credential grants. You can reverse it for 30 seconds afterwards.`,
      confirmLabel: action.label,
      onConfirm: (reason) => decide(action, reason),
    })
  }

  return (
    <li
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-l-2 py-3.5 pr-3.5 pl-4',
        !first && 'border-t border-t-border',
        item.severity === 'high' ? 'border-l-sev-critical' : 'border-l-border',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {masked ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-subtle-foreground bg-surface-4">
            <Lock aria-hidden className="size-3.5 text-muted-foreground" />
          </span>
        ) : person ? (
          <PersonAvatar person={person} privacy={c.privacy} />
        ) : null}
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={open}
              className="truncate rounded text-xs leading-4 font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {name}
            </button>
            <ReviewTag item={item} />
            <span className="text-[11px] leading-4 text-subtle-foreground">
              {item.context}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 text-xs leading-4">
            <span className="text-muted-foreground">
              {masked ? item.maskedDetail : item.detail}
            </span>
            {masked && (
              <>
                <span aria-hidden className="text-subtle-foreground">
                  ·
                </span>
                <span className="text-[11px] text-subtle-foreground">
                  Routed to the Security console. Access details are masked.
                </span>
              </>
            )}
            {!masked && item.exceptionId && item.exceptionNote && (
              <>
                <span aria-hidden className="text-subtle-foreground">
                  ·
                </span>
                <Link
                  to="/"
                  className="flex items-center gap-1 rounded text-[11px] text-sev-critical outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.exceptionNote} ({item.exceptionId})
                  <SquareArrowOutUpRight aria-hidden className="size-2.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {masked ? (
          <>
            <span className="pr-2 font-mono text-[11px] text-subtle-foreground">
              {item.requestId}
            </span>
            <button
              type="button"
              onClick={open}
              className={cn(
                outlineButton,
                'bg-surface-3 font-medium text-foreground',
              )}
            >
              View status
            </button>
          </>
        ) : (
          item.actions.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={!canEdit}
              onClick={() => onAction(a)}
              className={cn(
                outlineButton,
                a.tone === 'secondary' &&
                  'bg-surface-5 px-3 font-medium text-foreground hover:bg-surface-5/70',
              )}
            >
              {a.label}
            </button>
          ))
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${name}`}
            className={iconButton}
          >
            <MoreHorizontal aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={open} className="text-xs">
              Open person
            </DropdownMenuItem>
            {item.exceptionId && !masked && (
              <DropdownMenuItem render={<Link to="/" />} className="text-xs">
                Open in Live Activity
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-xs"
              onClick={() =>
                navigator.clipboard?.writeText(item.requestId ?? item.id)
              }
            >
              Copy reference {item.requestId ?? item.id}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

/** Side-by-side comparison for a possible duplicate, then merge or not. */
function MergeDialog({
  item,
  onClose,
}: {
  item: ReviewItem
  onClose: () => void
}) {
  const { state: c } = useConsole()
  const { state, run, now } = usePeople()
  const tz = c.site.timeZone
  const keep = state.people.find((p) => p.id === item.personId)
  // The other record shares the phone number.
  const other = state.people.find(
    (p) => p.id !== keep?.id && p.phone === keep?.phone,
  )
  if (!keep || !other) return null

  const merge = () => {
    run({
      summary: `${item.id}: merged ${other.id} into ${keep.id} (${fullName(keep)})`,
      title: `Merged duplicate profiles · ${directoryName(keep, { privacy: c.privacy })}`,
      targetId: keep.id,
      apply: (ctx) => ({
        type: 'merge',
        keepId: keep.id,
        mergeId: other.id,
        reviewId: item.id,
        ...ctx,
      }),
    })
    onClose()
  }

  const column = (p: DirectoryPerson, label: string) => (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs">
      <p className="font-mono text-[10px] text-subtle-foreground uppercase">
        {label} · {p.id}
      </p>
      <p className="font-semibold">
        {directoryName(p, { privacy: c.privacy })}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-subtle-foreground">Type</dt>
        <dd>{typeLabels[p.type]}</dd>
        <dt className="text-subtle-foreground">Organization</dt>
        <dd>{classificationDetail(p)}</dd>
        <dt className="text-subtle-foreground">Phone</dt>
        <dd className="font-mono">{maskPhone(p.phone)}</dd>
        <dt className="text-subtle-foreground">Source</dt>
        <dd>{p.sourceDetail}</dd>
        <dt className="text-subtle-foreground">Groups</dt>
        <dd>
          {groupsFor(p, state.groups)
            .map((g) => g.name)
            .join(', ')}
        </dd>
        <dt className="text-subtle-foreground">Last access</dt>
        <dd>
          {p.lastAccess ? formatDateTime(p.lastAccess.at, tz) : 'Never used'}
        </dd>
      </dl>
      <div className="flex flex-wrap gap-1">
        {p.credentials.map((cr) => (
          <CredentialChip key={cr.id} credential={cr} now={now} />
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border border-border bg-surface-3 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Compare possible duplicates
          </DialogTitle>
          <DialogDescription className="text-xs leading-5">
            Both records share the phone number {maskPhone(keep.phone)}. Merging
            keeps the roster record, moves the other record’s credentials and
            groups onto it, and deletes the duplicate. You can reverse it for 30
            seconds.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {column(keep, 'Keep')}
          {column(other, 'Merge into the left')}
        </div>
        <DialogFooter className="border-border bg-surface-2">
          <button type="button" className={outlineButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={merge}
            className="inline-flex h-7 items-center rounded bg-brand px-3 text-xs font-semibold text-brand-foreground outline-none hover:bg-brand/85 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Merge into {keep.id}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

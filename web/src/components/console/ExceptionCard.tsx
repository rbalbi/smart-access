import {
  BatteryWarning,
  Camera,
  ChevronDown,
  CircleCheck,
  Lock,
  MoreHorizontal,
  ShieldAlert,
  UserRound,
  UserRoundCheck,
} from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { actionsFor, type ExceptionAction } from '@/lib/console/actions'
import {
  displayName,
  formatCredential,
  formatDuration,
  formatTime,
  formatTimer,
} from '@/lib/console/format'
import { cn } from '@/lib/utils'
import type { ExceptionItem, Role } from '@/types'
import {
  ActionButton,
  Confidence,
  SeverityBadge,
  SeverityStrip,
  SignalList,
  StatusDot,
} from './primitives'

type Props = {
  item: ExceptionItem
  role: Role
  privacy: boolean
  timeZone: string
  now: string
  disabled: boolean
  whyOpen: boolean
  onWhyOpenChange: (open: boolean) => void
  onDecide: (action: ExceptionAction, note?: string) => void
  onAssignToMe: () => void
  onAddNote: (note: string) => void
}

type NoteMode = { kind: 'decision'; action: ExceptionAction } | { kind: 'note' }

export function ExceptionCard(props: Props) {
  const { item, role } = props
  if (item.classified && role !== 'security')
    return <ClassifiedCard {...props} />
  return <FullCard {...props} />
}

function CardHeader({
  item,
  timeZone,
  title,
  titleId,
  locked,
}: {
  item: ExceptionItem
  timeZone: string
  title: string
  titleId: string
  locked?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <SeverityBadge severity={item.severity} classified={locked} />
        <h3
          id={titleId}
          className={cn(
            'flex items-center gap-1.5 text-sm leading-5 font-semibold',
            locked && 'text-muted-foreground',
          )}
        >
          {locked && <Lock aria-hidden className="size-3.5" />}
          {title}
        </h3>
        {!locked && (
          <span className="font-mono text-xs text-muted-foreground">
            <span aria-hidden>· </span>
            {item.location}
          </span>
        )}
      </div>
      <time
        dateTime={item.occurredAt}
        className="shrink-0 font-mono text-xs whitespace-nowrap text-muted-foreground"
      >
        {formatTime(item.occurredAt, timeZone)}
      </time>
    </div>
  )
}

function FullCard({
  item,
  role,
  privacy,
  timeZone,
  now,
  disabled,
  whyOpen,
  onWhyOpenChange,
  onDecide,
  onAssignToMe,
  onAddNote,
}: Props) {
  const titleId = useId()
  const noteId = useId()
  const [noteMode, setNoteMode] = useState<NoteMode | null>(null)
  const [note, setNote] = useState('')
  const actions = actionsFor(item.type, role)

  const submitNote = () => {
    if (!noteMode || !note.trim()) return
    if (noteMode.kind === 'decision') onDecide(noteMode.action, note)
    else onAddNote(note)
    setNote('')
    setNoteMode(null)
  }

  const onNoteKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitNote()
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setNoteMode(null)
    }
  }

  return (
    <article
      id={`exception-${item.id}`}
      data-exception-id={item.id}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="relative flex flex-col gap-1.5 rounded-lg bg-surface-3 py-4 pr-4 pl-5 shadow-[0_1px_1px_rgb(0_0_0/0.05)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SeverityStrip severity={item.severity} />
      <CardHeader
        item={item}
        timeZone={timeZone}
        title={item.title}
        titleId={titleId}
      />

      <Details item={item} privacy={privacy} timeZone={timeZone} now={now} />

      <Collapsible
        open={whyOpen}
        onOpenChange={onWhyOpenChange}
        className="mt-1.5 rounded bg-surface-2"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="text-[11px] leading-4 font-medium tracking-[0.05em] text-muted-foreground uppercase">
            Why the system routed this to you
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            {whyOpen ? 'Hide' : 'Show'}
            <ChevronDown
              aria-hidden
              className={cn(
                'size-3.5 transition-transform',
                whyOpen && 'rotate-180',
              )}
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-2 px-2.5 pb-2.5">
          <p className="text-xs leading-4">
            <span className="font-bold">Policy applied: </span>
            <span className="font-mono text-brand-text">
              “{item.reasoning.policy}” ({item.reasoning.policyVersion})
            </span>
          </p>
          <SignalList
            signals={item.reasoning.signals}
            title="Sensor readings"
          />
          <Confidence value={item.reasoning.confidence} />
          {item.reasoning.routedBecause && (
            <p
              className={cn(
                'text-[11px] leading-4 font-medium',
                item.severity === 'critical'
                  ? 'text-sev-critical-fg'
                  : 'text-muted-foreground',
              )}
            >
              {item.reasoning.routedBecause}
            </p>
          )}
          {role === 'security' && item.cameraId && (
            <CameraStill id={item.cameraId} />
          )}
        </CollapsibleContent>
      </Collapsible>

      {noteMode && (
        <div className="mt-2 flex flex-col gap-2">
          <label htmlFor={noteId} className="text-xs font-medium">
            {noteMode.kind === 'decision'
              ? 'Resolution note (required)'
              : 'Note for the audit trail'}
          </label>
          <Textarea
            id={noteId}
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={onNoteKey}
            placeholder={
              noteMode.kind === 'decision'
                ? 'What happened, and how you confirmed it'
                : 'Add context for whoever picks this up next'
            }
            className="min-h-16 bg-surface-2 text-xs"
          />
          <div className="flex gap-2">
            <ActionButton
              tone="primary"
              disabled={!note.trim() || disabled}
              onClick={submitNote}
            >
              {noteMode.kind === 'decision'
                ? 'Confirm and resolve'
                : 'Save note'}
            </ActionButton>
            <ActionButton tone="ghost" onClick={() => setNoteMode(null)}>
              Cancel
            </ActionButton>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action, i) => {
            const isEscalate = action.id === 'escalate'
            return (
              <ActionButton
                key={action.id}
                tone={action.tone}
                disabled={disabled || noteMode !== null}
                data-action={
                  i === 0 ? 'primary' : isEscalate ? 'escalate' : 'alternative'
                }
                onClick={() =>
                  action.requiresNote
                    ? setNoteMode({ kind: 'decision', action })
                    : onDecide(action)
                }
              >
                {action.tone === 'primary' && action.requiresNote && (
                  <CircleCheck aria-hidden />
                )}
                {isEscalate && <ShieldAlert aria-hidden />}
                {action.label}
                {action.requiresNote && (
                  <span className="font-normal opacity-80">
                    (note required)
                  </span>
                )}
              </ActionButton>
            )
          })}
          {item.assignee && (
            <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              <UserRoundCheck aria-hidden className="size-3" />
              {item.assignee}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${item.title}`}
            className="inline-flex size-7 items-center justify-center rounded text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreHorizontal aria-hidden className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem disabled={disabled} onClick={onAssignToMe}>
              Assign to me
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={disabled}
              onClick={() => setNoteMode({ kind: 'note' })}
            >
              Add note…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}

/** Type-specific facts: who, and live timers for held doors and batteries. */
function Details({
  item,
  privacy,
  timeZone,
  now,
}: {
  item: ExceptionItem
  privacy: boolean
  timeZone: string
  now: string
}) {
  const summary = <p className="text-xs leading-[19.5px]">{item.summary}</p>

  if (item.heldOpen) {
    const held = (Date.parse(now) - Date.parse(item.heldOpen.since)) / 1000
    const over = held - item.heldOpen.limitSeconds
    return (
      <>
        <p className="text-xs leading-[19.5px]">
          Held open{' '}
          <span className="font-mono font-bold text-sev-high-fg">
            {formatDuration(held)}
          </span>
          . {item.summary}
        </p>
        <p className="flex w-fit items-center gap-1.5 rounded bg-surface-0 px-2.5 py-1 font-mono text-xs text-sev-high-fg">
          <StatusDot tone="warn" />
          <span>
            Open {formatTimer(held)} · limit{' '}
            {formatTimer(item.heldOpen.limitSeconds)}
            {over > 0 && ` (over by +${formatTimer(over)})`}
          </span>
        </p>
      </>
    )
  }

  if (item.battery) {
    return (
      <p className="flex items-start gap-1.5 text-xs leading-[19.5px]">
        <BatteryWarning
          aria-hidden
          className="mt-0.5 size-3.5 shrink-0 text-sev-high-fg"
        />
        <span>
          Battery at{' '}
          <span className="font-mono text-sev-high-fg">
            {item.battery.percent}%
          </span>{' '}
          (~{formatDuration(item.battery.minutesRemaining * 60)} remaining).{' '}
          {item.summary}
        </span>
      </p>
    )
  }

  if (item.visitor && item.subject) {
    const waited =
      (Date.parse(now) - Date.parse(item.visitor.notifiedAt)) / 1000
    return (
      <>
        {summary}
        <div className="flex flex-col gap-1 rounded bg-surface-2 px-2 py-1.5 text-xs">
          <span className="flex flex-wrap items-center gap-x-2">
            <UserRound aria-hidden className="size-3.5 text-muted-foreground" />
            <span className="font-medium">
              {displayName(item.subject, { privacy })}
            </span>
            <span className="text-muted-foreground">
              → visiting {privacy ? 'a tenant host' : item.visitor.host} (
              {item.visitor.hostOrg})
            </span>
          </span>
          <span className="font-mono text-[11px] text-subtle-foreground">
            Host notified at{' '}
            {formatTime(item.visitor.notifiedAt, timeZone, { seconds: false })}{' '}
            · waiting {formatDuration(waited)}
          </span>
        </div>
      </>
    )
  }

  return (
    <>
      {summary}
      {item.subject && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded bg-surface-2 px-2 py-1.5 text-xs">
          <UserRound aria-hidden className="size-3.5 text-muted-foreground" />
          <span className="font-medium">
            {displayName(item.subject, { privacy })}
          </span>
          {item.subject.org && (
            <>
              <span aria-hidden className="text-subtle-foreground">
                ·
              </span>
              <span className="text-muted-foreground">{item.subject.org}</span>
            </>
          )}
          {item.credential && (
            <>
              <span aria-hidden className="text-subtle-foreground">
                ·
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {formatCredential(item.credential)}
              </span>
            </>
          )}
        </p>
      )}
    </>
  )
}

function CameraStill({ id }: { id: string }) {
  return (
    <figure className="flex aspect-video max-h-36 flex-col items-center justify-center gap-1 rounded border border-dashed border-border bg-surface-0 text-muted-foreground">
      <Camera aria-hidden className="size-5" />
      <figcaption className="font-mono text-[11px]">
        Camera still · {id} (not available in demo)
      </figcaption>
    </figure>
  )
}

/** What Operations sees for a security-classified exception. */
function ClassifiedCard({ item, timeZone }: Props) {
  const titleId = useId()
  const [showStatus, setShowStatus] = useState(false)
  return (
    <article
      id={`exception-${item.id}`}
      data-exception-id={item.id}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="relative flex flex-col gap-2 rounded-lg border border-dashed border-border bg-surface-3/50 py-4 pr-4 pl-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <SeverityStrip severity={item.severity} muted />
      <CardHeader
        item={item}
        timeZone={timeZone}
        title={`Security-classified event at ${item.location}`}
        titleId={titleId}
        locked
      />
      <p className="text-xs leading-[19.5px] text-muted-foreground">
        Routed to the Security team. Details, sensor readings and camera stills
        are restricted to Security roles.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-subtle-foreground">
          Routing ID: {item.routingId}
        </span>
        <ActionButton
          aria-expanded={showStatus}
          onClick={() => setShowStatus((v) => !v)}
        >
          View status (read-only)
        </ActionButton>
      </div>
      {showStatus && (
        <p className="rounded bg-surface-2 px-2.5 py-1.5 text-xs text-muted-foreground">
          Status: open with the Security team. You’ll see it leave this list
          when they close it.
        </p>
      )}
    </article>
  )
}

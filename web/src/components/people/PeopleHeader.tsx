import {
  ChevronUp,
  CircleCheck,
  ExternalLink,
  IdCard,
  RefreshCcwDot,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router'
import { Skeleton, StatusDot } from '@/components/console/primitives'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import {
  formatNumber,
  formatPercent,
  formatTime,
  timeZoneAbbr,
} from '@/lib/console/format'
import { credentialStats, reviewCounts } from '@/lib/people/state'
import { cn } from '@/lib/utils'
import { reviewSeverityStyle } from '@/lib/people/styles'

export const REVIEW_SECTION_ID = 'needs-review'

export function PeopleHeader() {
  const { state: c } = useConsole()
  const { state, dispatch } = usePeople()
  const tz = c.site.timeZone
  const synced = state.rosters.filter((r) => r.ok).length
  const lastSync = state.rosters
    .map((r) => r.syncedAt)
    .sort()
    .at(-1)

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl leading-8 font-semibold tracking-[-0.025em] whitespace-nowrap">
            People & Credentials
          </h1>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface-4 px-[11px] py-[3px]">
            <span className="font-mono text-xs leading-4 font-bold text-brand">
              {formatNumber(state.people.length)}
            </span>
            <span className="text-[11px] leading-4 font-medium text-muted-foreground">
              active profiles
            </span>
          </span>
        </div>
        <p className="max-w-[60ch] text-xs leading-4 text-muted-foreground">
          Badges, mobile credentials and who can go where across {c.site.name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface-3 px-[13px] text-xs whitespace-nowrap text-muted-foreground shadow-xs outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring">
            <StatusDot tone={synced === state.rosters.length ? 'ok' : 'warn'} />
            <span>
              Tenant rosters ·{' '}
              <span className="font-medium text-foreground">
                {synced} of {state.rosters.length} synced
              </span>
              {lastSync && ` · ${formatTime(lastSync, tz, { seconds: false })}`}
            </span>
            <CircleCheck aria-hidden className="size-3.5 text-ok" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tenant roster syncs (SCIM)</DropdownMenuLabel>
              <ul className="flex flex-col gap-1 px-1.5 pb-1.5">
                {state.rosters.map((r) => (
                  <li
                    key={r.tenant}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <StatusDot tone={r.ok ? 'ok' : 'bad'} />
                      {r.tenant}
                    </span>
                    <span className="font-mono text-[11px] text-subtle-foreground">
                      {formatNumber(r.people)} ·{' '}
                      {formatTime(r.syncedAt, tz, { seconds: false })}
                    </span>
                  </li>
                ))}
              </ul>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/policies"
          target="_blank"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-3 px-[13px] text-xs font-medium whitespace-nowrap outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {c.role === 'security'
            ? 'Manage access groups'
            : 'View access groups'}
          <ExternalLink aria-hidden className="size-3 text-muted-foreground" />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>

        <button
          type="button"
          onClick={() => dispatch({ type: 'set-adding', adding: true })}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-semibold whitespace-nowrap text-brand-foreground shadow-xs outline-none hover:bg-brand/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2"
        >
          <UserPlus aria-hidden className="size-3.5" />
          Add person
        </button>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        'relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface-3 p-4 shadow-xs',
        className,
      )}
    >
      {children}
    </section>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs leading-4 font-semibold tracking-[-0.025em] whitespace-nowrap">
      {children}
    </h2>
  )
}

function BigNumber({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'text-[30px] leading-9 font-semibold tracking-[-0.025em] whitespace-nowrap tabular-nums',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SummaryStrip() {
  const { state: c } = useConsole()
  const { state, now } = usePeople()
  const tz = c.site.timeZone
  const a = state.automation
  const handled = a.issued + a.revokedOnOffboarding + a.expiredOnSchedule
  const creds = credentialStats(state.people, now)
  const share = (n: number) =>
    creds.total ? formatPercent(n / creds.total, 0) : '0%'
  const segments = [
    { label: 'Mobile', value: creds.mobile, bar: 'bg-brand' },
    { label: 'Badge', value: creds.badge, bar: 'bg-ok' },
    { label: 'QR pass', value: creds.qr, bar: 'bg-subtle-foreground' },
    { label: 'Other', value: creds.other, bar: 'bg-subtle-foreground/50' },
  ]
  const counts = reviewCounts(state.review)
  const open = state.review.length

  const goToReview = () => {
    const section = document.getElementById(REVIEW_SECTION_ID)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    section?.focus({ preventScroll: true })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-12 gap-4">
        <SummaryCard
          label="Kept current automatically"
          className="col-span-12 gap-0.5 border-border/80 md:col-span-6 xl:col-span-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle>Kept current automatically</CardTitle>
              <span className="rounded border border-brand/20 bg-brand/10 px-[7px] py-px font-mono text-[10px] leading-[15px] text-brand uppercase">
                7d autonomy
              </span>
            </div>
            <RefreshCcwDot aria-hidden className="size-4 text-brand" />
          </div>
          <div className="flex items-baseline gap-3 py-2.5">
            <BigNumber>{handled}</BigNumber>
            <span className="text-xs leading-4 text-muted-foreground">
              credential changes handled automatically in the last 7 days
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-[11px] text-[11px] leading-4">
            <span className="truncate text-muted-foreground">
              {a.issued} mobile credentials issued · {a.revokedOnOffboarding}{' '}
              revoked on offboarding · {a.expiredOnSchedule} passes expired
            </span>
            <span className="shrink-0 font-medium text-ok">
              {a.neededPerson} needed a person
            </span>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 -bottom-6 size-32 rounded-full bg-brand/5 blur-[20px]"
          />
        </SummaryCard>

        <SummaryCard
          label="Active credentials"
          className="col-span-12 justify-between md:col-span-6 xl:col-span-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle>Active credentials</CardTitle>
              <span className="text-[11px] leading-4 text-muted-foreground">
                for {formatNumber(creds.holders)} people
              </span>
            </div>
            <IdCard aria-hidden className="size-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 py-2">
            <BigNumber>{formatNumber(creds.total)}</BigNumber>
            <span className="flex flex-col text-[11px] leading-[14px] text-muted-foreground">
              <span>
                Mobile {share(creds.mobile)} · Badge {share(creds.badge)} · QR
                pass {share(creds.qr)}
              </span>
              <span className="pt-0.5 font-mono text-[10px] leading-[15px] text-subtle-foreground">
                PIN & biometric {share(creds.other)}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-border pt-[9px]">
            <div
              aria-hidden
              className="flex h-1.5 overflow-hidden rounded-full bg-surface-5"
            >
              {segments.map((s) => (
                <span
                  key={s.label}
                  className={cn('h-full', s.bar)}
                  style={{ width: `${(s.value / (creds.total || 1)) * 100}%` }}
                />
              ))}
            </div>
            <p className="flex justify-between gap-2 font-mono text-[10px] leading-[15px] text-subtle-foreground">
              {segments.map((s) => (
                <span key={s.label} className="whitespace-nowrap">
                  {s.label} {formatNumber(s.value)}
                </span>
              ))}
            </p>
          </div>
        </SummaryCard>

        <SummaryCard
          label="Needs review"
          className="col-span-12 p-0 xl:col-span-3"
        >
          <button
            type="button"
            onClick={goToReview}
            className="flex h-full flex-col gap-1 rounded-lg p-4 text-left outline-none hover:bg-surface-4/50 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex w-full items-start justify-between gap-2">
              <span className="flex items-center gap-2">
                <CardTitle>Needs review</CardTitle>
                {open > 0 && (
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-sev-critical"
                  />
                )}
              </span>
              <ChevronUp
                aria-hidden
                className="size-3.5 text-muted-foreground"
              />
            </span>
            <span className="flex items-center gap-3 py-2">
              <BigNumber className={open > 0 ? 'text-sev-critical' : 'text-ok'}>
                {open}
              </BigNumber>
              <span className="text-xs leading-4 text-muted-foreground">
                {open === 0
                  ? 'Nothing needs a person right now'
                  : 'exceptions require human signoff'}
              </span>
            </span>
            <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-border pt-[11px]">
              {(['high', 'medium', 'low'] as const).map((sev) => {
                const s = reviewSeverityStyle(sev)
                return (
                  <span
                    key={sev}
                    className={cn(
                      'flex items-center gap-1 text-[11px] leading-4 font-medium whitespace-nowrap',
                      sev === 'high' ? 'text-sev-critical' : s.text,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('size-1.5 rounded-full', s.dot)}
                    />
                    {counts[sev]}{' '}
                    {sev === 'high'
                      ? 'High'
                      : sev === 'medium'
                        ? 'Medium'
                        : 'Low'}
                  </span>
                )
              })}
            </span>
          </button>
        </SummaryCard>
      </div>
      <p className="flex items-center justify-end gap-1.5 text-[10px] leading-[15px] text-subtle-foreground">
        <StatusDot tone="muted" className="size-1" />
        As of {formatTime(now, tz, { seconds: false })} {timeZoneAbbr(tz)} ·
        Real-time pipeline updates every 60s
      </p>
    </div>
  )
}

export function SummaryStripSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <Skeleton className="col-span-5 h-36" />
      <Skeleton className="col-span-4 h-36" />
      <Skeleton className="col-span-3 h-36" />
    </div>
  )
}

import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { useConsole } from '@/hooks/useConsole'
import {
  formatDuration,
  formatNumber,
  formatPercent,
  formatTime,
  timeZoneAbbr,
} from '@/lib/console/format'
import { kpis } from '@/lib/console/state'
import { cn } from '@/lib/utils'
import type { Severity } from '@/types'
import { Skeleton, SeverityChip, StatusDot } from './primitives'

function KpiCard({
  label,
  aside,
  className,
  children,
}: {
  label: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        'relative flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-lg bg-surface-3 p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-[11px] leading-4 font-medium tracking-[0.05em] text-muted-foreground uppercase">
          {label}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

function BigNumber({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-mono text-4xl leading-10 font-bold tracking-[-0.025em] whitespace-nowrap tabular-nums',
        className,
      )}
    >
      {children}
    </span>
  )
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function KpiStrip() {
  const { state, dispatch } = useConsole()
  const k = kpis(state)
  const tz = state.site.timeZone
  const series = [...state.weekAutonomy, k.autonomy].map((v, i) => ({
    i,
    v: v * 100,
  }))
  const up = k.autonomyDeltaPts >= 0
  const filterTo = (severity: Severity) =>
    dispatch({
      type: 'set-filter',
      filters: {
        severity: state.filters.severity === severity ? 'all' : severity,
      },
    })

  return (
    <div className="flex flex-col gap-2 px-6 pt-6 pb-2">
      <div className="grid grid-cols-12 gap-4">
        <KpiCard
          label="Autonomous resolution"
          className="col-span-12 lg:col-span-6 xl:col-span-4"
          aside={
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-semibold whitespace-nowrap',
                up ? 'text-ok' : 'text-sev-high-fg',
              )}
            >
              {up ? (
                <ArrowUpRight aria-hidden className="size-3.5" />
              ) : (
                <ArrowDownRight aria-hidden className="size-3.5" />
              )}
              {up ? '+' : ''}
              {k.autonomyDeltaPts.toFixed(1)} pts
              <span className="sr-only">versus the 7-day average</span>
            </span>
          }
        >
          <div className="flex items-center gap-3">
            <BigNumber>{formatPercent(k.autonomy)}</BigNumber>
            <p className="max-w-48 text-xs leading-[16.5px] text-muted-foreground">
              of today’s access events resolved without human intervention
            </p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-xs leading-4 whitespace-nowrap">
                {formatNumber(k.handled)} of {formatNumber(k.total)} events
              </span>
              <span className="text-[11px] leading-4 text-muted-foreground">
                7-day avg: {formatPercent(k.weekAvg)}
              </span>
            </div>
            <figure className="w-32 shrink-0">
              <div className="h-8" aria-hidden>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={series}
                    margin={{ top: 4, right: 4, bottom: 2, left: 2 }}
                  >
                    <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="var(--brand)"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <figcaption className="flex justify-between font-mono text-[11px] leading-4 text-subtle-foreground">
                <span>
                  {weekdays[0]} {formatPercent(state.weekAutonomy[0], 0)}
                </span>
                <span>Today {formatPercent(k.autonomy)}</span>
              </figcaption>
            </figure>
          </div>
          {/* Decorative glow from the design. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-brand/5 blur-2xl"
          />
        </KpiCard>

        <KpiCard
          label="Open exceptions"
          className="col-span-12 lg:col-span-6 xl:col-span-3"
          aside={
            k.open > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-sev-critical-fg">
                <StatusDot tone="bad" />
                Requires action
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-ok">
                <StatusDot tone="ok" />
                All clear
              </span>
            )
          }
        >
          <div className="flex items-baseline gap-2">
            <BigNumber className={k.open > 0 ? 'text-sev-critical' : undefined}>
              {k.open}
            </BigNumber>
            <span className="text-xs text-muted-foreground">
              routed to security &amp; ops
            </span>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter Needs you by severity"
          >
            {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <SeverityChip
                key={sev}
                variant="count"
                severity={sev}
                count={k.severity[sev]}
                pressed={state.filters.severity === sev}
                onClick={() => filterTo(sev)}
              />
            ))}
          </div>
        </KpiCard>

        <KpiCard
          label="Median resolution"
          className="col-span-12 lg:col-span-6 xl:col-span-3"
          aside={
            k.fasterBySeconds !== 0 && (
              <span
                className={cn(
                  'flex items-center gap-1 font-mono text-xs whitespace-nowrap',
                  k.fasterBySeconds > 0 ? 'text-ok' : 'text-sev-high-fg',
                )}
              >
                {k.fasterBySeconds > 0 ? (
                  <ArrowDownRight aria-hidden className="size-3.5" />
                ) : (
                  <ArrowUpRight aria-hidden className="size-3.5" />
                )}
                {formatDuration(Math.abs(k.fasterBySeconds))}{' '}
                {k.fasterBySeconds > 0 ? 'faster' : 'slower'}
              </span>
            )
          }
        >
          <div className="flex items-baseline gap-2">
            <BigNumber>{formatDuration(k.medianSeconds)}</BigNumber>
            <span className="text-xs text-muted-foreground">
              for human reviews
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              7-day baseline:{' '}
              <span className="font-mono whitespace-nowrap text-foreground">
                {formatDuration(k.baselineSeconds)}
              </span>
            </span>
            <span
              className={cn(
                'font-mono text-[11px] whitespace-nowrap',
                k.improvement >= 0 ? 'text-ok' : 'text-sev-high-fg',
              )}
            >
              {formatPercent(Math.abs(k.improvement))}{' '}
              {k.improvement >= 0 ? 'improved' : 'worse'}
            </span>
          </div>
        </KpiCard>

        <KpiCard
          label="Doors"
          className="col-span-12 lg:col-span-6 xl:col-span-2"
          aside={
            <Link
              to="/doors"
              aria-label="Open Doors & Devices"
              className="rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink aria-hidden className="size-3.5" />
            </Link>
          }
        >
          <div className="flex flex-col gap-0.5">
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-mono text-2xl font-bold tabular-nums">
                {k.doorsOnline}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                / {k.doorsTotal}
              </span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-ok">
              <StatusDot tone="ok" />
              {formatPercent(k.doorsOnline / k.doorsTotal, 0)} operational
            </span>
          </div>
          <ul className="flex flex-col gap-1 text-[11px] leading-4">
            {k.doorsOffline.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-1.5 text-sev-critical-fg"
              >
                <StatusDot tone="bad" />
                <span className="truncate" title={`Offline: ${d.name}`}>
                  Offline: {d.name}
                </span>
              </li>
            ))}
            {k.doorsOnBattery.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-1.5 text-sev-high-fg"
              >
                <StatusDot tone="warn" />
                <span className="truncate" title={`On battery: ${d.name}`}>
                  On battery: {d.name}
                </span>
              </li>
            ))}
          </ul>
        </KpiCard>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] leading-4 text-muted-foreground">
        <p>
          <span className="font-bold">Today</span> = since 12:00 AM{' '}
          {timeZoneAbbr(tz)} <span aria-hidden>•</span> KPIs update with every
          event
        </p>
        <p className="font-mono text-subtle-foreground">
          Last update {formatTime(state.lastUpdateAt, tz)} {timeZoneAbbr(tz)}
        </p>
      </div>
    </div>
  )
}

export function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 pt-6 pb-8">
      {['xl:col-span-4', 'xl:col-span-3', 'xl:col-span-3', 'xl:col-span-2'].map(
        (span) => (
          <div
            key={span}
            className={cn(
              'col-span-12 flex h-44 flex-col justify-between rounded-lg bg-surface-3 p-4 lg:col-span-6',
              span,
            )}
          >
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        ),
      )}
    </div>
  )
}

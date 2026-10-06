import {
  ArrowRight,
  Monitor,
  Pause,
  Play,
  Settings2,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { DemoControls } from '@/components/console/DemoControls'
import { EventDrawer } from '@/components/console/EventDrawer'
import { HandledLane } from '@/components/console/HandledLane'
import { KpiStrip, KpiStripSkeleton } from '@/components/console/KpiStrip'
import { LaneSkeleton, NeedsYouLane } from '@/components/console/NeedsYouLane'
import { Kbd, StatusDot } from '@/components/console/primitives'
import { useConsole } from '@/hooks/useConsole'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useNow } from '@/hooks/useNow'
import { formatDuration, formatTime, timeZoneAbbr } from '@/lib/console/format'
import { chipCounts, isPaused } from '@/lib/console/state'
import { cn } from '@/lib/utils'

type Lane = 'needs-you' | 'handled'

export function LiveActivityPage() {
  const { state, scenario } = useConsole()
  const [lane, setLane] = useState<Lane>('needs-you')
  const wide = useMediaQuery('(min-width: 1024px)')
  useKeyboardShortcuts()

  const style = {
    // Sticky lane headers sit under the top bar (and the privacy banner).
    '--console-top': state.privacy ? '5.375rem' : '3.5rem',
  } as CSSProperties

  // Below 1024px the console is not supported (desktop-first tool), and the
  // hidden console is not rendered at all.
  if (!wide) return <NarrowScreenNotice />

  return (
    <div className="flex flex-1 flex-col" style={style}>
      <div className="flex flex-1 flex-col">
        <PageHeader />
        {state.connection === 'lost' && <ConnectionBanner />}

        {scenario === 'loading' ? (
          <div aria-busy="true" aria-label="Loading live activity">
            <KpiStripSkeleton />
            <div className="grid grid-cols-12 gap-6 px-6 py-3">
              <div className="col-span-12 xl:col-span-7">
                <LaneSkeleton rows={3} tall />
              </div>
              <div className="hidden xl:col-span-5 xl:block">
                <LaneSkeleton rows={6} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <KpiStrip />

            {/* 1024-1279px: the lanes become tabs. */}
            <div
              role="tablist"
              aria-label="Lanes"
              className="mx-6 mt-3 flex gap-1 rounded-lg bg-surface-3 p-1 xl:hidden"
            >
              {(
                [
                  ['needs-you', `Needs you (${chipCounts(state).all})`],
                  ['handled', 'Handled automatically'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={lane === value}
                  onClick={() => setLane(value)}
                  className={cn(
                    'h-8 flex-1 rounded text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    lane === value
                      ? 'bg-surface-5 font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid flex-1 grid-cols-12 items-start gap-6 px-6 py-3">
              <NeedsYouLane
                className={cn(
                  'col-span-12 xl:col-span-7',
                  lane !== 'needs-you' && 'hidden xl:flex',
                )}
              />
              <div
                className={cn(
                  'relative col-span-12 self-stretch xl:col-span-5',
                  lane !== 'handled' && 'hidden xl:block',
                )}
              >
                <HandledLane className="h-full" />
                <div className="pointer-events-none absolute inset-0 z-[15]">
                  <div className="pointer-events-auto sticky top-[calc(var(--console-top)+1rem)] max-h-[calc(100svh-var(--console-top)-4rem)]">
                    <EventDrawer className="max-h-[calc(100svh-var(--console-top)-4rem)]" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <ShortcutFooter />
      </div>
    </div>
  )
}

function NarrowScreenNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <Monitor aria-hidden className="size-8 text-muted-foreground" />
      <h1 className="text-base font-semibold">
        Live Activity needs a wider screen
      </h1>
      <p className="max-w-80 text-sm text-muted-foreground">
        This console is designed for desktop. Use a window at least 1024 pixels
        wide.
      </p>
    </div>
  )
}

function PageHeader() {
  const { state, dispatch, announce } = useConsole()
  const now = useNow(1000)
  const paused = isPaused(state)
  const since = (Date.parse(now) - Date.parse(state.lastUpdateAt)) / 1000
  const togglePause = () => {
    dispatch({ type: 'set-manual-pause', paused: !state.manualPause })
    announce(
      state.manualPause ? 'Live updates resumed.' : 'Live updates paused.',
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-surface-2 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl leading-7 font-semibold tracking-[-0.025em] whitespace-nowrap">
          Live Activity
        </h1>
        <span
          role="status"
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
            state.connection === 'lost'
              ? 'bg-sev-critical-bg text-sev-critical-fg'
              : paused
                ? 'bg-sev-high-bg text-sev-high-fg'
                : 'bg-ok-bg text-ok-fg',
          )}
        >
          <StatusDot
            tone={state.connection === 'lost' ? 'bad' : paused ? 'warn' : 'ok'}
          />
          {state.connection === 'lost'
            ? 'Disconnected'
            : paused
              ? `Paused${state.manualPause ? '' : ' while you work'}`
              : `Live · updated ${formatDuration(since)} ago`}
        </span>
        <span aria-hidden className="text-xs text-muted-foreground">
          |
        </span>
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {state.site.name} · Site console
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/policies"
          className="flex items-center gap-1.5 rounded-md bg-surface-4 px-2.5 py-1 text-xs font-medium whitespace-nowrap outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Settings2 aria-hidden className="size-3.5 text-muted-foreground" />
          Autonomy level:{' '}
          <span className="font-bold text-brand-text">Balanced</span>
        </Link>
        <button
          type="button"
          aria-pressed={state.manualPause}
          disabled={state.connection === 'lost'}
          onClick={togglePause}
          className="flex items-center gap-1.5 rounded-md bg-surface-3 px-3 py-1 text-xs font-medium whitespace-nowrap outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {state.manualPause ? (
            <Play aria-hidden className="size-3" />
          ) : (
            <Pause aria-hidden className="size-3" />
          )}
          {state.manualPause ? 'Resume live updates' : 'Pause live updates'}
          <Kbd>P</Kbd>
        </button>
        <Link
          to="/audit-log"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          View audit log
          <ArrowRight aria-hidden className="size-3" />
        </Link>
      </div>
    </div>
  )
}

function ConnectionBanner() {
  const { state } = useConsole()
  const tz = state.site.timeZone
  return (
    <div
      role="alert"
      className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-sev-critical/40 bg-sev-critical-bg px-4 py-3 text-xs text-sev-critical-fg"
    >
      <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">
          Connection to {state.site.gateway} lost.
        </span>{' '}
        Showing data as of {formatTime(state.lastUpdateAt, tz)}{' '}
        {timeZoneAbbr(tz)}. Doors keep enforcing policy locally; decisions here
        are paused until the console reconnects.
      </p>
    </div>
  )
}

function ShortcutFooter() {
  const { state } = useConsole()
  const live = state.connection === 'live'
  return (
    <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-2 px-6 pt-[9px] pb-2 text-[11px] leading-4 text-subtle-foreground">
      <ul
        className="flex flex-wrap items-center gap-4"
        aria-label="Keyboard shortcuts"
      >
        <li className="flex items-center gap-1">
          <Kbd>J</Kbd>/<Kbd>K</Kbd> Navigate exceptions
        </li>
        <li className="flex items-center gap-1">
          <Kbd>Enter</Kbd> Show reasoning
        </li>
        <li className="flex items-center gap-1">
          <Kbd>P</Kbd> Pause stream
        </li>
        <li className="flex items-center gap-1">
          <Kbd>Esc</Kbd> Close details
        </li>
      </ul>
      <div className="flex items-center gap-4">
        <DemoControls />
        <p className="flex items-center gap-2">
          {live
            ? `Connected to ${state.site.gateway}`
            : `Disconnected from ${state.site.gateway}`}
          <StatusDot tone={live ? 'ok' : 'bad'} className="size-2" />
        </p>
      </div>
    </footer>
  )
}

/** J/K move between exception cards, Enter toggles reasoning, P pauses. */
function useKeyboardShortcuts() {
  const { state, dispatch, announce } = useConsole()
  const manualPause = state.manualPause
  const live = state.connection === 'live'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
      const target = e.target as HTMLElement
      if (
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="menu"], [role="listbox"]',
        )
      )
        return

      const key = e.key.toLowerCase()
      if (key === 'j' || key === 'k') {
        const cards = [
          ...document.querySelectorAll<HTMLElement>('[data-exception-id]'),
        ].filter((el) => el.offsetParent !== null)
        if (cards.length === 0) return
        const current = cards.findIndex((el) =>
          el.contains(document.activeElement),
        )
        const next =
          current === -1
            ? 0
            : Math.min(
                cards.length - 1,
                Math.max(0, current + (key === 'j' ? 1 : -1)),
              )
        cards[next].focus()
        cards[next].scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      } else if (key === 'enter' && target.matches('[data-exception-id]')) {
        target
          .querySelector<HTMLElement>('[data-slot="collapsible-trigger"]')
          ?.click()
        e.preventDefault()
      } else if (key === 'p' && live) {
        dispatch({ type: 'set-manual-pause', paused: !manualPause })
        announce(manualPause ? 'Live updates resumed.' : 'Live updates paused.')
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, announce, manualPause, live])
}

import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  EyeOff,
  Search,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConsole } from '@/hooks/useConsole'
import { actors } from '@/lib/console/context'
import { formatTime, timeZoneAbbr } from '@/lib/console/format'
import { openExceptions } from '@/lib/console/state'
import { cn } from '@/lib/utils'
import { Kbd, StatusDot } from './primitives'

const otherSites = [
  { name: 'Riverside Plant 3', address: 'Charlotte, NC' },
  { name: 'Northgate Logistics Hub', address: 'Columbus, OH' },
]

const iconButton =
  'relative inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'

export function TopBar() {
  const { state, dispatch, announce } = useConsole()
  const navigate = useNavigate()
  const open = openExceptions(state).length
  const tz = state.site.timeZone
  const [seenAudit, setSeenAudit] = useState(0)
  const unseen = state.audit.length - seenAudit

  const togglePrivacy = () => {
    const next = !state.privacy
    dispatch({ type: 'set-privacy', privacy: next })
    announce(next ? 'Privacy mode on. Names are hidden.' : 'Privacy mode off.')
  }

  return (
    <div className="sticky top-0 z-20">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-surface-1/95 px-6 backdrop-blur-sm">
        <div className="flex shrink-0 items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-3 px-[11px] py-[5px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex flex-col">
                <span className="text-xs leading-4 font-semibold whitespace-nowrap">
                  {state.site.name}
                </span>
                <span className="text-[11px] leading-[15px] whitespace-nowrap text-muted-foreground">
                  {state.site.address} · {timeZoneAbbr(tz)}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className="size-3.5 text-muted-foreground"
              />
              <span className="sr-only">Switch site</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sites</DropdownMenuLabel>
                <DropdownMenuItem className="justify-between">
                  <span>
                    {state.site.name}
                    <span className="block text-xs text-muted-foreground">
                      {open} open exceptions
                    </span>
                  </span>
                  <Check aria-hidden className="size-4" />
                </DropdownMenuItem>
                {otherSites.map((s) => (
                  <DropdownMenuItem key={s.name} disabled>
                    <span>
                      {s.name}
                      <span className="block text-xs text-muted-foreground">
                        Not connected in this demo
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                All sites (portfolio view): coming soon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => {
              navigate('/')
              requestAnimationFrame(() =>
                document.getElementById('needs-you-heading')?.focus(),
              )
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
              open > 0
                ? 'border-sev-critical/30 bg-sev-critical-bg text-sev-critical-fg'
                : 'border-ok/30 bg-ok-bg text-ok-fg',
            )}
          >
            <StatusDot tone={open > 0 ? 'bad' : 'ok'} />
            {open} {open === 1 ? 'exception' : 'exceptions'}
          </button>
        </div>

        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              aria-label="Search people, doors and events in both lanes"
              placeholder="Search people, doors, events…"
              value={state.search}
              onChange={(e) =>
                dispatch({ type: 'set-search', search: e.target.value })
              }
              className="h-8 w-full rounded-lg border border-border bg-surface-3 pr-3 pl-8 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-pressed={state.privacy}
            onClick={togglePrivacy}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-lg border px-[11px] text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
              state.privacy
                ? 'border-brand bg-brand/20 text-brand-text'
                : 'border-border text-muted-foreground hover:bg-surface-5 hover:text-foreground',
            )}
          >
            <EyeOff aria-hidden className="size-3.5" />
            Privacy{state.privacy ? ' on' : ''}
          </button>

          <DropdownMenu
            onOpenChange={(o) => o && setSeenAudit(state.audit.length)}
          >
            <DropdownMenuTrigger
              aria-label={
                unseen > 0
                  ? `Recent activity, ${unseen} new`
                  : 'Recent activity'
              }
              className={iconButton}
            >
              <Bell aria-hidden className="size-3.5" />
              {unseen > 0 && (
                <span
                  aria-hidden
                  className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-surface-1"
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Recent activity (this session)
                </DropdownMenuLabel>
                {state.audit.slice(0, 6).map((a) => (
                  <DropdownMenuItem
                    key={a.id}
                    onClick={() => navigate('/audit-log')}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs">{a.summary}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatTime(a.at, tz)} · {a.id}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
                {state.audit.length === 0 && (
                  <p className="px-1.5 py-2 text-xs text-muted-foreground">
                    No decisions yet. They’ll appear here as you make them.
                  </p>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Keyboard shortcuts and help"
              className={iconButton}
            >
              <CircleHelp aria-hidden className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Keyboard shortcuts</DropdownMenuLabel>
                {[
                  ['J / K', 'Next / previous exception'],
                  ['Enter', 'Show or hide the reasoning'],
                  ['P', 'Pause or resume live updates'],
                  ['Esc', 'Close the details drawer'],
                ].map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-1.5 py-1 text-xs"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <Kbd>{key}</Kbd>
                  </div>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account and view"
              className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              <UserRound aria-hidden className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {actors[state.role].name}
                  <span className="block font-normal">
                    {actors[state.role].title}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const role =
                    state.role === 'operations' ? 'security' : 'operations'
                  dispatch({ type: 'set-role', role, actor: actors[role].name })
                  announce(`Now viewing as ${actors[role].name}, ${role}.`)
                }}
              >
                View as{' '}
                {state.role === 'operations'
                  ? 'Security (David)'
                  : 'Operations (Maria)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {state.privacy && (
        <div
          role="status"
          // Opaque base under the tint so scrolled content never shows through.
          className="flex items-center justify-between gap-3 border-b border-brand/40 bg-[color-mix(in_oklab,var(--brand)_15%,var(--surface-1))] px-6 py-1.5 text-xs text-brand-soft"
        >
          <span className="flex items-center gap-1.5">
            <EyeOff aria-hidden className="size-3.5" />
            Privacy mode is on: names, hosts and plates are hidden, and camera
            stills are off. Safe for screen sharing.
          </span>
          <button
            type="button"
            onClick={togglePrivacy}
            className="font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Turn off
          </button>
        </div>
      )}
    </div>
  )
}

import {
  Activity,
  DoorOpen,
  IdCard,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { ConsoleProvider } from '@/components/console/ConsoleProvider'
import { Skeleton, StatusDot } from '@/components/console/primitives'
import { TopBar } from '@/components/console/TopBar'
import { useConsole } from '@/hooks/useConsole'
import { actors } from '@/lib/console/context'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Live Activity', icon: Activity, live: true },
  { to: '/people', label: 'People & Credentials', icon: IdCard },
  { to: '/visitors', label: 'Visitors', icon: UsersRound },
  { to: '/doors', label: 'Doors & Devices', icon: DoorOpen },
  {
    to: '/policies',
    label: 'Access Policy & Autonomy',
    icon: SlidersHorizontal,
  },
  { to: '/audit-log', label: 'Audit Log', icon: ScrollText },
]

export function AppLayout() {
  return (
    <ConsoleProvider siteId="harborview" fallback={<ShellSkeleton />}>
      <div className="flex min-h-svh bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main id="main" className="flex flex-1 flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </ConsoleProvider>
  )
}

function Brand() {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-3">
          <ShieldCheck aria-hidden className="size-4 text-brand" />
        </span>
        <div>
          <p className="text-sm leading-[14px] font-semibold tracking-[-0.025em]">
            SmartAccess
          </p>
          <p className="pt-1 text-[11px] leading-[15px] font-medium tracking-[0.05em] text-muted-foreground uppercase">
            Site console
          </p>
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
  const { state } = useConsole()
  const live = state.connection === 'live'
  const me = actors[state.role]
  const initials = me.name
    .split(' ')
    .map((p) => p[0])
    .join('')

  return (
    // Sticky and full height so the sidebar never ends mid-page.
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col justify-between border-r border-border bg-surface-2 lg:flex">
      <div className="flex flex-col">
        <Brand />
        <p className="px-5 pt-[22px] pb-[11px] text-[11px] leading-[15px] font-bold tracking-[0.1em] text-subtle-foreground uppercase">
          Navigation
        </p>
        <nav aria-label="Main" className="flex flex-col gap-0.5 px-2">
          {nav.map(({ to, label, icon: Icon, live: isLive }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'border-l-2 border-brand bg-surface-5 pl-3.5 font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-surface-5/50 hover:text-foreground',
                )
              }
            >
              <span className="flex items-center gap-3">
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
              </span>
              {isLive && (
                <StatusDot
                  tone={live ? 'ok' : 'bad'}
                  pulse={live}
                  className="size-2"
                />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-border bg-surface-3/40 p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 p-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{me.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {me.title}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function ShellSkeleton() {
  return (
    <div
      className="flex min-h-svh bg-background"
      aria-busy="true"
      aria-label="Loading site console"
    >
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-2 lg:block">
        <Brand />
      </aside>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-7 h-96" />
          <Skeleton className="col-span-5 h-96" />
        </div>
      </div>
    </div>
  )
}

import {
  Bell,
  Building2,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/buildings', label: 'Buildings', icon: Building2 },
  { to: '/access-log', label: 'Access Log', icon: ScrollText },
  { to: '/policies', label: 'Policies', icon: ShieldCheck },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export function AppLayout() {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
        <div className="px-6 py-5 text-lg font-semibold">SmartAccess</div>
        <nav className="flex flex-col gap-1 px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent',
                  isActive && 'bg-sidebar-accent font-medium',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

import { PageHeader } from '@/components/PageHeader'
import { StatusDot } from '@/components/console/primitives'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useConsole } from '@/hooks/useConsole'

const stateLabel = {
  online: { label: 'Online', tone: 'ok' },
  battery: { label: 'On battery', tone: 'warn' },
  offline: { label: 'Offline', tone: 'bad' },
} as const

export function DoorsPage() {
  const { state } = useConsole()
  // Problems first, then alphabetical.
  const rank = { offline: 0, battery: 1, online: 2 }
  const doors = [...state.doors].sort(
    (a, b) => rank[a.state] - rank[b.state] || a.name.localeCompare(b.name),
  )
  return (
    <div className="p-6">
      <PageHeader
        title="Doors & Devices"
        description={`${state.site.name} · ${state.doors.length} access points`}
      />
      <div className="max-w-2xl rounded-lg bg-surface-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Door</TableHead>
              <TableHead>Controller status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doors.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <StatusDot
                      tone={stateLabel[d.state].tone}
                      className="size-2"
                    />
                    {stateLabel[d.state].label}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

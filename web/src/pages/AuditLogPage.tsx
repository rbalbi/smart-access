import { PageHeader } from '@/components/PageHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useConsole } from '@/hooks/useConsole'
import { formatDateTime, maskFreeText } from '@/lib/console/format'

export function AuditLogPage() {
  const { state } = useConsole()
  return (
    <div className="p-6">
      <PageHeader
        title="Audit Log"
        description="Every decision, override and reveal made in this session"
      />
      {state.audit.length === 0 ? (
        <p className="max-w-xl rounded-lg border border-dashed border-border bg-surface-3/50 p-6 text-sm text-muted-foreground">
          No actions recorded in this session yet. Decisions you make on Live
          Activity appear here with their audit IDs.
        </p>
      ) : (
        <div className="rounded-lg bg-surface-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit ID</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>What happened</TableHead>
                <TableHead>Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDateTime(a.at, state.site.timeZone)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {state.privacy ? 'Staff member' : a.actor}
                  </TableCell>
                  <TableCell className="max-w-md text-xs whitespace-normal">
                    {maskFreeText(a.summary, state.privacy)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {a.targetId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { ConfirmRemoval } from '@/components/people/parts'

type RemovalRequest = {
  title: string
  description: ReactNode
  confirmLabel: string
  onConfirm: (reason: string) => void
}

/** `ask(...)` opens the removal confirmation; render `dialog` once. */
export function useConfirmRemoval() {
  const [request, setRequest] = useState<RemovalRequest | null>(null)
  const dialog = (
    <ConfirmRemoval
      open={request !== null}
      onOpenChange={(o) => !o && setRequest(null)}
      title={request?.title ?? ''}
      description={request?.description}
      confirmLabel={request?.confirmLabel ?? 'Confirm'}
      onConfirm={(reason) => request?.onConfirm(reason)}
    />
  )
  return { ask: setRequest, dialog }
}

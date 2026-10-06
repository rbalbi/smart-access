import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ActionButton } from './primitives'

type Props = {
  title: string
  auditId: string
  /** Absent when the decision cannot be reversed from the toast. */
  reversibleUntil?: string
  onReverse?: () => void
  onDismiss: () => void
}

/** Confirmation after a decision: what happened, its audit ID, and Reverse. */
export function DecisionToast({
  title,
  auditId,
  reversibleUntil,
  onReverse,
  onDismiss,
}: Props) {
  const remaining = useSecondsUntil(reversibleUntil)
  return (
    <div className="flex w-[min(500px,calc(100vw-2rem))] items-center justify-between gap-3 rounded-lg border border-border bg-surface-5 p-[15px] text-foreground shadow-[0_20px_25px_-5px_rgb(0_0_0/0.1),0_8px_10px_-6px_rgb(0_0_0/0.1)]">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <Check aria-hidden className="size-3.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs leading-4 font-semibold" title={title}>
            {title}
          </p>
          <p className="font-mono text-[11px] leading-4 text-subtle-foreground">
            Logged to audit trail {auditId}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onReverse && remaining > 0 && (
          <ActionButton tone="secondary" onClick={onReverse}>
            Reverse{' '}
            <span className="font-mono tabular-nums">({remaining}s)</span>
          </ActionButton>
        )}
        <ActionButton tone="ghost" aria-label="Dismiss" onClick={onDismiss}>
          <X aria-hidden />
        </ActionButton>
      </div>
    </div>
  )
}

function useSecondsUntil(iso?: string) {
  const calc = () =>
    iso ? Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 1000)) : 0
  const [seconds, setSeconds] = useState(calc)
  useEffect(() => {
    if (!iso) return
    const id = setInterval(() => setSeconds(calc()), 250)
    return () => clearInterval(id)
  }, [iso])
  return seconds
}

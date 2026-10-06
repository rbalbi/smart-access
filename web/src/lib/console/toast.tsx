import { toast } from 'sonner'
import { DecisionToast } from '@/components/console/DecisionToast'
import { REVERSE_WINDOW_MS } from './state'

export function showDecisionToast(opts: {
  title: string
  auditId: string
  reversibleUntil?: string
  onReverse?: () => void
}) {
  const id = toast.custom(
    (t) => (
      <DecisionToast
        {...opts}
        onReverse={
          opts.onReverse &&
          (() => {
            opts.onReverse?.()
            toast.dismiss(t)
          })
        }
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    { duration: opts.reversibleUntil ? REVERSE_WINDOW_MS : 6000 },
  )
  return id
}

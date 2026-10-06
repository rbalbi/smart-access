import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 560px drawer from the right that overlays the directory without pushing it,
 * so the list keeps its scroll position. Modal: focus stays inside, Escape
 * closes, and focus returns to whatever opened it.
 */
export function Sheet({
  open,
  onClose,
  label,
  header,
  footer,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  header: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/50 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          aria-label={label}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[560px] max-w-full flex-col border-l border-border bg-surface-2 text-foreground shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)] outline-none',
            'duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right',
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-1 px-5">
            {header}
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface-3 px-4 pt-[17px] pb-4">
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const SheetTitle = DialogPrimitive.Title
export const SheetClose = DialogPrimitive.Close

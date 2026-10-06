import { cva } from 'class-variance-authority'
import {
  CircleAlert,
  Info,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { Severity } from '@/types'

// Class maps shared by console components. Colors come only from the
// console tokens in index.css.

export const severityStyles: Record<
  Severity,
  { bg: string; fg: string; strip: string; icon: LucideIcon; label: string }
> = {
  critical: {
    bg: 'bg-sev-critical-bg',
    fg: 'text-sev-critical-fg',
    strip: 'bg-sev-critical',
    icon: OctagonAlert,
    label: 'Critical',
  },
  high: {
    bg: 'bg-sev-high-bg',
    fg: 'text-sev-high-fg',
    strip: 'bg-sev-high',
    icon: TriangleAlert,
    label: 'High',
  },
  medium: {
    bg: 'bg-sev-medium-bg',
    fg: 'text-sev-medium-fg',
    strip: 'bg-sev-medium',
    icon: CircleAlert,
    label: 'Medium',
  },
  low: {
    bg: 'bg-sev-low-bg',
    fg: 'text-sev-low-fg',
    strip: 'bg-sev-low',
    icon: Info,
    label: 'Low',
  },
}

export function severityStyle(severity: Severity) {
  return severityStyles[severity]
}

export const actionButtonVariants = cva(
  'inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-3 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        primary: 'bg-brand text-brand-foreground hover:bg-brand/85',
        secondary: 'bg-surface-4 text-foreground hover:bg-surface-5',
        warning: 'bg-sev-high/20 text-sev-high-fg hover:bg-sev-high/30',
        soft: 'bg-brand/20 text-brand-text hover:bg-brand/30',
        danger:
          'bg-sev-critical-bg text-sev-critical-fg hover:bg-sev-critical/25',
        ghost:
          'px-1.5 text-muted-foreground hover:bg-surface-5 hover:text-foreground',
      },
    },
    defaultVariants: { tone: 'secondary' },
  },
)

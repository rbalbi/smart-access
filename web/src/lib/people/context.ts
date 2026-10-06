import { createContext, type Dispatch } from 'react'
import type { PeopleAction, PeopleState } from './state'

export type AuditedChange = {
  /** Audit trail summary, e.g. "Suspended badge ••••4821 for Kenji Watanabe". */
  summary: string
  targetId?: string
  /** Toast title; defaults to the summary. */
  title?: string
  /** Offer "Reverse" in the toast (default true). */
  reversible?: boolean
  apply: (ctx: { auditId: string; at: string }) => PeopleAction
}

export type PeopleContextValue = {
  state: PeopleState
  dispatch: Dispatch<PeopleAction>
  /** Current time, refreshed every minute; drives expiry-based statuses. */
  now: string
  /** Changes are paused while the console is disconnected. */
  canEdit: boolean
  /** Apply a change, log it to the site audit trail and confirm with a toast. */
  run: (change: AuditedChange) => string | null
}

export const PeopleContext = createContext<PeopleContextValue | null>(null)

import { createContext, type Dispatch } from 'react'
import type { LiveMessage } from '@/api/client'
import type { ConsoleAction, ConsoleState } from './state'

export type ConsoleContextValue = {
  state: ConsoleState
  dispatch: Dispatch<ConsoleAction>
  /** Dev toolbar: feed a message into the stream as if the backend sent it. */
  inject: (msg: LiveMessage) => void
  /** Politely or urgently announce a change to screen readers. */
  announce: (message: string, urgency?: 'polite' | 'assertive') => void
}

export const ConsoleContext = createContext<ConsoleContextValue | null>(null)

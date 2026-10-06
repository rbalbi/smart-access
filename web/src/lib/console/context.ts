import { createContext, type Dispatch } from 'react'
import type { LiveMessage } from '@/api/client'
import type { ConsoleAction, ConsoleState } from './state'

/** Demo-only overrides used to show states that are hard to reach live. */
export type Scenario = 'normal' | 'loading' | 'empty'

export type ConsoleContextValue = {
  state: ConsoleState
  dispatch: Dispatch<ConsoleAction>
  /** Feed a message into the stream as if the backend sent it. */
  inject: (msg: LiveMessage) => void
  /** Announce a change to screen readers. */
  announce: (message: string, urgency?: 'polite' | 'assertive') => void
  scenario: Scenario
  setScenario: (scenario: Scenario) => void
}

export const ConsoleContext = createContext<ConsoleContextValue | null>(null)

export const actors = {
  operations: { name: 'Maria Alvarez', title: 'Operations · Meridian' },
  security: { name: 'David Okafor', title: 'Security & IT · Meridian' },
} as const

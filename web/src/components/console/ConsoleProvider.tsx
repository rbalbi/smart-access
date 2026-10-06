import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api, type LiveMessage } from '@/api/client'
import { actors, ConsoleContext, type Scenario } from '@/lib/console/context'
import { initialState, reducer } from '@/lib/console/state'
import type { ConsoleSnapshot } from '@/types'
import { Button } from '@/components/ui/button'

type Props = {
  siteId: string
  fallback: ReactNode
  children: ReactNode
}

/** Loads the site snapshot, then hands off to the live console. */
export function ConsoleProvider({ siteId, fallback, children }: Props) {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .console(siteId)
      .then((s) => !cancelled && setSnapshot(s))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [siteId, attempt])

  if (error) {
    return (
      <div
        role="alert"
        className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background p-6 text-center"
      >
        <p className="text-sm font-medium">Couldn’t load the site console.</p>
        <p className="font-mono text-xs text-subtle-foreground">{error}</p>
        <Button
          variant="secondary"
          onClick={() => {
            setError(null)
            setAttempt((n) => n + 1)
          }}
        >
          Try again
        </Button>
      </div>
    )
  }
  if (!snapshot) return <>{fallback}</>
  return <LiveConsole snapshot={snapshot}>{children}</LiveConsole>
}

function LiveConsole({
  snapshot,
  children,
}: {
  snapshot: ConsoleSnapshot
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, snapshot, (s) =>
    initialState(s, {
      role: 'operations',
      actor: actors.operations.name,
      now: new Date().toISOString(),
    }),
  )
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [polite, setPolite] = useState('')
  const [assertive, setAssertive] = useState('')

  const announce = useCallback(
    (message: string, urgency: 'polite' | 'assertive' = 'polite') => {
      const set = urgency === 'assertive' ? setAssertive : setPolite
      // Clear first so repeating the same message is announced again.
      set('')
      requestAnimationFrame(() => set(message))
    },
    [],
  )

  const receive = useCallback(
    (msg: LiveMessage) => {
      const at = new Date().toISOString()
      if (msg.kind === 'event') {
        dispatch({ type: 'receive-event', event: msg.event, at })
      } else {
        dispatch({ type: 'receive-exception', exception: msg.exception, at })
        const e = msg.exception
        announce(
          `New ${e.severity} exception: ${e.title} at ${e.location}`,
          e.severity === 'critical' ? 'assertive' : 'polite',
        )
      }
    },
    [announce],
  )

  // Live stream; stops while the console is disconnected.
  const live = state.connection === 'live'
  useEffect(() => {
    if (!live) return
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    api
      .subscribe(state.site.id, receive)
      .then((u) => (cancelled ? u() : (unsubscribe = u)))
      .catch(() =>
        dispatch({
          type: 'set-connection',
          connection: 'lost',
          at: new Date().toISOString(),
        }),
      )
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [live, state.site.id, receive])

  // Send every new audit entry to the backend.
  const sent = useRef(new Set<string>())
  useEffect(() => {
    for (const entry of state.audit) {
      if (sent.current.has(entry.id)) continue
      sent.current.add(entry.id)
      api.recordAudit(entry).catch(() => {
        // Keep it queued for the next render; the real backend will need a
        // durable outbox here.
        sent.current.delete(entry.id)
      })
    }
  }, [state.audit])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      inject: receive,
      announce,
      scenario,
      setScenario,
    }),
    [state, receive, announce, scenario],
  )

  return (
    <ConsoleContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" role="status">
        {polite}
      </div>
      <div className="sr-only" aria-live="assertive" role="alert">
        {assertive}
      </div>
    </ConsoleContext.Provider>
  )
}

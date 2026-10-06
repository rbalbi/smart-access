import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { useConsole } from '@/hooks/useConsole'
import { useNow } from '@/hooks/useNow'
import { nowIso } from '@/lib/console/format'
import { nextAuditId, REVERSE_WINDOW_MS } from '@/lib/console/state'
import { showDecisionToast } from '@/lib/console/toast'
import { PeopleContext, type AuditedChange } from '@/lib/people/context'
import { initialPeopleState, peopleReducer } from '@/lib/people/state'
import type { PeopleSnapshot } from '@/types'

/** Loads the site's directory, then provides it to the People screen. */
export function PeopleProvider({
  fallback,
  children,
}: {
  fallback: ReactNode
  children: ReactNode
}) {
  const { state } = useConsole()
  const siteId = state.site.id
  const [snapshot, setSnapshot] = useState<PeopleSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    api
      .people(siteId)
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
        className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <p className="text-sm font-medium">
          Couldn’t load the people directory.
        </p>
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
  return <Directory snapshot={snapshot}>{children}</Directory>
}

function Directory({
  snapshot,
  children,
}: {
  snapshot: PeopleSnapshot
  children: ReactNode
}) {
  const {
    state: consoleState,
    dispatch: consoleDispatch,
    announce,
  } = useConsole()
  const [state, dispatch] = useReducer(
    peopleReducer,
    snapshot,
    initialPeopleState,
  )
  const now = useNow(60_000)
  const canEdit = consoleState.connection === 'live'

  const run = useCallback(
    (change: AuditedChange) => {
      if (!canEdit) return null
      const at = nowIso()
      const auditId = nextAuditId(consoleState, at)
      dispatch(change.apply({ auditId, at }))
      consoleDispatch({
        type: 'log',
        summary: change.summary,
        targetId: change.targetId,
        at,
      })
      const title = change.title ?? change.summary
      showDecisionToast({
        title,
        auditId,
        reversibleUntil:
          change.reversible === false
            ? undefined
            : new Date(Date.parse(at) + REVERSE_WINDOW_MS).toISOString(),
        onReverse:
          change.reversible === false
            ? undefined
            : () => {
                dispatch({ type: 'reverse', auditId })
                consoleDispatch({
                  type: 'log',
                  summary: `Reversed ${auditId}: ${change.summary}`,
                  targetId: change.targetId,
                  at: nowIso(),
                })
                announce(`Reversed: ${title}.`)
              },
      })
      announce(`${title}. Logged to audit trail ${auditId}.`)
      return auditId
    },
    [canEdit, consoleState, consoleDispatch, announce],
  )

  const value = useMemo(
    () => ({ state, dispatch, now, canEdit, run }),
    [state, now, canEdit, run],
  )
  return (
    <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>
  )
}

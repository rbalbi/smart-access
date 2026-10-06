import { FlaskConical, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useConsole } from '@/hooks/useConsole'
import { actors, type Scenario } from '@/lib/console/context'
import { nowIso } from '@/lib/console/format'
import { openExceptions } from '@/lib/console/state'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'
import { ActionButton } from './primitives'

/**
 * Demo-only panel to reach states that are hard to trigger live. A real
 * deployment would hide this behind a feature flag.
 */
export function DemoControls() {
  const { state, dispatch, inject, announce, scenario, setScenario } =
    useConsole()
  const [open, setOpen] = useState(false)

  const trigger = (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground outline-none hover:bg-surface-5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <FlaskConical aria-hidden className="size-3" />
      Demo controls
    </button>
  )
  if (!open) return trigger

  const setRole = (role: Role) => {
    dispatch({ type: 'set-role', role, actor: actors[role].name })
    announce(`Now viewing as ${actors[role].name}.`)
  }

  const setConnection = async (live: boolean) => {
    dispatch({
      type: 'set-connection',
      connection: live ? 'live' : 'lost',
      at: nowIso(),
    })
    announce(
      live ? 'Reconnected. Live updates resumed.' : 'Connection lost.',
      live ? 'polite' : 'assertive',
    )
    if (live) {
      // Doors kept deciding locally while the console was offline.
      const { nextEvent, seededRng } = await import('@/mocks/stream')
      const rng = seededRng(Date.now())
      for (let i = 0; i < 2; i++) {
        const event = nextEvent(rng, new Date(Date.now() - (i + 1) * 20_000))
        inject({ kind: 'event', event: { ...event, recordedOffline: true } })
      }
    }
  }

  const injectCritical = async () => {
    const { injectCritical } = await import('@/mocks/simulator')
    injectCritical(inject)
  }

  const resolveElsewhere = () => {
    const target = openExceptions(state).find((e) => !e.classified)
    if (!target) return
    const by =
      state.role === 'operations'
        ? actors.security.name
        : actors.operations.name
    dispatch({
      type: 'resolved-elsewhere',
      exceptionId: target.id,
      by,
      at: nowIso(),
    })
    const message = `${target.title} at ${target.location} was resolved by ${by}.`
    toast(message)
    announce(message)
  }

  return (
    <>
      {trigger}
      <section
        aria-label="Demo controls"
        className="fixed right-4 bottom-12 z-40 flex w-72 flex-col gap-3 rounded-lg border border-border bg-surface-4 p-3 text-xs shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-semibold">
            <FlaskConical aria-hidden className="size-3.5" />
            Demo controls
          </h2>
          <button
            type="button"
            aria-label="Close demo controls"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </div>

        <Segmented
          label="View as"
          value={state.role}
          options={[
            { value: 'operations', label: 'Operations' },
            { value: 'security', label: 'Security' },
          ]}
          onChange={setRole}
        />
        <Segmented<Scenario>
          label="Screen state"
          value={scenario}
          options={[
            { value: 'normal', label: 'Live' },
            { value: 'loading', label: 'Loading' },
            { value: 'empty', label: 'Empty' },
          ]}
          onChange={setScenario}
        />
        <Segmented
          label="Gateway connection"
          value={state.connection}
          options={[
            { value: 'live', label: 'Connected' },
            { value: 'lost', label: 'Lost' },
          ]}
          onChange={(v) => setConnection(v === 'live')}
        />

        <div className="flex flex-col gap-1.5">
          <ActionButton
            tone="danger"
            disabled={state.connection === 'lost'}
            onClick={injectCritical}
          >
            Send a critical exception
          </ActionButton>
          <ActionButton onClick={resolveElsewhere}>
            Resolve one from another console
          </ActionButton>
        </div>
      </section>
    </>
  )
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="pb-1 text-[11px] text-muted-foreground">
        {label}
      </legend>
      <div className="flex gap-1 rounded bg-surface-2 p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-6 flex-1 rounded text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === o.value
                ? 'bg-surface-5 font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

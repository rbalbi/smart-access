import { Monitor, WifiOff } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { Skeleton } from '@/components/console/primitives'
import { AddPersonDrawer } from '@/components/people/AddPersonDrawer'
import { Directory } from '@/components/people/Directory'
import { NeedsReview } from '@/components/people/NeedsReview'
import {
  PeopleHeader,
  SummaryStrip,
  SummaryStripSkeleton,
} from '@/components/people/PeopleHeader'
import { PeopleProvider } from '@/components/people/PeopleProvider'
import { PersonDrawer } from '@/components/people/PersonDrawer'
import { useConsole } from '@/hooks/useConsole'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePeople } from '@/hooks/usePeople'
import type { DrawerTab } from '@/lib/people/state'

export function PeoplePage() {
  const wide = useMediaQuery('(min-width: 1024px)')
  // Desktop-first tool, like Live Activity.
  if (!wide) return <NarrowScreenNotice />
  return (
    <PeopleProvider fallback={<PeopleSkeleton />}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 border-b border-border bg-surface-2 px-8 pt-6 pb-4">
          <PeopleHeader />
          <SummaryStrip />
        </div>
        <ConnectionNotice />
        <div className="flex flex-col gap-4 bg-surface-0 px-8 pt-4 pb-12">
          <NeedsReview />
          <Directory />
        </div>
      </div>
      <PersonDrawer />
      <AddPersonDrawer />
      <PersonDeepLink />
    </PeopleProvider>
  )
}

const tabs: DrawerTab[] = ['credentials', 'access', 'activity', 'history']

/**
 * `?person=PER-008812&tab=access` opens that person's drawer (global search,
 * links from Live Activity), and the URL follows the open drawer.
 */
function PersonDeepLink() {
  const { state, dispatch } = usePeople()
  const [params, setParams] = useSearchParams()
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    applied.current = true
    const id = params.get('person')
    const tab = params.get('tab') as DrawerTab | null
    if (id && state.people.some((p) => p.id === id))
      dispatch({
        type: 'open-person',
        id,
        tab: tab && tabs.includes(tab) ? tab : undefined,
      })
  }, [params, state.people, dispatch])

  const open = state.openPersonId
  useEffect(() => {
    if (!applied.current) return
    if ((params.get('person') ?? null) === open) return
    const next = new URLSearchParams(params)
    if (open) next.set('person', open)
    else next.delete('person')
    next.delete('tab')
    setParams(next, { replace: true })
  }, [open, params, setParams])

  return null
}

function ConnectionNotice() {
  const { state } = useConsole()
  if (state.connection === 'live') return null
  return (
    <div
      role="alert"
      className="mx-8 mt-4 flex items-start gap-2 rounded-lg border border-sev-critical/40 bg-sev-critical-bg px-4 py-3 text-xs text-sev-critical-fg"
    >
      <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-semibold">
          Connection to {state.site.gateway} lost.
        </span>{' '}
        You can still look people up. Credential changes are paused until the
        console reconnects.
      </p>
    </div>
  )
}

function PeopleSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading people and credentials"
    >
      <div className="flex flex-col gap-6 border-b border-border bg-surface-2 px-8 pt-6 pb-4">
        <Skeleton className="h-8 w-80" />
        <SummaryStripSkeleton />
      </div>
      <div className="flex flex-col gap-4 px-8 pt-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

function NarrowScreenNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <Monitor aria-hidden className="size-8 text-muted-foreground" />
      <h1 className="text-base font-semibold">
        People & Credentials needs a wider screen
      </h1>
      <p className="max-w-80 text-sm text-muted-foreground">
        This console is designed for desktop. Use a window at least 1024 pixels
        wide.
      </p>
    </div>
  )
}

import { useMemo } from 'react'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import { filterPeople } from '@/lib/people/state'

/** The filtered directory, shared with the drawer's next/previous arrows. */
export function useDirectoryRows() {
  const { state: c } = useConsole()
  const { state, now } = usePeople()
  return useMemo(() => filterPeople(state, now, c.role), [state, now, c.role])
}

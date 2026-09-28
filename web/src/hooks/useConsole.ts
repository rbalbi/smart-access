import { useContext } from 'react'
import { ConsoleContext } from '@/lib/console/context'

export function useConsole() {
  const value = useContext(ConsoleContext)
  if (!value) throw new Error('useConsole must be used inside ConsoleProvider')
  return value
}

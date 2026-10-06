import { useContext } from 'react'
import { PeopleContext } from '@/lib/people/context'

export function usePeople() {
  const value = useContext(PeopleContext)
  if (!value) throw new Error('usePeople must be used inside PeopleProvider')
  return value
}

import { useEffect, useState } from 'react'

/** Current time as an ISO string, refreshed every `intervalMs`. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date().toISOString())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

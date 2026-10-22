import { useEffect } from 'react'
import { useReportQuery } from '../../state/reportQuery'

/** Routed home page; reads the shared header query instead of localStorage. */
export function HomePage() {
  const query = useReportQuery()

  // Whole query as dependency: any committed header change — and Refresh via
  // `revision` — cancels the previous request and starts the next one.
  useEffect(() => {
    const controller = new AbortController()

    // Replace with the report request built from `query` (preset, start, end,
    // compare, sourceId, perspective, currency, filters), passing
    // `controller.signal` so a newer query cancels the in-flight request.
    return () => {
      controller.abort()
    }
  }, [query])

  return null
}

import { useEffect, useReducer, type ReactNode } from 'react'
import { ReportQueryDispatchContext, ReportQueryStateContext } from './context'
import { reportQueryReducer } from './reducer'
import {
  readStoredReportQuery,
  resolveStoredQuery,
  writeStoredReportQuery,
} from './storage'

/** Loads the saved query once, then writes back on every committed change. */
export function ReportQueryProvider({ children }: { children: ReactNode }) {
  const [query, dispatch] = useReducer(reportQueryReducer, undefined, () =>
    resolveStoredQuery(readStoredReportQuery()),
  )

  useEffect(() => {
    writeStoredReportQuery(query)
  }, [query])

  return (
    <ReportQueryDispatchContext.Provider value={dispatch}>
      <ReportQueryStateContext.Provider value={query}>
        {children}
      </ReportQueryStateContext.Provider>
    </ReportQueryDispatchContext.Provider>
  )
}

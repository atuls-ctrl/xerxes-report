import { createContext, type Dispatch } from 'react'
import type { ReportQueryAction } from './reducer'
import type { ReportQuery } from './types'

// Split so write-only callers do not re-render when the query changes.

/** Current query. `null` means no `ReportQueryProvider` above the caller. */
export const ReportQueryStateContext = createContext<ReportQuery | null>(null)

/** Reducer dispatch. `null` means no `ReportQueryProvider` above the caller. */
export const ReportQueryDispatchContext =
  createContext<Dispatch<ReportQueryAction> | null>(null)
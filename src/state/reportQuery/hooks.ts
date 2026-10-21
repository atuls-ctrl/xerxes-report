import { useContext, useMemo } from 'react'
import type { DatePickerValue } from '../../components/DatePicker'
import { ReportQueryDispatchContext, ReportQueryStateContext } from './context'
import { fromDatePickerValue } from './dates'
import type { Currency, Perspective, ReportFilter, ReportQuery } from './types'

/**
 * Current header query. Pages use this as their request input.
 * Throws outside the provider so a page never fetches with a guessed range.
 */
export function useReportQuery(): ReportQuery {
  const query = useContext(ReportQueryStateContext)
  if (!query) {
    throw new Error('useReportQuery must be used within ReportQueryProvider')
  }
  return query
}

/** Header writes, one per control. */
export interface ReportQueryActions {
  setDate: (value: DatePickerValue) => void
  setCompare: (compare: boolean) => void
  setSource: (sourceId: string) => void
  setPerspective: (perspective: Perspective) => void
  setCurrency: (currency: Currency) => void
  /** Applied filters only; Clear sends `[]`. */
  setFilters: (filters: ReportFilter[]) => void
  refresh: () => void
}

/** Writes used by the header. Stable for the lifetime of the provider. */
export function useReportQueryActions(): ReportQueryActions {
  const dispatch = useContext(ReportQueryDispatchContext)
  if (!dispatch) {
    throw new Error(
      'useReportQueryActions must be used within ReportQueryProvider',
    )
  }

  return useMemo(
    () => ({
      setDate(value) {
        dispatch({ type: 'setDate', ...fromDatePickerValue(value) })
      },
      setCompare(compare) {
        dispatch({ type: 'setCompare', compare })
      },
      setSource(sourceId) {
        dispatch({ type: 'setSource', sourceId })
      },
      setPerspective(perspective) {
        dispatch({ type: 'setPerspective', perspective })
      },
      setCurrency(currency) {
        dispatch({ type: 'setCurrency', currency })
      },
      setFilters(filters) {
        dispatch({ type: 'setFilters', filters })
      },
      refresh() {
        dispatch({ type: 'refresh' })
      },
    }),
    [dispatch],
  )
}

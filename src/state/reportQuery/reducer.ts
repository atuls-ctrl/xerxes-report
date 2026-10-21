import type { ReportDateParts } from './dates'
import type {
  Currency,
  Perspective,
  ReportFilter,
  ReportQuery,
} from './types'

/**
 * One committed header change. Drafts inside dropdowns never dispatch.
 * `setDate` carries the output of `fromDatePickerValue`.
 */
export type ReportQueryAction =
  | ({ type: 'setDate' } & ReportDateParts)
  | { type: 'setCompare'; compare: boolean }
  | { type: 'setSource'; sourceId: string }
  | { type: 'setPerspective'; perspective: Perspective }
  | { type: 'setCurrency'; currency: Currency }
  | { type: 'setFilters'; filters: ReportFilter[] }
  | { type: 'refresh' }

/**
 * Applies one header change. Only `refresh` bumps `revision`; every other
 * action already yields a new query object for pages to react to.
 */
export function reportQueryReducer(
  state: ReportQuery,
  action: ReportQueryAction,
): ReportQuery {
  switch (action.type) {
    case 'setDate':
      return {
        ...state,
        preset: action.preset,
        start: action.start,
        end: action.end,
      }
    case 'setCompare':
      return { ...state, compare: action.compare }
    case 'setSource':
      return { ...state, sourceId: action.sourceId }
    case 'setPerspective':
      return { ...state, perspective: action.perspective }
    case 'setCurrency':
      return { ...state, currency: action.currency }
    case 'setFilters':
      return { ...state, filters: action.filters }
    case 'refresh':
      return { ...state, revision: state.revision + 1 }
    default:
      return state
  }
}

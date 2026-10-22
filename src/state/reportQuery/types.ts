import type { PresetKey } from "../../components/DatePicker/dateRange"

/** Supply or demand report. One value feeds the header control and the sidebar subtitle. */
export type Perspective = 'supply' | 'demand'

/** Display currency for money metrics. */
export type Currency = 'USD' | 'RUB'

/**
 * One applied filter. The Add filter control writes this list on Apply.
 * Draft rows inside the dropdown are not stored.
 */
export interface ReportFilter {
  id: string
  field: string
  operator: string
  /** Single value for v1. Bump `STORAGE_VERSION` if this becomes a list. */
  value: string
}

/** Header query every report page reads. `revision` is not persisted. */
export interface ReportQuery {
  /** Preset key from `DatePicker`, or `CUSTOM_RANGE`. */
  preset: PresetKey
  /** Inclusive range, `YYYY-MM-DD`. */
  start: string
  end: string
  compare: boolean
  /** Id from `SidebarDataSource`, e.g. `"trackier"`. */
  sourceId: string
  perspective: Perspective
  currency: Currency
  filters: ReportFilter[]
  /** Bumped by Refresh so pages refetch with an unchanged query. */
  revision: number
}

/** Shape written to localStorage. `revision` is session-only. */
export interface StoredReportQuery {
  /** Rejects saved payloads from an older shape. */
  version: 1
  preset: PresetKey
  start: string
  end: string
  compare: boolean
  sourceId: string
  perspective: Perspective
  currency: Currency
  filters: ReportFilter[]
}

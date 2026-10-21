import dayjs from 'dayjs'
import { CUSTOM_RANGE } from '../../components/DatePicker'
import { isPresetKey, rangeForPreset } from './dates'
import { DEFAULT_REPORT_QUERY } from './defaults'
import type {
  Currency,
  Perspective,
  ReportFilter,
  ReportQuery,
  StoredReportQuery,
} from './types'

/** localStorage key for the header query, beside `xerxes.sidebar.collapsed`. */
export const REPORT_QUERY_STORAGE_KEY = 'xerxes.reportQuery'

/** Bump when `StoredReportQuery` changes shape; older payloads then fall back to defaults. */
const STORAGE_VERSION = 1

/** Guards the saved Supply / Demand value. */
function isPerspective(value: unknown): value is Perspective {
  return value === 'supply' || value === 'demand'
}

/** Guards the saved currency. */
function isCurrency(value: unknown): value is Currency {
  return value === 'USD' || value === 'RUB'
}

/** Guards one saved filter row. */
function isFilter(value: unknown): value is ReportFilter {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'string' &&
    typeof row.field === 'string' &&
    typeof row.operator === 'string' &&
    typeof row.value === 'string'
  )
}

/** Non-empty string that dayjs reads as a calendar day. */
function isDateString(value: unknown): value is string {
  return typeof value === 'string' && dayjs(value).isValid()
}

/** Whole saved payload. Anything hand-edited or stale fails here, not in a page. */
function isStoredReportQuery(value: unknown): value is StoredReportQuery {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  return (
    row.version === STORAGE_VERSION &&
    typeof row.preset === 'string' &&
    isPresetKey(row.preset) &&
    isDateString(row.start) &&
    isDateString(row.end) &&
    typeof row.compare === 'boolean' &&
    typeof row.sourceId === 'string' &&
    row.sourceId.length > 0 &&
    isPerspective(row.perspective) &&
    isCurrency(row.currency) &&
    Array.isArray(row.filters) &&
    row.filters.every(isFilter)
  )
}

/** Drops `revision` and stamps the storage version. */
export function toStoredReportQuery(query: ReportQuery): StoredReportQuery {
  return {
    version: STORAGE_VERSION,
    preset: query.preset,
    start: query.start,
    end: query.end,
    compare: query.compare,
    sourceId: query.sourceId,
    perspective: query.perspective,
    currency: query.currency,
    filters: query.filters,
  }
}

/** null when storage is missing, unreadable, or the wrong shape. */
export function readStoredReportQuery(): StoredReportQuery | null {
  try {
    const raw = localStorage.getItem(REPORT_QUERY_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isStoredReportQuery(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Persists the query. A failed write leaves the in-memory value in place. */
export function writeStoredReportQuery(query: ReportQuery) {
  try {
    localStorage.setItem(
      REPORT_QUERY_STORAGE_KEY,
      JSON.stringify(toStoredReportQuery(query)),
    )
  } catch {
    // Private mode or a full quota; the session still uses memory.
  }
}

/**
 * Saved query as the in-memory state. A preset gets today's window; a custom
 * range keeps its saved days. `revision` always restarts at 0.
 */
export function resolveStoredQuery(
  stored: StoredReportQuery | null,
): ReportQuery {
  if (!stored) return DEFAULT_REPORT_QUERY

  // Custom ranges are the only saved dates that are not recomputed.
  const live =
    stored.preset === CUSTOM_RANGE
      ? { preset: stored.preset, start: stored.start, end: stored.end }
      : rangeForPreset(stored.preset)

  // A preset key with no matching DatePicker preset (removed since save).
  if (!live) return DEFAULT_REPORT_QUERY

  return {
    preset: live.preset,
    start: live.start,
    end: live.end,
    compare: stored.compare,
    sourceId: stored.sourceId,
    perspective: stored.perspective,
    currency: stored.currency,
    filters: stored.filters,
    revision: 0,
  }
}

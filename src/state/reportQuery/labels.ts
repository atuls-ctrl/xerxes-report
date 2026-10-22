import dayjs from 'dayjs'
import type { Perspective, ReportQuery } from './types'

/**
 * "Compare previous 7 days", from the inclusive length of the active range.
 * Derived on render so the label never drifts from the dates.
 */
export function comparePeriodLabel(
  query: Pick<ReportQuery, 'start' | 'end'>,
): string {
  // `diff` excludes the end day; 8 Oct–14 Oct gives 6, so add one.
  const days = dayjs(query.end).diff(dayjs(query.start), 'day') + 1
  if (days <= 1) return 'Compare previous day'
  return `Compare previous ${String(days)} days`
}

/** Sidebar subtitle for the active perspective. */
export function perspectiveLabel(perspective: Perspective): string {
  if (perspective === 'supply') return 'Supply view'
  return 'Demand view'
}

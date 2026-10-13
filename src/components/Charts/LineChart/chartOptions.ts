import type { ApexOptions } from 'apexcharts'

export interface LineChartSeries {
  /** Stable id, reported back in `hiddenSeries`. Defaults to `name`. */
  key?: string
  /** Shown in the legend and the tooltip. */
  name: string
  /** One value per category. `null` leaves a gap. */
  data: (number | null)[]
  /** Any CSS color. Defaults to the next color of `colors`. */
  color?: string
  /** Tooltip text for a value of this series, e.g. `$343`. */
  formatValue?: (value: number) => string
}

/** Series colors of the "Xerxes AI Reports" charts, in legend order. */
export const DEFAULT_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
]

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** "12.3K", "304". */
export function formatCompact(value: number) {
  return compactNumber.format(value)
}

export function getSeriesKey(series: LineChartSeries) {
  return series.key ?? series.name
}

/** Rescales a series to percent of its own peak so mixed units share an axis. */
export function normalizeData(data: (number | null)[]) {
  const peak = Math.max(0, ...data.map((value) => Math.abs(value ?? 0)))
  return data.map((value) => {
    if (value === null) return null
    return peak === 0 ? 0 : (value / peak) * 100
  })
}

export function getLastPointIndex(data: (number | null)[]) {
  return data.findLastIndex((value) => value !== null)
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** The ApexCharts tooltip is built from an HTML string, not React nodes. */
export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function merge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
) {
  const result = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = result[key]
    result[key] =
      isPlainObject(current) && isPlainObject(value)
        ? merge(current, value)
        : value
  }
  return result
}

/** Deep-merges `override` into `base`. Arrays and functions are replaced. */
export function mergeOptions(
  base: ApexOptions,
  override: ApexOptions = {},
): ApexOptions {
  return merge({ ...base }, { ...override })
}

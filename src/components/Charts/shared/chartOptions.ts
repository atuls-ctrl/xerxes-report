import type { ApexOptions } from 'apexcharts'

export interface ChartSeries {
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

export type ChartLegendPosition = 'top' | 'bottom' | 'none'

/** Series colors of the "Xerxes AI Reports" charts, in legend order. */
export const DEFAULT_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#7c5ce0',
  '#12a5b8',
  '#a8623a',
  '#8a9a1f',
]

export const DEFAULT_HEIGHT = 270

const AXIS_FONT_SIZE = '11px'

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const groupedNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })

/** "12.3K", "304". */
export function formatCompact(value: number) {
  return compactNumber.format(value)
}

/** "2,500", "304". */
export function formatNumber(value: number) {
  return groupedNumber.format(value)
}

export function getSeriesKey(series: ChartSeries) {
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

export interface BaseOptionsConfig {
  categories: string[]
  colors: string[]
  normalize: boolean
  yMin: number | undefined
  yMax: number | undefined
  yTickAmount: number
  formatYAxis: (value: number) => string
  tooltipEnabled: boolean
  renderTooltip: (context: { dataPointIndex: number }) => string
}

/** Options every chart shares: axes, grid and the custom tooltip. */
export function getBaseOptions({
  categories,
  colors,
  normalize,
  yMin,
  yMax,
  yTickAmount,
  formatYAxis,
  tooltipEnabled,
  renderTooltip,
}: BaseOptionsConfig): ApexOptions {
  return {
    chart: {
      fontFamily: 'inherit',
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false },
      selection: { enabled: false },
    },
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 16, bottom: 0, left: 8 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: { fontSize: AXIS_FONT_SIZE },
      },
    },
    yaxis: {
      tickAmount: yTickAmount,
      ...(normalize ? { min: 0, max: 100 } : {}),
      ...(yMin !== undefined && { min: yMin }),
      ...(yMax !== undefined && { max: yMax }),
      labels: {
        style: { fontSize: AXIS_FONT_SIZE },
        formatter: (value: number) =>
          normalize ? `${String(Math.round(value))}%` : formatYAxis(value),
      },
    },
    tooltip: {
      enabled: tooltipEnabled,
      shared: true,
      intersect: false,
      custom: renderTooltip,
    },
  }
}

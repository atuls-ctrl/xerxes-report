import type { ApexOptions } from 'apexcharts'
import { useMemo, type HTMLAttributes, type ReactNode } from 'react'
import { LineChart } from '../Charts/LineChart'
import styles from './MetricTile.module.scss'

export type MetricTileStatus = 'high' | 'low' | 'neutral'

type NativeDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'>

export interface MetricTileProps extends NativeDivProps {
  /** Metric name, e.g. "Gross clicks". */
  label: ReactNode
  /** Formatted metric value, e.g. "93.1K". */
  value: ReactNode
  /** Color of the dot before the label. Any CSS color. Omit to hide the dot. */
  color?: string
  /** Trend of the metric. Colors the badge and the sparkline. */
  status?: MetricTileStatus
  /** Change against the previous period, e.g. "1.9%". Omit to hide the badge. */
  badge?: ReactNode
  /** Shows the sparkline. It also needs at least two values in `data`. */
  showChart?: boolean
  /** Sparkline values, oldest first. `null` leaves a gap. */
  data?: (number | null)[]
  /** Overrides the sparkline color set by `status`. */
  chartColor?: string
}

const STATUS_SYMBOLS: Record<MetricTileStatus, string> = {
  high: '▲',
  low: '▼',
  neutral: '±',
}

const STATUS_NAMES: Record<MetricTileStatus, string> = {
  high: 'Up',
  low: 'Down',
  neutral: 'No change',
}

// ApexCharts needs literal colors. Keep in sync with the stylesheet.
const STATUS_CHART_COLORS: Record<MetricTileStatus, string> = {
  high: '#0ca30c',
  low: '#d03b3b',
  neutral: '#8a94a6',
}

// Flat fill, and the line runs edge to edge of its box.
const SPARKLINE_OPTIONS: ApexOptions = {
  fill: { type: 'solid', opacity: 0.12 },
  grid: { padding: { top: 2, right: 0, bottom: 2, left: 0 } },
}

const MIN_CHART_POINTS = 2

export function MetricTile({
  label,
  value,
  color,
  status = 'neutral',
  badge,
  showChart = true,
  data,
  chartColor,
  className,
  ...rest
}: MetricTileProps) {
  const hasBadge = badge !== undefined && badge !== null && badge !== false
  const hasChart =
    showChart &&
    data !== undefined &&
    data.filter((point) => point !== null).length >= MIN_CHART_POINTS

  const series = useMemo(() => [{ name: 'Trend', data: data ?? [] }], [data])
  const categories = useMemo(
    () => (data ?? []).map((_, index) => String(index + 1)),
    [data],
  )
  const colors = useMemo(
    () => [chartColor ?? STATUS_CHART_COLORS[status]],
    [chartColor, status],
  )
  // Pin the axis to the data so the line uses the full height of its box.
  // A flat series keeps the automatic axis: it has no range to pin to.
  const yRange = useMemo(() => {
    const points = (data ?? []).filter((point) => point !== null)
    const yMin = Math.min(...points)
    const yMax = Math.max(...points)
    return yMin < yMax ? { yMin, yMax } : {}
  }, [data])

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div {...rest} className={classes} data-status={status}>
      <div className={styles.header}>
        {color !== undefined && (
          <span
            className={styles.dot}
            style={{ background: color }}
            aria-hidden="true"
          />
        )}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.main}>
          <span className={styles.value}>{value}</span>
          {hasBadge && (
            <span className={styles.badge}>
              <span aria-hidden="true">{STATUS_SYMBOLS[status]}</span>
              <span className={styles.srOnly}>{STATUS_NAMES[status]}</span>
              {badge}
            </span>
          )}
        </div>
        {hasChart && (
          <div className={styles.chart} aria-hidden="true">
            <LineChart
              sparkline
              series={series}
              categories={categories}
              colors={colors}
              strokeWidth={1.5}
              {...yRange}
              options={SPARKLINE_OPTIONS}
            />
          </div>
        )}
      </div>
    </div>
  )
}

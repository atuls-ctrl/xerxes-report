import type { ApexOptions } from 'apexcharts'
import { useMemo, useState, type HTMLAttributes } from 'react'
import ReactApexChart from 'react-apexcharts'
import {
  DEFAULT_COLORS,
  escapeHtml,
  formatCompact,
  getLastPointIndex,
  getSeriesKey,
  mergeOptions,
  normalizeData,
  type LineChartSeries,
} from './chartOptions'
import styles from './LineChart.module.scss'

export type LineChartCurve = 'straight' | 'smooth' | 'stepline'
export type LineChartLegendPosition = 'top' | 'bottom' | 'none'

type NativeDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export interface LineChartProps extends NativeDivProps {
  series: LineChartSeries[]
  /** X axis labels, one per data point. */
  categories: string[]
  /** Palette for series without their own `color`. Repeats when exhausted. */
  colors?: string[]
  /** Chart height in px, or any CSS length. The width follows the parent. */
  height?: number | string
  /**
   * Plots every series as a percentage of its own peak, so metrics with
   * different units can share one axis. The tooltip still shows real values.
   */
  normalize?: boolean
  curve?: LineChartCurve
  strokeWidth?: number
  /** Legend placement. Clicking an item shows or hides its series. */
  legend?: LineChartLegendPosition
  showTooltip?: boolean
  /** Dot on the last point of every line. */
  showEndMarkers?: boolean
  /** Compact trend line with a soft fill: no axes, grid, legend or tooltip. */
  sparkline?: boolean
  yMin?: number
  yMax?: number
  /** Number of intervals on the Y axis. */
  yTickAmount?: number
  /** Tooltip text for a value. A series' own `formatValue` wins. */
  formatValue?: (value: number, series: LineChartSeries) => string
  /** Y axis label. Ignored when `normalize` is on. */
  formatYAxis?: (value: number) => string
  /** Tooltip heading. Defaults to the category label. */
  formatTooltipTitle?: (category: string, index: number) => string
  /** Controlled keys of hidden series. Omit to let the legend manage it. */
  hiddenSeries?: string[]
  /** Initially hidden series when uncontrolled. */
  defaultHiddenSeries?: string[]
  onHiddenSeriesChange?: (hidden: string[]) => void
  /** Raw ApexCharts options, deep-merged over the defaults. */
  options?: ApexOptions
}

const DEFAULT_HEIGHT = 270
const SPARKLINE_HEIGHT = 30
const AXIS_FONT_SIZE = '11px'
const MARKER_STROKE = '#fff'
const EMPTY_VALUE = '–'

export function LineChart({
  series,
  categories,
  colors = DEFAULT_COLORS,
  height,
  normalize = false,
  curve = 'straight',
  strokeWidth = 2,
  legend,
  showTooltip,
  showEndMarkers,
  sparkline = false,
  yMin,
  yMax,
  yTickAmount = 4,
  formatValue = formatCompact,
  formatYAxis = formatCompact,
  formatTooltipTitle,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  options,
  className,
  ...rest
}: LineChartProps) {
  const [internalHidden, setInternalHidden] = useState(
    () => defaultHiddenSeries ?? [],
  )
  const hidden = hiddenSeries ?? internalHidden

  // Sparklines are bare trend lines unless a part is asked for explicitly.
  const legendPosition = legend ?? (sparkline ? 'none' : 'top')
  const tooltipEnabled = showTooltip ?? !sparkline
  const endMarkersEnabled = showEndMarkers ?? !sparkline

  const items = useMemo(() => {
    const palette = colors.length > 0 ? colors : DEFAULT_COLORS
    return series.map((item, index) => ({
      item,
      key: getSeriesKey(item),
      color: item.color ?? palette[index % palette.length],
    }))
  }, [series, colors])
  const visible = useMemo(
    () => items.filter(({ key }) => !hidden.includes(key)),
    [items, hidden],
  )

  const chartSeries = useMemo(
    () =>
      visible.map(({ item }) => ({
        name: item.name,
        data: normalize ? normalizeData(item.data) : item.data,
      })),
    [visible, normalize],
  )

  const chartOptions = useMemo(() => {
    const renderTooltip = ({ dataPointIndex }: { dataPointIndex: number }) => {
      const category = categories[dataPointIndex] ?? ''
      const title = formatTooltipTitle?.(category, dataPointIndex) ?? category
      const rows = visible.map(({ item, color }) => {
        const value = item.data[dataPointIndex] ?? null
        const text =
          value === null
            ? EMPTY_VALUE
            : (item.formatValue?.(value) ?? formatValue(value, item))
        return (
          `<div class="${styles.tipRow}">` +
          `<i class="${styles.tipDot}" style="background:${escapeHtml(color)}"></i>` +
          `<span class="${styles.tipLabel}">${escapeHtml(item.name)}</span>` +
          `<span class="${styles.tipValue}">${escapeHtml(text)}</span>` +
          `</div>`
        )
      })
      return (
        `<div class="${styles.tip}">` +
        `<div class="${styles.tipTitle}">${escapeHtml(title)}</div>` +
        rows.join('') +
        `</div>`
      )
    }

    // Drawn as annotations: discrete markers would switch off the hover dots.
    const endMarkers = endMarkersEnabled
      ? visible.flatMap(({ color }, seriesIndex) => {
          const { data } = chartSeries[seriesIndex]
          const index = getLastPointIndex(data)
          if (index < 0) return []
          return {
            x: categories[index],
            y: data[index],
            marker: {
              size: 3.5,
              fillColor: color,
              strokeColor: MARKER_STROKE,
              strokeWidth: 1,
            },
          }
        })
      : []

    const base: ApexOptions = {
      chart: {
        fontFamily: 'inherit',
        parentHeightOffset: 0,
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: { enabled: false },
        sparkline: { enabled: sparkline },
      },
      colors: visible.map(({ color }) => color),
      stroke: { curve, width: strokeWidth, lineCap: 'round' },
      // Only the sparkline is an area chart; on a line `fill` paints the stroke.
      ...(sparkline && {
        fill: {
          type: 'gradient',
          gradient: { opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] },
        },
      }),
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 16, bottom: 0, left: 8 },
      },
      markers: {
        size: 0,
        strokeColors: MARKER_STROKE,
        strokeWidth: 1,
        hover: { size: 4 },
      },
      annotations: { points: endMarkers },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        crosshairs: { show: true, stroke: { width: 1, dashArray: 0 } },
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

    return mergeOptions(base, options)
  }, [
    visible,
    chartSeries,
    categories,
    normalize,
    curve,
    strokeWidth,
    sparkline,
    tooltipEnabled,
    endMarkersEnabled,
    yMin,
    yMax,
    yTickAmount,
    formatValue,
    formatYAxis,
    formatTooltipTitle,
    options,
  ])

  const toggleSeries = (key: string) => {
    const next = hidden.includes(key)
      ? hidden.filter((item) => item !== key)
      : [...hidden, key]
    if (hiddenSeries === undefined) setInternalHidden(next)
    onHiddenSeriesChange?.(next)
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div
      {...rest}
      className={classes}
      data-legend={legendPosition}
      data-sparkline={sparkline || undefined}
    >
      {legendPosition !== 'none' && (
        <div className={styles.legend}>
          {items.map(({ item, key, color }) => (
            <button
              key={key}
              type="button"
              className={styles.legendItem}
              aria-pressed={!hidden.includes(key)}
              onClick={() => {
                toggleSeries(key)
              }}
            >
              <span
                className={styles.swatch}
                style={{ background: color }}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
      <div className={styles.chart}>
        <ReactApexChart
          type={sparkline ? 'area' : 'line'}
          series={chartSeries}
          options={chartOptions}
          width="100%"
          height={height ?? (sparkline ? SPARKLINE_HEIGHT : DEFAULT_HEIGHT)}
        />
      </div>
    </div>
  )
}

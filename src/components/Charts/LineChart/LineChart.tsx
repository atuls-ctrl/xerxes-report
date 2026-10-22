import type { ApexOptions } from 'apexcharts'
import { useMemo, type HTMLAttributes } from 'react'
import ReactApexChart from 'react-apexcharts'
import { colors } from '../../../styles/colors'
import { ChartFrame } from '../shared/ChartFrame'
import {
  DEFAULT_COLORS,
  DEFAULT_HEIGHT,
  formatCompact,
  getBaseOptions,
  getLastPointIndex,
  mergeOptions,
  normalizeData,
  type ChartLegendPosition,
  type ChartSeries,
} from '../shared/chartOptions'
import { createTooltipRenderer } from '../shared/tooltip'
import { useChartSeries } from '../shared/useChartSeries'
import styles from './LineChart.module.scss'

export type LineChartSeries = ChartSeries
export type LineChartCurve = 'straight' | 'smooth' | 'stepline'
export type LineChartLegendPosition = ChartLegendPosition

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

const SPARKLINE_HEIGHT = 30
const MARKER_STROKE = colors.white

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
  const { items, visible, hidden, toggleSeries } = useChartSeries({
    series,
    colors,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
  })

  // Sparklines are bare trend lines unless a part is asked for explicitly.
  const legendPosition = legend ?? (sparkline ? 'none' : 'top')
  const tooltipEnabled = showTooltip ?? !sparkline
  const endMarkersEnabled = showEndMarkers ?? !sparkline

  const chartSeries = useMemo(
    () =>
      visible.map(({ item }) => ({
        name: item.name,
        data: normalize ? normalizeData(item.data) : item.data,
      })),
    [visible, normalize],
  )

  const chartOptions = useMemo(() => {
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

    const base = getBaseOptions({
      categories,
      colors: visible.map(({ color }) => color),
      normalize,
      yMin,
      yMax,
      yTickAmount,
      formatYAxis,
      tooltipEnabled,
      renderTooltip: createTooltipRenderer({
        series: visible,
        categories,
        formatValue,
        formatTooltipTitle,
      }),
    })

    const line: ApexOptions = {
      chart: { sparkline: { enabled: sparkline } },
      stroke: { curve, width: strokeWidth, lineCap: 'round' },
      // Only the sparkline is an area chart; on a line `fill` paints the stroke.
      ...(sparkline && {
        fill: {
          type: 'gradient',
          gradient: { opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] },
        },
      }),
      markers: {
        size: 0,
        strokeColors: MARKER_STROKE,
        strokeWidth: 1,
        hover: { size: 4 },
      },
      annotations: { points: endMarkers },
      xaxis: {
        crosshairs: { show: true, stroke: { width: 1, dashArray: 0 } },
      },
    }

    return mergeOptions(mergeOptions(base, line), options)
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

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <ChartFrame
      {...rest}
      className={classes}
      items={items}
      hiddenKeys={hidden}
      onToggleSeries={toggleSeries}
      legend={legendPosition}
      data-sparkline={sparkline || undefined}
    >
      <ReactApexChart
        type={sparkline ? 'area' : 'line'}
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={height ?? (sparkline ? SPARKLINE_HEIGHT : DEFAULT_HEIGHT)}
      />
    </ChartFrame>
  )
}

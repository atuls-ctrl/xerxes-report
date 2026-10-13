import type { ApexOptions } from 'apexcharts'
import { useMemo, type HTMLAttributes } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ChartFrame } from '../shared/ChartFrame'
import {
  DEFAULT_COLORS,
  DEFAULT_HEIGHT,
  formatCompact,
  formatNumber,
  getBaseOptions,
  mergeOptions,
  normalizeData,
  type ChartLegendPosition,
  type ChartSeries,
} from '../shared/chartOptions'
import { createTooltipRenderer } from '../shared/tooltip'
import { useChartSeries } from '../shared/useChartSeries'
import styles from './BarChart.module.scss'

export type BarChartSeries = ChartSeries
export type BarChartLegendPosition = ChartLegendPosition

type NativeDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export interface BarChartProps extends NativeDivProps {
  series: BarChartSeries[]
  /** Axis labels, one per group of bars. */
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
  /** Stacks the series of a category on top of each other. */
  stacked?: boolean
  /** Share of a category's width taken by its bars, e.g. `'62%'`. */
  columnWidth?: string
  /** Corner radius of the bar ends, in px. */
  borderRadius?: number
  /**
   * Fades each bar out towards the axis. Off gives solid bars, which is the
   * default when `stacked`.
   */
  gradient?: boolean
  /** Legend placement. Clicking an item shows or hides its series. */
  legend?: BarChartLegendPosition
  showTooltip?: boolean
  yMin?: number
  yMax?: number
  /** Number of intervals on the value axis. */
  yTickAmount?: number
  /** Tooltip text for a value. A series' own `formatValue` wins. */
  formatValue?: (value: number, series: BarChartSeries) => string
  /** Value axis label. Ignored when `normalize` is on. */
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

// Transparent outline that leaves a gap between neighbouring bars.
const BAR_GAP = 2

export function BarChart({
  series,
  categories,
  colors = DEFAULT_COLORS,
  height = DEFAULT_HEIGHT,
  normalize = false,
  stacked = false,
  columnWidth = '62%',
  borderRadius = 3,
  gradient = !stacked,
  legend = 'top',
  showTooltip = true,
  yMin,
  yMax,
  yTickAmount = 4,
  formatValue = formatCompact,
  formatYAxis = formatNumber,
  formatTooltipTitle,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  options,
  className,
  ...rest
}: BarChartProps) {
  const { items, visible, hidden, toggleSeries } = useChartSeries({
    series,
    colors,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
  })

  const chartSeries = useMemo(
    () =>
      visible.map(({ item }) => ({
        name: item.name,
        data: normalize ? normalizeData(item.data) : item.data,
      })),
    [visible, normalize],
  )

  const chartOptions = useMemo(() => {
    const seriesColors = visible.map(({ color }) => color)

    const base = getBaseOptions({
      categories,
      colors: seriesColors,
      normalize,
      yMin,
      yMax,
      yTickAmount,
      formatYAxis,
      tooltipEnabled: showTooltip,
      renderTooltip: createTooltipRenderer({
        series: visible,
        categories,
        formatValue,
        formatTooltipTitle,
      }),
    })

    const bar: ApexOptions = {
      chart: { stacked },
      plotOptions: {
        bar: {
          columnWidth,
          borderRadius,
          borderRadiusApplication: 'end',
        },
      },
      stroke: {
        show: !stacked,
        width: BAR_GAP,
        colors: ['transparent'],
      },
      fill: gradient
        ? {
            type: 'gradient',
            gradient: {
              type: 'vertical',
              // Same hue at both ends; only the opacity fades.
              gradientToColors: seriesColors,
              shadeIntensity: 0,
              opacityFrom: 0.9,
              opacityTo: 0.15,
              stops: [0, 100],
            },
          }
        : { type: 'solid', opacity: 1 },
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
      // Band behind the hovered group of bars.
      xaxis: {
        crosshairs: {
          show: true,
          width: 'tickWidth',
          opacity: 1,
          stroke: { width: 0 },
          fill: { type: 'solid' },
        },
      },
    }

    return mergeOptions(mergeOptions(base, bar), options)
  }, [
    visible,
    categories,
    normalize,
    stacked,
    columnWidth,
    borderRadius,
    gradient,
    showTooltip,
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
      legend={legend}
    >
      <ReactApexChart
        type="bar"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={height}
      />
    </ChartFrame>
  )
}

import type { ApexOptions } from 'apexcharts'
import { useMemo, type CSSProperties, type HTMLAttributes } from 'react'
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
/**
 * `vertical`: columns on a value axis. `horizontal`: one row per category
 * with its label on the left, the bar, and the value on the right.
 */
export type BarChartLayout = 'vertical' | 'horizontal'

type NativeDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export interface BarChartProps extends NativeDivProps {
  series: BarChartSeries[]
  /** Axis labels, one per group of bars. Row labels when `horizontal`. */
  categories: string[]
  layout?: BarChartLayout
  /** Palette for series without their own `color`. Repeats when exhausted. */
  colors?: string[]
  /**
   * Chart height in px, or any CSS length. The width follows the parent.
   * A `horizontal` chart is as tall as its rows unless this is set.
   */
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
   * default when `stacked` or `horizontal`.
   */
  gradient?: boolean
  /**
   * Legend placement. Clicking an item shows or hides its series. Defaults to
   * `top`, or `none` when `horizontal`.
   */
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

  // ---- `horizontal` layout only --------------------------------------------
  /**
   * Color per category, overriding the series color, e.g. to flag one row.
   * `null` keeps the series color.
   */
  barColors?: (string | null)[]
  /** Bar thickness in px. */
  barHeight?: number
  /** Height of a row in px. */
  rowHeight?: number
  /** Width of the label column. Numbers are pixels. Long labels truncate. */
  labelWidth?: number | string
  /** Value at the end of every row. */
  showValueLabels?: boolean
  /**
   * Text of a row's value label, e.g. `28% · 12`. Defaults to the tooltip
   * text of the first visible series.
   */
  formatValueLabel?: (value: number, index: number) => string
}

// Transparent outline that leaves a gap between neighbouring bars.
const BAR_GAP = 2
const EMPTY_VALUE = '–'

type BarChartCssVars = CSSProperties & Record<`--bar-${string}`, string>

/** Largest value a row has to fit: its longest bar, or its whole stack. */
function getPeak(data: (number | null)[][], stacked: boolean) {
  const rows = Math.max(0, ...data.map((values) => values.length))
  let peak = 0
  for (let index = 0; index < rows; index++) {
    const values = data.map((item) => item[index] ?? 0)
    const row = stacked
      ? values.reduce((sum, value) => sum + value, 0)
      : Math.max(...values)
    peak = Math.max(peak, row)
  }
  return peak
}

export function BarChart({
  series,
  categories,
  layout = 'vertical',
  colors = DEFAULT_COLORS,
  height,
  normalize = false,
  stacked = false,
  columnWidth = '62%',
  borderRadius = 3,
  gradient,
  legend,
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
  barColors,
  barHeight = 10,
  rowHeight = 24,
  labelWidth = 130,
  showValueLabels = true,
  formatValueLabel,
  className,
  ...rest
}: BarChartProps) {
  const horizontal = layout === 'horizontal'
  const gradientEnabled = gradient ?? (!stacked && !horizontal)
  const legendPosition = legend ?? (horizontal ? 'none' : 'top')
  const chartHeight =
    height ?? (horizontal ? categories.length * rowHeight : DEFAULT_HEIGHT)

  const { items, visible, hidden, toggleSeries } = useChartSeries({
    series,
    colors,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
  })

  const plotted = useMemo(
    () =>
      visible.map(({ item }) => ({
        name: item.name,
        data: normalize ? normalizeData(item.data) : item.data,
      })),
    [visible, normalize],
  )

  const chartSeries = useMemo(() => {
    if (!horizontal || !barColors) return plotted
    // Points carry their own color; without one they take the series color.
    return plotted.map(({ name, data }) => ({
      name,
      data: data.map((y, index) => {
        const fillColor = barColors[index]
        return {
          x: categories[index] ?? '',
          y,
          ...(fillColor && { fillColor }),
        }
      }),
    }))
  }, [plotted, horizontal, barColors, categories])

  // The longest row spans the whole plot instead of a rounded-up axis.
  const peak = useMemo(() => {
    if (!horizontal) return 0
    return getPeak(
      plotted.map(({ data }) => data),
      stacked,
    )
  }, [plotted, horizontal, stacked])

  const chartOptions = useMemo(() => {
    const seriesColors = visible.map(({ color }) => color)
    const valueMax = yMax ?? (peak > 0 ? peak : undefined)

    const base = getBaseOptions({
      categories,
      colors: seriesColors,
      normalize,
      yMin,
      yMax: valueMax,
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
      fill: gradientEnabled
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

    // Rows: bars only. The labels and values around them are HTML.
    const rows: ApexOptions = {
      chart: { sparkline: { enabled: true } },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: `${String((barHeight / rowHeight) * 100)}%`,
        },
      },
      stroke: { show: false },
      grid: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
      // In this layout ApexCharts scales the bars on its x axis.
      xaxis: {
        crosshairs: { show: false },
        min: yMin ?? 0,
        ...(valueMax !== undefined && { max: valueMax }),
      },
      // ApexCharts has no shared tooltip for horizontal bars.
      tooltip: { shared: false, intersect: true },
    }

    const merged = mergeOptions(base, bar)
    return mergeOptions(
      horizontal ? mergeOptions(merged, rows) : merged,
      options,
    )
  }, [
    visible,
    categories,
    normalize,
    stacked,
    columnWidth,
    borderRadius,
    gradientEnabled,
    horizontal,
    barHeight,
    rowHeight,
    peak,
    showTooltip,
    yMin,
    yMax,
    yTickAmount,
    formatValue,
    formatYAxis,
    formatTooltipTitle,
    options,
  ])

  const getValueLabel = (index: number) => {
    const first = visible.at(0)
    const value = first?.item.data[index] ?? null
    if (!first || value === null) return EMPTY_VALUE
    if (formatValueLabel) return formatValueLabel(value, index)
    return first.item.formatValue?.(value) ?? formatValue(value, first.item)
  }

  const rowVars: BarChartCssVars = {
    '--bar-row-height': `${String(rowHeight)}px`,
    '--bar-label-width':
      typeof labelWidth === 'number' ? `${String(labelWidth)}px` : labelWidth,
  }

  const chart = (
    <ReactApexChart
      type="bar"
      series={chartSeries}
      options={chartOptions}
      width="100%"
      height={chartHeight}
    />
  )

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <ChartFrame
      {...rest}
      className={classes}
      items={items}
      hiddenKeys={hidden}
      onToggleSeries={toggleSeries}
      legend={legendPosition}
    >
      {horizontal ? (
        <div className={styles.rows} style={rowVars}>
          <div className={styles.rowLabels}>
            {categories.map((category, index) => (
              <span key={index} className={styles.rowLabel} title={category}>
                {category}
              </span>
            ))}
          </div>
          <div className={styles.rowBars}>{chart}</div>
          {showValueLabels && (
            <div className={styles.rowValues}>
              {categories.map((_, index) => (
                <span key={index} className={styles.rowValue}>
                  {getValueLabel(index)}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        chart
      )}
    </ChartFrame>
  )
}

import { escapeHtml, type ChartSeries } from './chartOptions'
import type { ChartSeriesItem } from './useChartSeries'
import styles from './Chart.module.scss'

const EMPTY_VALUE = '–'

interface TooltipConfig {
  series: ChartSeriesItem[]
  categories: string[]
  formatValue: (value: number, series: ChartSeries) => string
  formatTooltipTitle: ((category: string, index: number) => string) | undefined
}

/** Builds the `tooltip.custom` callback: a heading and one row per series. */
export function createTooltipRenderer({
  series,
  categories,
  formatValue,
  formatTooltipTitle,
}: TooltipConfig) {
  return ({ dataPointIndex }: { dataPointIndex: number }) => {
    const category = categories[dataPointIndex] ?? ''
    const title = formatTooltipTitle?.(category, dataPointIndex) ?? category
    const rows = series.map(({ item, color }) => {
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
}

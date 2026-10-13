import type { HTMLAttributes, ReactNode } from 'react'
import type { ChartLegendPosition } from './chartOptions'
import type { ChartSeriesItem } from './useChartSeries'
import styles from './Chart.module.scss'

interface ChartFrameProps extends HTMLAttributes<HTMLDivElement> {
  items: ChartSeriesItem[]
  /** Keys of the series switched off in the legend. */
  hiddenKeys: string[]
  onToggleSeries: (key: string) => void
  legend: ChartLegendPosition
  /** The ApexCharts element. */
  children: ReactNode
}

/** Root, legend and plot container shared by every chart. */
export function ChartFrame({
  items,
  hiddenKeys,
  onToggleSeries,
  legend,
  className,
  children,
  ...rest
}: ChartFrameProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div {...rest} className={classes} data-legend={legend}>
      {legend !== 'none' && (
        <div className={styles.legend}>
          {items.map(({ item, key, color }) => (
            <button
              key={key}
              type="button"
              className={styles.legendItem}
              aria-pressed={!hiddenKeys.includes(key)}
              onClick={() => {
                onToggleSeries(key)
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
      <div className={styles.chart}>{children}</div>
    </div>
  )
}

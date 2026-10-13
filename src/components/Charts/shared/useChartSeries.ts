import { useMemo, useState } from 'react'
import { DEFAULT_COLORS, getSeriesKey, type ChartSeries } from './chartOptions'

export interface ChartSeriesItem {
  item: ChartSeries
  key: string
  color: string
}

interface UseChartSeriesOptions {
  series: ChartSeries[]
  colors: string[]
  hiddenSeries: string[] | undefined
  defaultHiddenSeries: string[] | undefined
  onHiddenSeriesChange: ((hidden: string[]) => void) | undefined
}

/** Resolves series colors and tracks which series the legend has hidden. */
export function useChartSeries({
  series,
  colors,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
}: UseChartSeriesOptions) {
  const [internalHidden, setInternalHidden] = useState(
    () => defaultHiddenSeries ?? [],
  )
  const hidden = hiddenSeries ?? internalHidden

  const items = useMemo<ChartSeriesItem[]>(() => {
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

  const toggleSeries = (key: string) => {
    const next = hidden.includes(key)
      ? hidden.filter((item) => item !== key)
      : [...hidden, key]
    if (hiddenSeries === undefined) setInternalHidden(next)
    onHiddenSeriesChange?.(next)
  }

  return { items, visible, hidden, toggleSeries }
}

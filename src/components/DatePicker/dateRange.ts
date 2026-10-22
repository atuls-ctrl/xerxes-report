import type { Dayjs } from 'dayjs'

export type DateRange = [start: Dayjs, end: Dayjs]

/** `preset` of a value picked from the calendar instead of the preset list. */
export const CUSTOM_RANGE = 'custom'

export type PresetKey = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | typeof CUSTOM_RANGE

export interface DatePickerPreset {
  /** Stable id, reported back as `value.preset`. */
  key: PresetKey
  label: string
  /** Builds the range relative to the current time. */
  getRange: (now: Dayjs) => DateRange
}

export interface DatePickerValue {
  /** Key of the chosen preset, or `CUSTOM_RANGE`. */
  preset: string
  range: DateRange
}

export const DEFAULT_PRESETS: DatePickerPreset[] = [
  {
    key: 'today',
    label: 'Today',
    getRange: (now) => [now.startOf('day'), now],
  },
  {
    key: 'yesterday',
    label: 'Yesterday',
    getRange: (now) => {
      const day = now.subtract(1, 'day')
      return [day.startOf('day'), day.endOf('day')]
    },
  },
  {
    key: 'last7',
    label: 'Last 7 days',
    getRange: (now) => [now.subtract(6, 'day').startOf('day'), now],
  },
  {
    key: 'thisMonth',
    label: 'This month',
    getRange: (now) => [now.startOf('month'), now],
  },
  {
    key: 'lastMonth',
    label: 'Last month',
    getRange: (now) => {
      const month = now.subtract(1, 'month')
      return [month.startOf('month'), month.endOf('month')]
    },
  },
]

const DAY = 'D MMM'
const DAY_WITH_YEAR = 'D MMM YYYY'

/** "1 Oct – 13 Oct", or "13 Oct" for a single day. */
export function formatRange([start, end]: DateRange, withYear = false) {
  const endText = end.format(withYear ? DAY_WITH_YEAR : DAY)
  if (start.isSame(end, 'day')) return endText

  const sameYear = start.isSame(end, 'year')
  const startText = start.format(sameYear ? DAY : DAY_WITH_YEAR)
  return `${startText} – ${sameYear ? endText : end.format(DAY_WITH_YEAR)}`
}

/**
 * Trigger text: "Today · 13 Oct, until 11:59" for a preset,
 * "1 Oct – 13 Oct 2026" for a custom range.
 */
export function formatValue(
  { preset, range }: DatePickerValue,
  presets: DatePickerPreset[],
) {
  const match = presets.find((item) => item.key === preset)
  if (!match) return formatRange(range, true)

  const [start, end] = range
  const isPartialDay =
    start.isSame(end, 'day') && end.isBefore(end.endOf('day'), 'minute')
  const until = isPartialDay ? `, until ${end.format('HH:mm')}` : ''
  return `${match.label} · ${formatRange(range)}${until}`
}

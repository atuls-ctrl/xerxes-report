import dayjs from 'dayjs'
import {
  CUSTOM_RANGE,
  DEFAULT_PRESETS,
  type DatePickerValue,
} from '../../components/DatePicker'
import type { PresetKey } from '../../components/DatePicker/dateRange'
import { ISO_DATE } from './defaults'
import type { ReportQuery } from './types'

/** Date fields of `ReportQuery`, as written by the date control. */
export interface ReportDateParts {
  preset: PresetKey
  start: string
  end: string
}

/** Narrows a picker or saved string to a preset the app knows, including custom. */
export function isPresetKey(value: string): value is PresetKey {
  return (
    value === CUSTOM_RANGE || DEFAULT_PRESETS.some((item) => item.key === value)
  )
}

/**
 * Store fields from a committed DatePicker value.
 * An unknown preset keeps its dates and is stored as a custom range.
 */
export function fromDatePickerValue(value: DatePickerValue): ReportDateParts {
  return {
    preset: isPresetKey(value.preset) ? value.preset : CUSTOM_RANGE,
    start: value.range[0].format(ISO_DATE),
    end: value.range[1].format(ISO_DATE),
  }
}

/**
 * Calendar dates for a known preset, relative to `now`.
 * Returns null for `CUSTOM_RANGE` and unknown keys.
 */
export function rangeForPreset(
  preset: string,
  now = dayjs(),
): ReportDateParts | null {
  const match = DEFAULT_PRESETS.find((item) => item.key === preset)
  if (!match) return null

  const [start, end] = match.getRange(now)
  return {
    preset: match.key,
    start: start.format(ISO_DATE),
    end: end.format(ISO_DATE),
  }
}

/**
 * Value for the DatePicker.
 * A known preset is built from today so "Last 7 days" stays rolling.
 * A custom range uses the stored calendar days.
 */
export function toDatePickerValue(
  query: Pick<ReportQuery, 'preset' | 'start' | 'end'>,
): DatePickerValue {
  if (query.preset !== CUSTOM_RANGE) {
    const match = DEFAULT_PRESETS.find((item) => item.key === query.preset)
    if (match) {
      return { preset: query.preset, range: match.getRange(dayjs()) }
    }
  }

  return {
    preset: query.preset,
    range: [dayjs(query.start).startOf('day'), dayjs(query.end).endOf('day')],
  }
}

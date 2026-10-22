import dayjs from 'dayjs'
import { DEFAULT_PRESETS } from '../../components/DatePicker'
import type { ReportQuery } from './types'

/** Calendar-day format for `start` and `end`; also the saved and URL form. */
export const ISO_DATE = 'YYYY-MM-DD'

const last7 = DEFAULT_PRESETS.find((item) => item.key === 'last7')

// Fails at load instead of shipping an empty default range if the preset is renamed.
if (!last7) {
  throw new Error('DatePicker preset "last7" is missing')
}

const [defaultStart, defaultEnd] = last7.getRange(dayjs())

/** Screenshot defaults: last 7 days, compare on, Trackier, Demand, USD. */
export const DEFAULT_REPORT_QUERY: ReportQuery = {
  preset: 'last7',
  start: defaultStart.format(ISO_DATE),
  end: defaultEnd.format(ISO_DATE),
  compare: true,
  sourceId: 'trackier',
  perspective: 'demand',
  currency: 'USD',
  filters: [],
  revision: 0,
}

// Number formatting shared by the table cells and the stories. Values come
// from report APIs as plain numbers; percentages are already in percent
// (2.8 means 2.8%), not fractions.

export const EMPTY_VALUE = '–'

const isMissing = (
  value: number | null | undefined,
): value is null | undefined =>
  value === null || value === undefined || Number.isNaN(value)

export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (isMissing(value)) return EMPTY_VALUE
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (isMissing(value)) return EMPTY_VALUE
  return `${formatNumber(value, decimals)}%`
}

export function formatMoney(
  value: number | null | undefined,
  decimals = 2,
  currency = 'USD',
): string {
  if (isMissing(value)) return EMPTY_VALUE
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Signed change, e.g. `+0.8 pp` or `−1.2 pp` (with a real minus sign). */
export function formatDelta(
  value: number | null | undefined,
  decimals = 1,
  unit = '',
): string {
  if (isMissing(value)) return EMPTY_VALUE
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const suffix = unit ? ` ${unit}` : ''
  return `${sign}${formatNumber(Math.abs(value), decimals)}${suffix}`
}

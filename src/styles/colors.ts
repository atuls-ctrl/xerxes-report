import tokens from './colors.module.scss'

// Color tokens for code that needs literal colors (ApexCharts options, inline
// styles). The values are defined once, in `_colors.scss`; to expose another
// token, add it to the `:export` block of `colors.module.scss` and here.

export const colors = {
  white: tokens.white,
  primary: tokens.primary,
  text: tokens.text,
  textMuted: tokens.textMuted,
  textSubtle: tokens.textSubtle,
  border: tokens.border,
  danger: tokens.danger,
  success: tokens.success,
  warning: tokens.warning,
  positive: tokens.positive,
} as const

/** Series colors of the "Xerxes AI Reports" charts, in legend order. */
export const chartSeriesColors: readonly string[] = tokens.chartSeries
  .split(',')
  .map((color) => color.trim())

import tokens from './colors.module.scss'

// Color tokens for TypeScript: ApexCharts options, inline styles, stories.
// Values come from `_variables.scss` via `colors.module.scss`; to add one,
// export it there and list it here.

function token(name: string): string {
  // CSS module typings claim every key exists; a typo would really be missing.
  const value = tokens[name] as string | undefined
  if (value === undefined || value === '') {
    throw new Error(`Missing color token "${name}" in colors.module.scss`)
  }
  return value
}

export const colors = {
  white: token('white'),
  primary: token('primary'),
  page: token('page'),
  text: token('text'),
  textMuted: token('textMuted'),
  textSubtle: token('textSubtle'),
  border: token('border'),
  success: token('success'),
  danger: token('danger'),
  statusGood: token('statusGood'),
} as const

/** Chart series colors, in legend order. */
export const chartColors: string[] = [
  token('chart1'),
  token('chart2'),
  token('chart3'),
  token('chart4'),
  token('chart5'),
  token('chart6'),
  token('chart7'),
  token('chart8'),
  token('chart9'),
]

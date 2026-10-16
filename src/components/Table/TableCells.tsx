import type { ReactNode } from 'react'
import { Icon } from '../icons'
import {
  EMPTY_VALUE,
  formatDelta,
  formatMoney,
  formatNumber,
  formatPercent,
} from './format'
import styles from './TableCells.module.scss'

const isPresent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== ''

// ---- Row label -------------------------------------------------------------
export type TableRowStatus = 'active' | 'paused' | 'stopped'

const STATUS_TEXT: Record<TableRowStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  stopped: 'Stopped',
}

export interface TableRowLabelProps {
  /** Main text, e.g. a campaign id or an app bundle. */
  title: ReactNode
  /** Muted text after the title, e.g. "Wink · OEM Icon". */
  meta?: ReactNode
  /** Colored dot before the title. Its meaning is also read out. */
  status?: TableRowStatus
  /** Overrides the status text read by screen readers. */
  statusLabel?: string
  className?: string
}

/** First-column label: status dot, id and muted name. */
export function TableRowLabel({
  title,
  meta,
  status,
  statusLabel,
  className,
}: TableRowLabelProps) {
  const classes = [styles.rowLabel, className].filter(Boolean).join(' ')
  return (
    <span className={classes}>
      {status !== undefined && (
        <>
          <span
            className={styles.dot}
            data-status={status}
            aria-hidden="true"
          />
          <span className={styles.srOnly}>
            {statusLabel ?? STATUS_TEXT[status]}:{' '}
          </span>
        </>
      )}
      <span className={styles.rowTitle}>{title}</span>
      {isPresent(meta) && <span className={styles.rowMeta}>{meta}</span>}
    </span>
  )
}

// ---- Value -----------------------------------------------------------------
export type TableValueFormat = 'number' | 'percent' | 'money' | 'delta'

export interface TableValueProps {
  value: number | null | undefined
  /** How the number is written. `delta` is colored by its sign. */
  format?: TableValueFormat
  /** Digits after the decimal point. Defaults per format. */
  decimals?: number
  /** ISO currency for `money`. */
  currency?: string
  /** Unit after a `delta`, e.g. `pp`. */
  unit?: string
  /** Red value with a warning icon, e.g. a fraud rate over the limit. */
  warning?: boolean
  /** Text read out for the warning icon. */
  warningLabel?: string
  /** Muted share after the value, in percent (e.g. % of installs). */
  share?: number | null
}

const DEFAULT_DECIMALS: Record<TableValueFormat, number> = {
  number: 0,
  percent: 1,
  money: 2,
  delta: 1,
}

/** A right-aligned report number: count, percent, money or change. */
export function TableValue({
  value,
  format = 'number',
  decimals = DEFAULT_DECIMALS[format],
  currency,
  unit,
  warning = false,
  warningLabel = 'Above threshold',
  share,
}: TableValueProps) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <span className={styles.value} data-tone="empty">
        {EMPTY_VALUE}
      </span>
    )
  }

  let text: string
  switch (format) {
    case 'number':
      text = formatNumber(value, decimals)
      break
    case 'percent':
      text = formatPercent(value, decimals)
      break
    case 'money':
      text = formatMoney(value, decimals, currency)
      break
    case 'delta':
      text = formatDelta(value, decimals, unit)
      break
  }

  let tone: string | undefined
  if (warning) tone = 'warning'
  else if (format === 'delta' && value < 0) tone = 'negative'
  else if (format === 'delta' && value > 0) tone = 'positive'

  return (
    <span className={styles.value} data-tone={tone}>
      {warning && (
        <span className={styles.warningIcon}>
          <Icon name="alert" width={13} height={13} aria-hidden="true" />
          <span className={styles.srOnly}>{warningLabel}: </span>
        </span>
      )}
      {text}
      {share !== undefined && (
        <span className={styles.share}>{formatPercent(share)}</span>
      )}
    </span>
  )
}

// ---- Tag -------------------------------------------------------------------
export type TableTagTone = 'neutral' | 'success'

export interface TableTagProps {
  children: ReactNode
  tone?: TableTagTone
  className?: string
}

/** Small pill, e.g. a source type ("CTV") or a mixed count ("Mixed · 2"). */
export function TableTag({
  children,
  tone = 'neutral',
  className,
}: TableTagProps) {
  const classes = [styles.tag, className].filter(Boolean).join(' ')
  return (
    <span className={classes} data-tone={tone}>
      {children}
    </span>
  )
}

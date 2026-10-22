import type { Currency, Perspective } from '../../state/reportQuery'
import { Button } from '../Button'
import { DatePicker, type DatePickerValue } from '../DatePicker'
import { Icon } from '../icons'
import { ToggleButton } from '../ToggleButton'
import styles from './Header.module.scss'

/** Segmented options, in display order. */
const PERSPECTIVES: { value: Perspective; label: string }[] = [
  { value: 'supply', label: 'Supply' },
  { value: 'demand', label: 'Demand' },
]

const CURRENCIES: Currency[] = ['USD', 'RUB']

/**
 * Report controls. Values in, changes out; `AppLayout` owns the state.
 * Storybook renders it without `ReportQueryProvider`.
 */
export interface HeaderProps {
  dateValue: DatePickerValue
  compare: boolean
  /** Derived, e.g. "Compare previous 7 days". */
  compareLabel: string
  /** Display name of the active source, e.g. "Trackier". */
  sourceLabel: string
  perspective: Perspective
  currency: Currency
  onDateChange: (value: DatePickerValue) => void
  onCompareChange: (compare: boolean) => void
  onPerspectiveChange: (perspective: Perspective) => void
  onCurrencyChange: (currency: Currency) => void
}

/** Header bar wired to the shared report query. */
export function Header({
  dateValue,
  compare,
  compareLabel,
  sourceLabel,
  perspective,
  currency,
  onDateChange,
  onCompareChange,
  onPerspectiveChange,
  onCurrencyChange,
}: HeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.row}>
        <div className={styles.group} role="group" aria-label="Perspective">
          {PERSPECTIVES.map((item) => (
            <Button
              key={item.value}
              size="sm"
              // Selected option is the bordered one, as in Figma.
              variant={item.value === perspective ? 'secondary' : 'ghost'}
              aria-pressed={item.value === perspective}
              onClick={() => {
                onPerspectiveChange(item.value)
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <DatePicker value={dateValue} onChange={onDateChange} size="sm" />
          <ToggleButton
            checked={compare}
            label={compareLabel}
            labelPosition="end"
            size="sm"
            onChange={onCompareChange}
          />
          <span className={styles.source}>
            <Icon name="link" size={14} aria-hidden="true" />
            Source: <strong>{sourceLabel}</strong>
          </span>
        </div>

        <div className={styles.group} role="group" aria-label="Currency">
          {CURRENCIES.map((code) => (
            <Button
              key={code}
              size="sm"
              variant={code === currency ? 'secondary' : 'ghost'}
              aria-pressed={code === currency}
              onClick={() => {
                onCurrencyChange(code)
              }}
            >
              {code}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}

import type { Currency, Perspective } from '../../state/reportQuery'
import { DatePicker, type DatePickerValue } from '../DatePicker'
import { Icon } from '../icons'
import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupOption,
} from '../ToggleButton'
import styles from './Header.module.scss'

/** Segmented options, in display order. */
const PERSPECTIVES: ToggleButtonGroupOption<Perspective>[] = [
  { value: 'supply', label: 'Supply' },
  { value: 'demand', label: 'Demand' },
]

const CURRENCIES: ToggleButtonGroupOption<Currency>[] = [
  { value: 'USD', label: 'USD' },
  { value: 'RUB', label: 'RUB' },
]

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
        <ToggleButtonGroup<Perspective>
          options={PERSPECTIVES}
          value={perspective}
          onChange={onPerspectiveChange}
          size="sm"
          aria-label="Perspective"
        />
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

        <ToggleButtonGroup<Currency>
          options={CURRENCIES}
          value={currency}
          onChange={onCurrencyChange}
          size="sm"
          aria-label="Currency"
        />
      </div>
    </header>
  )
}

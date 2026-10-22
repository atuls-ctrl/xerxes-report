import type { Currency, Perspective } from '../../state/reportQuery'
import { Button } from '../Button'
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
      <div className={styles.flex_group}>
        <div className={styles.title_main}>
          <span className={styles.breadcrumb_nav}>
            <span className={styles.breadcrumb}>Reports</span>
            <span className={styles.breadcrumb}><Icon height={12} name="right" aria-hidden="true" /></span>
            <span className={styles.breadcrumb}>Performance</span>
          </span>
          <h1 className={styles.heading}>Campaign overview </h1>
        </div>

        <div className={styles.group}>
          <ToggleButtonGroup<Perspective>
            options={PERSPECTIVES}
            value={perspective}
            onChange={onPerspectiveChange}
            size="md"
            aria-label="Perspective"
          />
          <Button
            size="md"
            variant="secondary"
            icon={<Icon name="bell" aria-hidden="true" />}
            badge={3}
            aria-label="Notifications"
          />
          <Button
            size="md"
            variant="secondary"
            icon={<Icon name="share" aria-hidden="true" />}
          > Share
          </Button>
          <Button
            size="md"
            variant="secondary"
            icon={<Icon name="download" aria-hidden="true" />}
          > Export
          </Button>
          <Button
            size="md"
            variant="primary"
            icon={<Icon name="save" aria-hidden="true" />}
          > Save as report
          </Button>
        </div>
      </div>

      <div className={styles.flex_group}>
        <div>
          <div className={styles.group}>
            <DatePicker value={dateValue} onChange={onDateChange} size="md" />
            <ToggleButton
              checked={compare}
              label={compareLabel}
              labelPosition="end"
              size="md"
              onChange={onCompareChange}
            />
            <span className={styles.source}>
              <Icon name="link" size={14} aria-hidden="true" />
              Source: <strong>{sourceLabel}</strong>
            </span>
          </div>
        </div>
        <div>
          <ToggleButtonGroup<Currency>
            options={CURRENCIES}
            value={currency}
            onChange={onCurrencyChange}
            size="md"
            aria-label="Currency"
          />
        </div>
      </div>

    </header >
  )
}

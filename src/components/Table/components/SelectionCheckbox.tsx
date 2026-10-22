import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { isValidElement, type ChangeEvent, type ReactNode } from 'react'
import { Checkbox } from '../../Checkbox'
import styles from '../Table.module.scss'

/** Props of the checkbox Ant Design builds for a selection cell. */
interface OriginCheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  'aria-label'?: string
  onChange?: (event: CheckboxChangeEvent) => void
}

/**
 * Renders the project Checkbox with the state Ant Design computed for its
 * own checkbox, so selection logic (select all, tree, shift-click) is kept.
 */
export function SelectionCheckbox({ origin }: { origin: ReactNode }) {
  if (!isValidElement<OriginCheckboxProps>(origin)) return origin
  const {
    checked = false,
    indeterminate = false,
    disabled = false,
    'aria-label': ariaLabel,
    onChange,
  } = origin.props

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      target: { checked: event.target.checked },
      nativeEvent: event.nativeEvent as globalThis.MouseEvent,
      stopPropagation: () => {
        event.stopPropagation()
      },
      preventDefault: () => {
        event.preventDefault()
      },
    })
  }

  return (
    // Keeps a checkbox click from also firing the row click.
    <span
      className={styles.selection}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
    </span>
  )
}

import {
  useId,
  useState,
  type ChangeEvent,
  type FieldsetHTMLAttributes,
  type ReactNode,
} from 'react'
import { Checkbox, type CheckboxVariant } from './Checkbox'
import styles from './CheckboxGroup.module.scss'

export type CheckboxGroupOrientation = 'vertical' | 'horizontal'

export interface CheckboxGroupOption {
  value: string
  label: ReactNode
  /** Second line under the label (`row` only). */
  description?: ReactNode
  disabled?: boolean
}

type NativeFieldsetProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'onChange' | 'defaultValue' | 'children'
>

export interface CheckboxGroupProps extends NativeFieldsetProps {
  options: CheckboxGroupOption[]
  /** Controlled selected values. Omit (and use `defaultValue`) to leave it uncontrolled. */
  value?: string[]
  /** Initial selected values when uncontrolled. */
  defaultValue?: string[]
  /**
   * Fires with the new selection. New picks are appended, so the array is
   * in the order the user chose them.
   */
  onChange?: (value: string[], event: ChangeEvent<HTMLInputElement>) => void
  /** Group heading, rendered as the fieldset legend. */
  label?: ReactNode
  helperText?: ReactNode
  /** Error text under the group. Also marks every checkbox invalid. */
  errorMessage?: ReactNode
  /** Shows a required marker on the legend. */
  required?: boolean
  variant?: CheckboxVariant
  /** Defaults to `vertical` for rows and `horizontal` for buttons. */
  orientation?: CheckboxGroupOrientation
  /**
   * Shows the selection order in a badge on each row (group-by lists).
   * Unselected rows keep an empty badge slot.
   */
  ordered?: boolean
  /** Form field name shared by every checkbox. */
  name?: string
}

const isPresent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false

export function CheckboxGroup({
  options,
  value,
  defaultValue = [],
  onChange,
  label,
  helperText,
  errorMessage,
  required = false,
  variant = 'row',
  orientation,
  ordered = false,
  name,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxGroupProps) {
  const messageId = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)

  const isControlled = value !== undefined
  const selected = isControlled ? value : internalValue
  const hasError = isPresent(errorMessage)
  const message = hasError ? errorMessage : helperText
  const hasMessage = isPresent(message)
  const resolvedOrientation =
    orientation ?? (variant === 'button' ? 'horizontal' : 'vertical')

  const describedBy =
    [ariaDescribedBy, hasMessage ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const optionValue = event.target.value
    const next = event.target.checked
      ? [...selected.filter((item) => item !== optionValue), optionValue]
      : selected.filter((item) => item !== optionValue)
    if (!isControlled) setInternalValue(next)
    onChange?.(next, event)
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <fieldset
      {...rest}
      disabled={disabled}
      aria-describedby={describedBy}
      className={classes}
      data-invalid={hasError || undefined}
    >
      {isPresent(label) && (
        <legend className={styles.legend}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}
      <div className={styles.options} data-orientation={resolvedOrientation}>
        {options.map((option) => {
          const order = selected.indexOf(option.value)
          const checked = order !== -1
          return (
            <Checkbox
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              description={option.description}
              variant={variant}
              checked={checked}
              disabled={disabled || option.disabled}
              invalid={hasError}
              badge={ordered ? (checked ? order + 1 : '') : undefined}
              onChange={handleChange}
            />
          )
        })}
      </div>
      {hasMessage && (
        <div id={messageId} className={styles.message}>
          {message}
        </div>
      )}
    </fieldset>
  )
}

import {
  useId,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import styles from './Checkbox.module.scss'

export type CheckboxVariant = 'row' | 'button'

type NativeCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'children'
>

export interface CheckboxProps extends NativeCheckboxProps {
  /** Text next to the box. Clicking it toggles the checkbox. */
  label?: ReactNode
  /** Muted second line under the label (`row` only). */
  description?: ReactNode
  /** Muted text under the checkbox. Replaced by `errorMessage` when set. */
  helperText?: ReactNode
  /** Error text under the checkbox. Also switches it to the error state. */
  errorMessage?: ReactNode
  /** Error look without a message, e.g. when a group shows the message. */
  invalid?: boolean
  /** Shows a dash instead of a tick, e.g. for a partly selected "Select all". */
  indeterminate?: boolean
  /** `row` is the list row with a box; `button` is the day-picker button. */
  variant?: CheckboxVariant
  /**
   * Small tag at the end of a `row`, e.g. the group-by order. An empty
   * string keeps the empty slot so rows line up.
   */
  badge?: ReactNode
  ref?: Ref<HTMLInputElement>
}

const isPresent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false

export function Checkbox({
  label,
  description,
  helperText,
  errorMessage,
  invalid = false,
  indeterminate = false,
  variant = 'row',
  badge,
  disabled = false,
  required = false,
  id,
  className,
  style,
  ref,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxProps) {
  const generatedId = useId()
  const descriptionId = useId()
  const messageId = useId()
  const inputId = id ?? generatedId

  const inputRef = useRef<HTMLInputElement>(null)

  const hasError = isPresent(errorMessage)
  const isInvalid = invalid || hasError
  const message = hasError ? errorMessage : helperText
  const hasMessage = isPresent(message)
  const isRow = variant === 'row'
  const hasDescription = isRow && isPresent(description)
  const hasBadge = isRow && badge !== undefined && badge !== null

  // `indeterminate` has no HTML attribute; it is set on the DOM node before
  // paint so the box never flashes empty.
  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') return ref(node)
    if (ref) ref.current = node
    return undefined
  }

  const describedBy =
    [
      ariaDescribedBy,
      hasDescription ? descriptionId : undefined,
      hasMessage ? messageId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={style}
      data-variant={variant}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
    >
      <label htmlFor={inputId} className={styles.control}>
        <input
          {...rest}
          ref={setRefs}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className={styles.input}
        />
        {isRow && <span className={styles.box} aria-hidden="true" />}
        {isPresent(label) && (
          <span className={styles.text}>
            <span className={styles.label}>
              {label}
              {required && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {hasDescription && (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            )}
          </span>
        )}
        {hasBadge && <span className={styles.badge}>{badge}</span>}
      </label>
      {hasMessage && (
        <div id={messageId} className={styles.message}>
          {message}
        </div>
      )}
    </div>
  )
}

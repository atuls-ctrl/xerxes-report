import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { Icon } from '../icons'
import styles from './Input.module.scss'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputStatus = 'default' | 'error' | 'success'
export type InputType =
  'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'prefix'
>

export interface InputProps extends NativeInputProps {
  type?: InputType
  /** Controlled value. Omit (and use `defaultValue`) to leave the input uncontrolled. */
  value?: string | number
  /** Initial value when uncontrolled. */
  defaultValue?: string | number
  /** Visible label, linked to the input. Without it, pass `aria-label`. */
  label?: ReactNode
  /** Muted text under the field. Replaced by `errorMessage` when set. */
  helperText?: ReactNode
  /** Error text under the field. Also switches the field to the error state. */
  errorMessage?: ReactNode
  /** Validation look. `errorMessage` forces `error`. */
  status?: InputStatus
  size?: InputSize
  /** Icon before the text, e.g. `<Icon name="search" />`. */
  leadingIcon?: ReactNode
  /** Icon after the text. */
  trailingIcon?: ReactNode
  /** Shows a clear button while the input has a value. */
  allowClear?: boolean
  /** Fires after the clear button empties the input. */
  onClear?: () => void
  /** Adds a Show/Hide button to `type="password"` inputs. */
  showPasswordToggle?: boolean
  /** Field width. Numbers are pixels. */
  width?: number | string
  ref?: Ref<HTMLInputElement>
}

type InputCssVars = CSSProperties & Record<`--input-${string}`, string>

const hasValue = (value: string | number | undefined) =>
  value !== undefined && String(value) !== ''

// Sets the value the way the browser would, so React fires `onChange`
// for both controlled and uncontrolled inputs.
function setNativeValue(input: HTMLInputElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

export function Input({
  type = 'text',
  value,
  defaultValue,
  label,
  helperText,
  errorMessage,
  status = 'default',
  size = 'md',
  leadingIcon,
  trailingIcon,
  allowClear = false,
  onClear,
  showPasswordToggle = true,
  width,
  disabled = false,
  readOnly = false,
  required = false,
  id,
  className,
  style,
  onChange,
  ref,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const messageId = useId()
  const inputId = id ?? generatedId

  const inputRef = useRef<HTMLInputElement>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [uncontrolledFilled, setUncontrolledFilled] = useState(
    hasValue(defaultValue),
  )

  const isControlled = value !== undefined
  const isFilled = isControlled ? hasValue(value) : uncontrolledFilled
  const hasError =
    errorMessage !== undefined &&
    errorMessage !== null &&
    errorMessage !== false
  const resolvedStatus: InputStatus = hasError ? 'error' : status
  const message = hasError ? errorMessage : helperText
  const hasMessage =
    message !== undefined && message !== null && message !== false
  const hasLabel = label !== undefined && label !== null && label !== false

  const isPassword = type === 'password'
  const canEdit = !disabled && !readOnly
  const showClear = allowClear && canEdit && isFilled
  const showToggle = isPassword && showPasswordToggle
  const inputType = isPassword && passwordVisible ? 'text' : type

  const describedBy =
    [ariaDescribedBy, hasMessage ? messageId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') return ref(node)
    if (ref) ref.current = node
    return undefined
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledFilled(event.target.value !== '')
    onChange?.(event)
  }

  const handleClear = () => {
    const input = inputRef.current
    if (!input) return
    setNativeValue(input, '')
    input.focus()
    onClear?.()
  }

  // Clicks on the padding or icons focus the input, like a native field.
  const handleFieldMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target === inputRef.current || target.closest('button')) return
    event.preventDefault()
    inputRef.current?.focus()
  }

  const cssVars: InputCssVars = { ...style }
  if (width !== undefined) {
    cssVars['--input-width'] =
      typeof width === 'number' ? `${String(width)}px` : width
  }

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={cssVars}
      data-size={size}
      data-status={resolvedStatus}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      {hasLabel && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={styles.field} onMouseDown={handleFieldMouseDown}>
        {leadingIcon !== undefined && (
          <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          {...rest}
          ref={setRefs}
          id={inputId}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={resolvedStatus === 'error' || undefined}
          aria-describedby={describedBy}
          data-clearable={allowClear || undefined}
          className={styles.input}
          onChange={handleChange}
        />
        {showClear && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear"
            aria-controls={inputId}
            onClick={handleClear}
          >
            <Icon name="cross" size={14} />
          </button>
        )}
        {showToggle && (
          <button
            type="button"
            className={styles.toggle}
            disabled={disabled}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            aria-controls={inputId}
            onClick={() => {
              setPasswordVisible((visible) => !visible)
            }}
          >
            {passwordVisible ? 'Hide' : 'Show'}
          </button>
        )}
        {trailingIcon !== undefined && (
          <span className={styles.icon} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>
      {hasMessage && (
        <div id={messageId} className={styles.message}>
          {message}
        </div>
      )}
    </div>
  )
}

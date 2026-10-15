import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import type { ToggleButtonSize } from './ToggleButton'
import styles from './ToggleButtonGroup.module.scss'

export type ToggleButtonGroupSize = ToggleButtonSize

export interface ToggleButtonGroupOption<T extends string = string> {
  value: T
  /** Visible text. With `iconOnly` it is kept for screen readers only. */
  label: ReactNode
  /** Icon node, e.g. `<Icon name="linechart" />`. */
  icon?: ReactNode
  /** Shows only the icon (chart type switch). `label` stays the accessible name. */
  iconOnly?: boolean
  /** Native tooltip, handy for icon-only segments. */
  title?: string
  disabled?: boolean
}

type NativeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'children' | 'role'
>

export interface ToggleButtonGroupProps<
  T extends string = string,
> extends NativeDivProps {
  options: readonly ToggleButtonGroupOption<T>[]
  /** Controlled selected value. Omit to let the component manage its own state. */
  value?: T
  /** Initial selected value when uncontrolled. */
  defaultValue?: T
  /** Fires with the newly selected value. Not called when re-clicking the current one. */
  onChange?: (value: T, event: MouseEvent<HTMLButtonElement>) => void
  /**
   * Inline caption before the segments (e.g. "Metric"). Also names the group;
   * without it, pass `aria-label`.
   */
  label?: ReactNode
  size?: ToggleButtonGroupSize
  /** Stretches the control and splits the width evenly between segments. */
  fullWidth?: boolean
  disabled?: boolean
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

export function ToggleButtonGroup<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  label,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ToggleButtonGroupProps<T>) {
  const labelId = useId()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([])

  const isControlled = value !== undefined
  const selected = isControlled ? value : internalValue
  const hasLabel = label !== undefined && label !== null && label !== false

  const isEnabled = (option: ToggleButtonGroupOption<T>) =>
    !disabled && !option.disabled

  // Roving tabindex: Tab lands on the selected segment, or the first
  // enabled one when nothing is selected.
  const selectedIndex = options.findIndex(
    (option) => option.value === selected && isEnabled(option),
  )
  const tabStop =
    selectedIndex === -1 ? options.findIndex(isEnabled) : selectedIndex

  const select = (
    option: ToggleButtonGroupOption<T>,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isEnabled(option) || option.value === selected) return
    if (!isControlled) setInternalValue(option.value)
    onChange?.(option.value, event)
  }

  // Arrows move focus only; Space/Enter selects (manual activation), so
  // browsing the options does not re-render a chart on every key press.
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabled = options
      .map((option, index) => (isEnabled(option) ? index : -1))
      .filter((index) => index !== -1)
    if (enabled.length === 0) return

    const current = enabled.indexOf(
      segmentRefs.current.indexOf(event.currentTarget),
    )
    let target: number | undefined
    if (NEXT_KEYS.has(event.key)) {
      target = enabled[(current + 1) % enabled.length]
    } else if (PREV_KEYS.has(event.key)) {
      target = enabled[(current - 1 + enabled.length) % enabled.length]
    } else if (event.key === 'Home') {
      target = enabled[0]
    } else if (event.key === 'End') {
      target = enabled[enabled.length - 1]
    }
    if (target === undefined) return

    event.preventDefault()
    segmentRefs.current[target]?.focus()
  }

  const labelledBy =
    [ariaLabelledBy, hasLabel ? labelId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div
      {...rest}
      className={classes}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-disabled={disabled || undefined}
    >
      {hasLabel && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={styles.track}
      >
        {options.map((option, index) => {
          const isSelected = option.value === selected
          return (
            <button
              key={option.value}
              ref={(node) => {
                segmentRefs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === tabStop ? 0 : -1}
              disabled={!isEnabled(option)}
              title={option.title}
              className={styles.segment}
              data-icon-only={option.iconOnly ? true : undefined}
              onClick={(event) => {
                select(option, event)
              }}
              onKeyDown={handleKeyDown}
            >
              {option.icon !== undefined && (
                <span className={styles.icon} aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span
                className={
                  option.iconOnly ? styles.visuallyHidden : styles.text
                }
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

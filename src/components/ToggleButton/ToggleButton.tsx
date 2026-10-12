import {
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import styles from './ToggleButton.module.scss'

function cssClass(name: 'root' | 'track' | 'thumb' | 'label'): string {
  const value = styles[name]
  if (value === undefined) {
    throw new Error(`Missing CSS module class "${name}"`)
  }
  return value
}

const rootClass = cssClass('root')
const trackClass = cssClass('track')
const thumbClass = cssClass('thumb')
const labelClass = cssClass('label')

export type ToggleButtonSize = 'sm' | 'md' | 'lg'
export type ToggleButtonLabelPosition = 'start' | 'end'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'children' | 'type' | 'role' | 'aria-checked' | 'color'
>

export interface ToggleButtonProps extends NativeButtonProps {
  /** Controlled on/off state. Omit to let the component manage its own state. */
  checked?: boolean
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean
  /** Text or node rendered next to the switch. Clicking it also toggles. */
  label?: ReactNode
  labelPosition?: ToggleButtonLabelPosition
  size?: ToggleButtonSize
  /** Track color when on. Any CSS color. */
  activeColor?: string
  /** Track color when off. Any CSS color. */
  inactiveColor?: string
  /** Thumb (knob) color. Any CSS color. */
  thumbColor?: string
  disabled?: boolean
  /** Shows a busy state and blocks toggling, e.g. while saving. */
  loading?: boolean
  /**
   * Fires with the next state. If it returns a promise, the toggle stays busy
   * until it settles; on rejection an uncontrolled toggle reverts and
   * `onError` is called.
   */
  onChange?: (
    checked: boolean,
    event: MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>
  /** Called when the promise returned by `onChange` rejects. */
  onError?: (error: unknown) => void
}

type ToggleCssVars = CSSProperties & Record<`--toggle-${string}`, string>

export function ToggleButton({
  checked,
  defaultChecked = false,
  label,
  labelPosition = 'start',
  size = 'md',
  activeColor,
  inactiveColor,
  thumbColor,
  disabled = false,
  loading = false,
  onChange,
  onError,
  onClick,
  className,
  style,
  ...rest
}: ToggleButtonProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const [pending, setPending] = useState(false)

  const isControlled = checked !== undefined
  const isOn = isControlled ? checked : internalChecked
  const isBusy = loading || pending

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled || isBusy) return

    const next = !isOn
    if (!isControlled) setInternalChecked(next)

    const result = onChange?.(next, event)
    if (result instanceof Promise) {
      setPending(true)
      void result
        .catch((error: unknown) => {
          if (!isControlled) setInternalChecked(!next)
          onError?.(error)
        })
        .finally(() => {
          setPending(false)
        })
    }
  }

  const cssVars: ToggleCssVars = { ...style }
  if (activeColor) cssVars['--toggle-active-color'] = activeColor
  if (inactiveColor) cssVars['--toggle-inactive-color'] = inactiveColor
  if (thumbColor) cssVars['--toggle-thumb-color'] = thumbColor

  const classes = [rootClass, className].filter(Boolean).join(' ')

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-busy={isBusy || undefined}
      aria-disabled={isBusy || undefined}
      disabled={disabled}
      className={classes}
      style={cssVars}
      data-size={size}
      data-label-position={labelPosition}
      onClick={handleClick}
    >
      <span className={trackClass} aria-hidden="true">
        <span className={thumbClass} />
      </span>
      {label !== undefined && <span className={labelClass}>{label}</span>}
    </button>
  )
}

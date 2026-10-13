import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dashed'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonIconPosition = 'start' | 'end'

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>

export interface ButtonProps extends NativeButtonProps {
  /** Color theme. `dashed` is the quiet "Add filter" style. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon node, e.g. `<Icon name="react" />`. Without `children` the button is icon only. */
  icon?: ReactNode
  iconPosition?: ButtonIconPosition
  /** Muted text after the label, e.g. a count. */
  suffix?: ReactNode
  /** Small red counter on the top-right (icon buttons). Hidden when empty. */
  badge?: ReactNode
  disabled?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'start',
  suffix,
  badge,
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const hasLabel =
    children !== undefined && children !== null && children !== false
  const isIconOnly = icon !== undefined && !hasLabel
  const hasBadge = badge !== undefined && badge !== null && badge !== false

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      className={classes}
      data-variant={variant}
      data-size={size}
      data-icon-only={isIconOnly || undefined}
      data-icon-position={iconPosition}
    >
      {icon !== undefined && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {hasLabel && <span className={styles.label}>{children}</span>}
      {suffix !== undefined && <span className={styles.suffix}>{suffix}</span>}
      {hasBadge && <span className={styles.badge}>{badge}</span>}
    </button>
  )
}

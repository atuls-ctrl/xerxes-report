import styles from './Line.module.scss'

export type LineOrientation = 'horizontal' | 'vertical'

export interface LineProps {
  /** `horizontal` is a full-width rule; `vertical` is a full-height rule. */
  orientation?: LineOrientation
  className?: string
  /** Names the separator. Omit to treat the rule as decorative. */
  label?: string
}

/** Hairline separator. Uses the shared border token. */
export function Line({
  orientation = 'horizontal',
  className,
  label,
}: LineProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ')
  const isDecorative = label === undefined || label === ''

  return (
    <hr
      className={classes}
      data-orientation={orientation}
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : label}
    />
  )
}

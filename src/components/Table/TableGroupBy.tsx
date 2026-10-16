import { Fragment, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Icon } from '../icons'
import styles from './TableGroupBy.module.scss'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
>

export interface TableGroupByProps extends NativeButtonProps {
  /** Grouping levels in order, e.g. `['Campaign', 'App bundle', 'Publisher']`. */
  levels: ReactNode[]
  /** Text before the chips. */
  label?: ReactNode
}

/**
 * Toolbar control showing the current grouping as chips. It is a plain
 * button: open your own menu from `onClick` (or wrap it in a dropdown).
 */
export function TableGroupBy({
  levels,
  label = 'Group by',
  className,
  ...rest
}: TableGroupByProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ')
  return (
    <div className={classes}>
      <span className={styles.label}>
        <Icon name="layers" size={16} aria-hidden="true" />
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="menu"
        {...rest}
        className={styles.trigger}
      >
        {levels.map((level, index) => (
          // Levels are positional; their order is the grouping order.
          <Fragment key={index}>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">
                ›
              </span>
            )}
            <span className={styles.chip}>{level}</span>
          </Fragment>
        ))}
        <Icon name="down" width={14} height={14} aria-hidden="true" />
      </button>
    </div>
  )
}

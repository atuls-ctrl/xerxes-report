import type { MouseEvent } from 'react'
import { Icon } from '../../icons'
import styles from '../Table.module.scss'

export interface ExpandIconProps {
  expanded: boolean
  /** `false` for leaf rows; they get a spacer so labels stay aligned. */
  expandable: boolean
  /** Children are loading; the caret becomes a spinner. */
  loading: boolean
  onToggle: (event: MouseEvent<HTMLElement>) => void
}

/** The caret before a tree row's label. */
export function ExpandIcon({
  expanded,
  expandable,
  loading,
  onToggle,
}: ExpandIconProps) {
  if (!expandable) {
    return <span className={styles.expandSpacer} aria-hidden="true" />
  }
  return (
    <button
      type="button"
      className={styles.expandButton}
      aria-expanded={expanded}
      aria-label={expanded ? 'Collapse row' : 'Expand row'}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      onClick={(event) => {
        // Expanding must not also fire the row click.
        event.stopPropagation()
        onToggle(event)
      }}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <Icon name="right" width={13} height={13} aria-hidden="true" />
      )}
    </button>
  )
}

import type { TablePaginationConfig } from 'antd/es/table'
import { Icon } from '../../icons'
import styles from '../Table.module.scss'

/** Figma pager items, shared by the footer pager and the child pagers. */
export const renderPagerItem: NonNullable<
  TablePaginationConfig['itemRender']
> = (_page, type, element) => {
  // Figma "Page gap": a quiet ellipsis (antd swaps in arrows on hover).
  if (type === 'jump-prev' || type === 'jump-next') {
    return <span className={styles.pagerGap}>…</span>
  }
  if (type !== 'prev' && type !== 'next') return element
  // The surrounding <li> is the focusable control; the button is visual.
  return (
    <button type="button" tabIndex={-1} className={styles.pagerArrow}>
      <Icon
        name={type === 'prev' ? 'left' : 'right'}
        width={15}
        height={15}
        aria-hidden="true"
      />
    </button>
  )
}

/** "1–10 of 30", the range text of a pager. */
export const formatRange = (total: number, [start, end]: [number, number]) =>
  `${String(start)}–${String(end)} of ${String(total)}`

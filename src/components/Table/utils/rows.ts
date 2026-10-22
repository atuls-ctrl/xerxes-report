import type { TableProps as AntTableProps } from 'antd'
import type { Key, KeyboardEvent, MouseEvent } from 'react'
import styles from '../Table.module.scss'
import type { TableProps, TableRowKey } from '../types'
import { cx } from './classNames'
import { getRowKey } from './records'

type AntRowClassName<RecordType> = AntTableProps<RecordType>['rowClassName']
type AntOnRow<RecordType> = AntTableProps<RecordType>['onRow']

interface RowOptions<RecordType extends object> {
  rowKey: TableRowKey<RecordType>
  /** Keys of the highlighted rows; empty when nothing is highlighted. */
  activeKeys: ReadonlySet<Key>
  onRowClick: TableProps<RecordType>['onRowClick']
}

/** Adds the clickable and active styles to the consumer's `rowClassName`. */
export function createRowClassName<RecordType extends object>(
  rowClassName: AntRowClassName<RecordType>,
  { rowKey, activeKeys, onRowClick }: RowOptions<RecordType>,
): NonNullable<AntRowClassName<RecordType>> {
  return (record, index, indent) => {
    const custom =
      typeof rowClassName === 'function'
        ? rowClassName(record, index, indent)
        : rowClassName
    const key = getRowKey(rowKey, record)
    const isActive = key !== undefined && activeKeys.has(key)
    return (
      cx(custom, onRowClick && styles.clickable, isActive && styles.active) ??
      ''
    )
  }
}

const isActivationKey = (key: string) => key === 'Enter' || key === ' '

/**
 * Wraps the consumer's `onRow` so clickable rows are focusable and fire
 * `onRowClick` on click, Enter and Space. Without `onRowClick` it is a
 * pass-through.
 */
export function createRowProps<RecordType extends object>(
  onRow: AntOnRow<RecordType>,
  { rowKey, activeKeys, onRowClick }: RowOptions<RecordType>,
): NonNullable<AntOnRow<RecordType>> {
  return (record, index) => {
    const props = onRow?.(record, index) ?? {}
    if (!onRowClick) return props
    const key = getRowKey(rowKey, record)
    return {
      ...props,
      tabIndex: props.tabIndex ?? 0,
      'aria-selected':
        activeKeys.size === 0
          ? undefined
          : key !== undefined && activeKeys.has(key),
      onClick: (event: MouseEvent<HTMLElement>) => {
        props.onClick?.(event)
        onRowClick(record, index, event)
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        props.onKeyDown?.(event)
        // Only the row itself; keys inside cells (checkbox, links) pass.
        if (event.target !== event.currentTarget) return
        if (isActivationKey(event.key)) {
          event.preventDefault()
          onRowClick(record, index, event)
        }
      },
    }
  }
}

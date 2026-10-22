import type { ColumnType } from 'antd/es/table'
import { isValidElement, type ReactNode } from 'react'
import { getValueAtPath } from './records'

/** A total-row cell, drawn with the column's own `render` when it has one. */
export function renderSummaryValue<RecordType>(
  column: ColumnType<RecordType>,
  record: Partial<RecordType>,
): ReactNode {
  const value = getValueAtPath(record, column.dataIndex)
  if (!column.render) return value as ReactNode
  const rendered = column.render(value, record as RecordType, -1)
  // `render` may return `{ children, props }` (a "rendered cell").
  if (
    rendered !== null &&
    typeof rendered === 'object' &&
    !isValidElement(rendered) &&
    'children' in rendered
  ) {
    return rendered.children
  }
  return rendered as ReactNode
}

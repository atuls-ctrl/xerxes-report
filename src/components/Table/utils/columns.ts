import type { ColumnsType, ColumnType } from 'antd/es/table'
import styles from '../Table.module.scss'
import type {
  TableColumnGroupType,
  TableColumnsType,
  TableColumnType,
} from '../types'
import { classNameProp, cx } from './classNames'

/** Stable id of a column: its `key`, else its `dataIndex`. */
export const getColumnId = (key: unknown, dataIndex: unknown) =>
  String(key ?? dataIndex)

export const isColumnGroup = <RecordType>(
  column: TableColumnGroupType<RecordType> | TableColumnType<RecordType>,
): column is TableColumnGroupType<RecordType> =>
  'children' in column && Array.isArray(column.children)

/**
 * Adds the section dividers (after the first column and around every group),
 * the small-caps group header style and the highlight tint.
 */
export function decorateColumns<RecordType>(
  columns: TableColumnsType<RecordType>,
  isTopLevel = true,
  startsSection = false,
): ColumnsType<RecordType> {
  return columns.map((column, index) => {
    const previous = index > 0 ? columns[index - 1] : undefined
    const isSectionStart = isTopLevel
      ? previous !== undefined &&
        (index === 1 || isColumnGroup(column) || isColumnGroup(previous))
      : startsSection && index === 0

    if (isColumnGroup(column)) {
      const { children, highlight, className, ...rest } = column
      return {
        ...rest,
        ...classNameProp(
          cx(
            className,
            styles.groupHeader,
            isSectionStart && styles.sectionStart,
            highlight && styles.highlight,
          ),
        ),
        children: decorateColumns(children, false, isSectionStart),
      }
    }

    const { highlight, className, ...rest } = column
    return {
      ...rest,
      ...classNameProp(
        cx(
          className,
          isSectionStart && styles.sectionStart,
          highlight && styles.highlight,
        ),
      ),
    }
  })
}

/** Columns that render cells, in display order (groups flattened). */
export function getLeafColumns<RecordType>(
  columns: ColumnsType<RecordType>,
): ColumnType<RecordType>[] {
  return columns.flatMap((column) =>
    'children' in column ? getLeafColumns(column.children) : [column],
  )
}

/** Drops hidden leaf columns, and groups left with no columns. */
export function removeHiddenColumns<RecordType>(
  columns: TableColumnsType<RecordType>,
  hidden: ReadonlySet<string>,
): TableColumnsType<RecordType> {
  return columns.flatMap((column) => {
    if (isColumnGroup(column)) {
      const children = removeHiddenColumns(column.children, hidden)
      return children.length > 0 ? [{ ...column, children }] : []
    }
    return hidden.has(getColumnId(column.key, column.dataIndex)) ? [] : [column]
  })
}

export interface PreparedColumns<RecordType> {
  /** Ant Design columns with the visual decorations applied. */
  columns: ColumnsType<RecordType>
  /** Visible leaf columns, for the total row and the child pager. */
  leafColumns: ColumnType<RecordType>[]
}

/**
 * Everything the table does to `columns` before handing them to Ant Design:
 * hide the picked ones, then decorate. Unknown hidden keys are ignored.
 */
export function prepareColumns<RecordType>(
  columns: TableColumnsType<RecordType>,
  hiddenKeys: readonly string[],
): PreparedColumns<RecordType> {
  const visible =
    hiddenKeys.length > 0
      ? removeHiddenColumns(columns, new Set(hiddenKeys))
      : columns
  const decorated = decorateColumns(visible)
  return { columns: decorated, leafColumns: getLeafColumns(decorated) }
}

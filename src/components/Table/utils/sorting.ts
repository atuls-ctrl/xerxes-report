import type { ColumnType } from 'antd/es/table'
import type { SorterResult, SortOrder } from 'antd/es/table/interface'
import type { TableSortState } from '../store/types'
import { getColumnId } from './columns'

export type CompareFn<RecordType> = (a: RecordType, b: RecordType) => number

/** The store's sort from what Ant Design reports in `onChange`. */
export function toSortState<RecordType>(
  sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
): TableSortState | null {
  const first = Array.isArray(sorter) ? sorter.at(0) : sorter
  if (!first) return null
  return {
    columnId: getColumnId(first.columnKey, first.field),
    order: first.order ?? null,
  }
}

function getCompare<RecordType>(
  sorter: ColumnType<RecordType>['sorter'],
): ((a: RecordType, b: RecordType, order?: SortOrder) => number) | undefined {
  if (typeof sorter === 'function') return sorter
  if (typeof sorter === 'object') return sorter.compare
  return undefined
}

/**
 * The comparator for the active sort, resolved the way Ant Design does:
 * controlled `sortOrder` first, then the user's last sort, then
 * `defaultSortOrder`. `undefined` when nothing sorts.
 */
export function getActiveCompare<RecordType>(
  leaves: readonly ColumnType<RecordType>[],
  sort: TableSortState | null,
): CompareFn<RecordType> | undefined {
  let column: ColumnType<RecordType> | undefined
  let order: SortOrder | undefined
  if (leaves.some((leaf) => leaf.sortOrder !== undefined)) {
    column = leaves.find((leaf) => leaf.sortOrder)
    order = column?.sortOrder
  } else if (sort) {
    column = leaves.find(
      (leaf) => getColumnId(leaf.key, leaf.dataIndex) === sort.columnId,
    )
    order = sort.order
  } else {
    column = leaves.find((leaf) => leaf.defaultSortOrder)
    order = column?.defaultSortOrder
  }
  const compare = getCompare(column?.sorter)
  if (!compare || !order) return undefined
  const direction = order === 'ascend' ? 1 : -1
  return (a, b) => direction * compare(a, b, order)
}

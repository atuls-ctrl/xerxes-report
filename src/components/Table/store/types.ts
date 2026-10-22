import type { SortOrder } from 'antd/es/table/interface'
import type { Key } from 'react'
import type { OneOrMany, TableDensity } from '../types'

/** The column the user last sorted by, as reported by Ant Design. */
export interface TableSortState {
  /** Column `key`, or its `dataIndex` when it has no key. */
  columnId: string
  order: SortOrder
}

/**
 * Shared UI state of one table. Values the parent controls through props
 * (`density`, `groupBy.value`, `rowSelection.selectedRowKeys`,
 * `expandable.expandedRowKeys`) are merged in before anyone reads this, so
 * it always shows what is on screen.
 */
export interface TableState {
  density: TableDensity
  /** Last user sort; `null` until the user sorts once. */
  sort: TableSortState | null
  /** Applied "Group by" dimensions, outermost first. */
  groupBy: string[]
  expandedRowKeys: Key[]
  selectedRowKeys: Key[]
  /** Current child-pager page per parent row key. */
  childPages: Readonly<Record<string, number>>
}

/** One state change. Only the table's own handlers dispatch these. */
export type TableAction =
  | { type: 'setDensity'; density: TableDensity }
  | { type: 'setSort'; sort: TableSortState | null }
  | { type: 'setGroupBy'; groupBy: string[] }
  | { type: 'setExpandedRowKeys'; keys: Key[] }
  | { type: 'setSelectedRowKeys'; keys: Key[] }
  | { type: 'setChildPage'; parentKey: Key; page: number }

/**
 * Writes available to code rendered inside the table (toolbar content, cell
 * renderers, custom components). Every write also calls the matching
 * `on…Change` prop, and leaves controlled values to the parent.
 */
export interface TableActions {
  setDensity: (density: TableDensity) => void
  toggleDensity: () => void
  /** One dimension or several, outermost first. */
  setGroupBy: (value: OneOrMany<string>) => void
  /** One row or several. Replaces the expanded set. */
  setExpandedRowKeys: (keys: OneOrMany<Key>) => void
  /**
   * One row or several. Replaces the selection. A radio (single) selection
   * keeps only the first key.
   */
  setSelectedRowKeys: (keys: OneOrMany<Key>) => void
  clearSelection: () => void
  /** Page of the child pager under `parentKey`. Values below 1 become 1. */
  setChildPage: (parentKey: Key, page: number) => void
}

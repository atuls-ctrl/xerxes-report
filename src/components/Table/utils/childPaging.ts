import type { Key } from 'react'
import type { TableRowKey } from '../types'
import { getChildRows, getRowKey } from './records'
import type { CompareFn } from './sorting'

/** One small pager drawn under a paged group of child rows. */
export interface ChildPagerInfo {
  parentKey: Key
  /** Depth of the paged children (1 = children of a top-level row). */
  level: number
  page: number
  pageSize: number
  total: number
}

/** Pagers to draw after the row with this key, innermost first. */
export type ChildPagerMap = ReadonlyMap<string, readonly ChildPagerInfo[]>

/** No pagers; used when child paging is off. */
export const EMPTY_CHILD_PAGERS: ChildPagerMap = new Map<
  string,
  readonly ChildPagerInfo[]
>()

export interface PageChildRowsOptions<RecordType extends object> {
  rows: readonly RecordType[]
  pageSize: number
  rowKey: TableRowKey<RecordType>
  childrenColumnName: string
  expandedRowKeys: readonly Key[]
  /** Current page per parent key; missing parents are on page 1. */
  pages: Readonly<Record<string, number>>
  /** Active column sort, applied to children before they are sliced. */
  compare?: CompareFn<RecordType> | undefined
}

export interface PagedRows<RecordType> {
  rows: RecordType[]
  pagers: ChildPagerMap
}

/**
 * Slices the children of every row with more than `pageSize` children down
 * to the current page, and works out where each pager goes: after the last
 * row drawn for that group, which may be a deeper expanded descendant.
 * Input rows are never mutated.
 */
export function pageChildRows<RecordType extends object>({
  rows,
  pageSize,
  rowKey,
  childrenColumnName,
  expandedRowKeys,
  pages,
  compare,
}: PageChildRowsOptions<RecordType>): PagedRows<RecordType> {
  const pagers = new Map<string, ChildPagerInfo[]>()
  const expanded = new Set(expandedRowKeys.map(String))

  const isExpanded = (row: RecordType) => {
    const key = getRowKey(rowKey, row)
    return key !== undefined && expanded.has(String(key))
  }

  // The row the pager follows: the last row drawn for the group.
  const lastVisibleRow = (row: RecordType): RecordType => {
    const last = getChildRows(row, childrenColumnName)?.at(-1)
    return last && isExpanded(row) ? lastVisibleRow(last) : row
  }

  const addPager = (anchorRow: RecordType, pager: ChildPagerInfo) => {
    const anchor = getRowKey(rowKey, lastVisibleRow(anchorRow))
    if (anchor === undefined) return
    const list = pagers.get(String(anchor)) ?? []
    pagers.set(String(anchor), [...list, pager])
  }

  const pageRows = (
    level: readonly RecordType[],
    depth: number,
  ): RecordType[] =>
    level.map((row) => {
      const children = getChildRows(row, childrenColumnName)
      if (!children?.length) return row

      const parentKey = getRowKey(rowKey, row)
      const needsPaging = parentKey !== undefined && children.length > pageSize
      if (!needsPaging) {
        return {
          ...row,
          [childrenColumnName]: pageRows(children, depth + 1),
        }
      }

      const pageCount = Math.ceil(children.length / pageSize)
      const page = clamp(pages[String(parentKey)] ?? 1, 1, pageCount)
      const ordered = compare ? [...children].sort(compare) : children
      const shown = pageRows(
        ordered.slice((page - 1) * pageSize, page * pageSize),
        depth + 1,
      )
      const lastShown = shown.at(-1)
      if (lastShown) {
        addPager(lastShown, {
          parentKey,
          level: depth + 1,
          page,
          pageSize,
          total: children.length,
        })
      }
      return { ...row, [childrenColumnName]: shown }
    })

  return { rows: pageRows(rows, 0), pagers }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

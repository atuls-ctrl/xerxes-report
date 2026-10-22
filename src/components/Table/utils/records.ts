import type { Key } from 'react'
import type { TableRowKey } from '../types'

/** Reads `record[dataIndex]`, following array paths like `['a', 'b']`. */
export function getValueAtPath(record: object, dataIndex: unknown): unknown {
  let path: readonly (string | number)[]
  if (typeof dataIndex === 'string' || typeof dataIndex === 'number') {
    path = [dataIndex]
  } else if (Array.isArray(dataIndex)) {
    path = dataIndex as readonly (string | number)[]
  } else {
    return undefined
  }
  let current: unknown = record
  for (const segment of path) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[segment]
  }
  return current
}

/** The key Ant Design uses for `record`, or `undefined` when it has none. */
export function getRowKey<RecordType extends object>(
  rowKey: TableRowKey<RecordType>,
  record: RecordType,
): Key | undefined {
  if (typeof rowKey === 'function') return rowKey(record)
  const value = (record as Record<PropertyKey, unknown>)[rowKey ?? 'key']
  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined
}

/** Nested rows of a tree row, or `undefined` for a leaf. */
export function getChildRows<RecordType extends object>(
  record: RecordType,
  childrenColumnName: string,
): RecordType[] | undefined {
  const children = (record as Record<string, unknown>)[childrenColumnName]
  return Array.isArray(children) ? (children as RecordType[]) : undefined
}

/** Calls `visit` for every row of a tree, parents before their children. */
function walkRows<RecordType extends object>(
  rows: readonly RecordType[],
  childrenColumnName: string,
  visit: (record: RecordType) => void,
) {
  for (const record of rows) {
    visit(record)
    const children = getChildRows(record, childrenColumnName)
    if (children) walkRows(children, childrenColumnName, visit)
  }
}

/** Keys of every row in a tree; what `defaultExpandAllRows` expands. */
export function collectRowKeys<RecordType extends object>(
  rows: readonly RecordType[],
  rowKey: TableRowKey<RecordType>,
  childrenColumnName: string,
): Key[] {
  const keys: Key[] = []
  walkRows(rows, childrenColumnName, (record) => {
    const key = getRowKey(rowKey, record)
    if (key !== undefined) keys.push(key)
  })
  return keys
}

/**
 * Rows that match, at any depth. A matching row keeps all its children; a
 * row that does not match is kept (with only the matching children) when a
 * descendant matches, so search results stay inside their parents. Input
 * rows are never mutated.
 */
export function filterTreeRows<RecordType extends object>(
  rows: readonly RecordType[],
  matches: (record: RecordType) => boolean,
  childrenColumnName = 'children',
): RecordType[] {
  return rows.flatMap((record) => {
    if (matches(record)) return [record]
    const children = getChildRows(record, childrenColumnName)
    const kept = children
      ? filterTreeRows(children, matches, childrenColumnName)
      : []
    return kept.length > 0 ? [{ ...record, [childrenColumnName]: kept }] : []
  })
}

/** Rows (at any depth) whose key is in `keys`, in `keys` order. */
export function findRowsByKeys<RecordType extends object>(
  rows: readonly RecordType[],
  keys: readonly Key[],
  rowKey: TableRowKey<RecordType>,
  childrenColumnName: string,
): RecordType[] {
  const byKey = new Map<Key, RecordType>()
  walkRows(rows, childrenColumnName, (record) => {
    const key = getRowKey(rowKey, record)
    if (key !== undefined) byKey.set(key, record)
  })
  return keys.flatMap((key) => {
    const record = byKey.get(key)
    return record ? [record] : []
  })
}

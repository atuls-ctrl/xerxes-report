import { describe, expect, it } from 'vitest'
import { toArray } from './array'
import {
  collectRowKeys,
  filterTreeRows,
  findRowsByKeys,
  getRowKey,
  getValueAtPath,
} from './records'

interface TreeRow {
  key: string
  id: number
  nested?: { value: number }
  children?: TreeRow[]
}

const TREE: TreeRow[] = [
  {
    key: 'a',
    id: 1,
    children: [
      { key: 'a1', id: 11 },
      { key: 'a2', id: 12, children: [{ key: 'a2x', id: 121 }] },
    ],
  },
  { key: 'b', id: 2 },
]

describe('toArray', () => {
  it('wraps one value and copies a list', () => {
    const list = ['x', 'y'] as const
    expect(toArray('x')).toEqual(['x'])
    expect(toArray(list)).toEqual(['x', 'y'])
    expect(toArray(list)).not.toBe(list)
    expect(toArray(undefined)).toEqual([])
  })
})

describe('getValueAtPath', () => {
  it('reads a field or a path', () => {
    const record = { key: 'a', id: 1, nested: { value: 5 } }
    expect(getValueAtPath(record, 'id')).toBe(1)
    expect(getValueAtPath(record, ['nested', 'value'])).toBe(5)
  })

  it('returns undefined for missing paths and bad indexes', () => {
    expect(getValueAtPath({ key: 'a' }, ['nested', 'value'])).toBeUndefined()
    expect(getValueAtPath({ key: 'a' }, undefined)).toBeUndefined()
  })
})

describe('getRowKey', () => {
  it('reads `key` by default, a named field, or calls a function', () => {
    const row = { key: 'a', id: 1 }
    expect(getRowKey<TreeRow>(undefined, row)).toBe('a')
    expect(getRowKey<TreeRow>('id', row)).toBe(1)
    expect(
      getRowKey<TreeRow>((record: TreeRow) => `row-${record.key}`, row),
    ).toBe('row-a')
  })

  it('returns undefined when the field is not a key', () => {
    expect(
      getRowKey<TreeRow>('nested', { key: 'a', id: 1, nested: { value: 1 } }),
    ).toBeUndefined()
  })
})

describe('collectRowKeys', () => {
  it('lists every key in the tree, parents first', () => {
    expect(collectRowKeys(TREE, 'key', 'children')).toEqual([
      'a',
      'a1',
      'a2',
      'a2x',
      'b',
    ])
  })
})

describe('filterTreeRows', () => {
  const idIs = (id: number) => (row: TreeRow) => row.id === id

  it('keeps a matching row with all its children', () => {
    const rows = filterTreeRows(TREE, idIs(1))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toBe(TREE[0])
  })

  it('keeps the parents of a deep match, trimmed to the match', () => {
    const rows = filterTreeRows(TREE, idIs(121))
    expect(rows.map((row) => row.key)).toEqual(['a'])
    expect(rows[0]?.children?.map((row) => row.key)).toEqual(['a2'])
    expect(rows[0]?.children?.[0]?.children?.map((row) => row.key)).toEqual([
      'a2x',
    ])
    // The source tree is untouched.
    expect(TREE[0]?.children).toHaveLength(2)
  })

  it('returns nothing when no row matches', () => {
    expect(filterTreeRows(TREE, () => false)).toEqual([])
  })
})

describe('findRowsByKeys', () => {
  it('finds rows at any depth, in key order, skipping unknown keys', () => {
    const rows = findRowsByKeys(
      TREE,
      ['b', 'a2x', 'missing'],
      'key',
      'children',
    )
    expect(rows.map((row) => row.id)).toEqual([2, 121])
  })
})

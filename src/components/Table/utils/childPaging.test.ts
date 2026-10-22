import { describe, expect, it } from 'vitest'
import { pageChildRows } from './childPaging'

interface Node {
  key: string
  value: number
  children?: Node[]
}

const children = (parent: string, count: number): Node[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `${parent}-${String(index)}`,
    value: index,
  }))

const ROWS: Node[] = [
  { key: 'big', value: 0, children: children('big', 25) },
  { key: 'small', value: 0, children: children('small', 3) },
  { key: 'leaf', value: 0 },
]

const base = {
  rows: ROWS,
  pageSize: 10,
  rowKey: 'key' as const,
  childrenColumnName: 'children',
  expandedRowKeys: [],
  pages: {},
}

const childKeys = (row: Node | undefined) =>
  row?.children?.map((child) => child.key) ?? []

describe('pageChildRows', () => {
  it('shows the first page of large groups and leaves small ones whole', () => {
    const { rows, pagers } = pageChildRows(base)
    expect(childKeys(rows[0])).toHaveLength(10)
    expect(childKeys(rows[0])[0]).toBe('big-0')
    expect(childKeys(rows[1])).toHaveLength(3)
    expect(rows[2]).toBe(ROWS[2])
    // The pager follows the last child shown.
    expect(pagers.get('big-9')).toEqual([
      { parentKey: 'big', level: 1, page: 1, pageSize: 10, total: 25 },
    ])
    expect(pagers.size).toBe(1)
  })

  it('shows the requested page and clamps pages past the end', () => {
    const third = pageChildRows({ ...base, pages: { big: 3 } })
    expect(childKeys(third.rows[0])).toEqual([
      'big-20',
      'big-21',
      'big-22',
      'big-23',
      'big-24',
    ])
    const past = pageChildRows({ ...base, pages: { big: 99 } })
    expect(childKeys(past.rows[0])).toEqual(childKeys(third.rows[0]))
  })

  it('sorts children before slicing', () => {
    const { rows } = pageChildRows({
      ...base,
      compare: (a, b) => b.value - a.value,
    })
    expect(childKeys(rows[0])[0]).toBe('big-24')
  })

  it('anchors the pager after an expanded last child', () => {
    const nested: Node[] = [
      {
        key: 'p',
        value: 0,
        children: [
          ...children('p', 10),
          { key: 'p-last', value: 0, children: [{ key: 'deep', value: 0 }] },
        ],
      },
    ]
    const { pagers } = pageChildRows({
      ...base,
      rows: nested,
      pages: { p: 2 },
      expandedRowKeys: ['p', 'p-last'],
    })
    expect(pagers.get('deep')?.[0]?.parentKey).toBe('p')
  })

  it('never mutates the input rows', () => {
    const before = JSON.stringify(ROWS)
    pageChildRows({ ...base, pages: { big: 2 } })
    expect(JSON.stringify(ROWS)).toBe(before)
  })
})

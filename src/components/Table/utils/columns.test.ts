import { describe, expect, it } from 'vitest'
import styles from '../Table.module.scss'
import type { TableColumnsType } from '../types'
import {
  decorateColumns,
  getColumnId,
  getLeafColumns,
  prepareColumns,
  removeHiddenColumns,
} from './columns'

interface Row {
  name: string
  clicks: number
  installs: number
  total: number
}

const COLUMNS: TableColumnsType<Row> = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
  {
    key: 'traffic',
    title: 'Traffic',
    children: [
      { key: 'clicks', dataIndex: 'clicks', title: 'Clicks' },
      { key: 'installs', dataIndex: 'installs', title: 'Installs' },
    ],
  },
  { dataIndex: 'total', title: 'Total', highlight: true },
]

const classesOf = (className: string | undefined) =>
  (className ?? '').split(' ').filter(Boolean)

describe('getColumnId', () => {
  it('prefers the key and falls back to dataIndex', () => {
    expect(getColumnId('a', 'b')).toBe('a')
    expect(getColumnId(undefined, 'b')).toBe('b')
  })
})

describe('decorateColumns', () => {
  const decorated = decorateColumns(COLUMNS)

  it('marks groups and the columns after the first as section starts', () => {
    const [first, group, last] = decorated
    expect(classesOf(first.className)).not.toContain(styles.sectionStart)
    expect(classesOf(group.className)).toEqual(
      expect.arrayContaining([styles.groupHeader, styles.sectionStart]),
    )
    // The column after a group starts a new section too.
    expect(classesOf(last.className)).toContain(styles.sectionStart)
  })

  it('turns `highlight` into a class and drops the prop', () => {
    const last = decorated[2]
    expect(classesOf(last.className)).toContain(styles.highlight)
    expect(last).not.toHaveProperty('highlight')
  })

  it('marks only the first child of a section-start group', () => {
    const group = decorated[1]
    const children = 'children' in group ? group.children : []
    expect(classesOf(children[0]?.className)).toContain(styles.sectionStart)
    expect(classesOf(children[1]?.className)).not.toContain(styles.sectionStart)
  })
})

describe('removeHiddenColumns', () => {
  it('drops hidden leaves by key or dataIndex', () => {
    const shown = removeHiddenColumns(COLUMNS, new Set(['clicks', 'total']))
    expect(getLeafColumns(decorateColumns(shown)).map((c) => c.title)).toEqual([
      'Name',
      'Installs',
    ])
  })

  it('drops a group once all its children are hidden', () => {
    const shown = removeHiddenColumns(COLUMNS, new Set(['clicks', 'installs']))
    expect(shown.map((column) => column.title)).toEqual(['Name', 'Total'])
  })
})

describe('prepareColumns', () => {
  it('returns decorated columns and their visible leaves', () => {
    const { columns, leafColumns } = prepareColumns(COLUMNS, ['installs'])
    expect(columns).toHaveLength(3)
    expect(leafColumns.map((column) => column.title)).toEqual([
      'Name',
      'Clicks',
      'Total',
    ])
  })

  it('ignores unknown hidden keys', () => {
    const { leafColumns } = prepareColumns(COLUMNS, ['nope'])
    expect(leafColumns).toHaveLength(4)
  })
})

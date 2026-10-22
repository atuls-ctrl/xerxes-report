import { describe, expect, it } from 'vitest'
import { createInitialTableState, tableReducer } from './reducer'

describe('createInitialTableState', () => {
  it('starts comfortable and empty', () => {
    expect(createInitialTableState()).toEqual({
      density: 'comfortable',
      sort: null,
      groupBy: [],
      expandedRowKeys: [],
      selectedRowKeys: [],
      childPages: {},
    })
  })

  it('copies the starting lists instead of sharing them', () => {
    const groupBy = ['bundle']
    const state = createInitialTableState({ groupBy, density: 'compact' })
    expect(state.groupBy).toEqual(['bundle'])
    expect(state.groupBy).not.toBe(groupBy)
    expect(state.density).toBe('compact')
  })
})

describe('tableReducer', () => {
  const initial = createInitialTableState()

  it('sets the density', () => {
    const next = tableReducer(initial, {
      type: 'setDensity',
      density: 'compact',
    })
    expect(next.density).toBe('compact')
    expect(initial.density).toBe('comfortable')
  })

  it('records and clears the sort', () => {
    const sorted = tableReducer(initial, {
      type: 'setSort',
      sort: { columnId: 'clicks', order: 'descend' },
    })
    expect(sorted.sort).toEqual({ columnId: 'clicks', order: 'descend' })
    expect(tableReducer(sorted, { type: 'setSort', sort: null }).sort).toBe(
      null,
    )
  })

  it('replaces group by, expanded and selected keys', () => {
    let state = tableReducer(initial, {
      type: 'setGroupBy',
      groupBy: ['bundle', 'publisher'],
    })
    state = tableReducer(state, { type: 'setExpandedRowKeys', keys: ['a'] })
    state = tableReducer(state, {
      type: 'setSelectedRowKeys',
      keys: ['a', 2],
    })
    expect(state.groupBy).toEqual(['bundle', 'publisher'])
    expect(state.expandedRowKeys).toEqual(['a'])
    expect(state.selectedRowKeys).toEqual(['a', 2])
  })

  it('keeps one child page per parent', () => {
    let state = tableReducer(initial, {
      type: 'setChildPage',
      parentKey: 'a',
      page: 2,
    })
    state = tableReducer(state, { type: 'setChildPage', parentKey: 7, page: 3 })
    expect(state.childPages).toEqual({ a: 2, '7': 3 })
  })

  it('clamps child pages below 1 and rounds fractions down', () => {
    expect(
      tableReducer(initial, { type: 'setChildPage', parentKey: 'a', page: 0 })
        .childPages,
    ).toEqual({ a: 1 })
    expect(
      tableReducer(initial, {
        type: 'setChildPage',
        parentKey: 'a',
        page: 2.7,
      }).childPages,
    ).toEqual({ a: 2 })
  })

  it('ignores a non-finite child page', () => {
    const next = tableReducer(initial, {
      type: 'setChildPage',
      parentKey: 'a',
      page: Number.NaN,
    })
    expect(next).toBe(initial)
  })
})

import type { Key } from 'react'
import type { TableDensity } from '../types'
import type { TableAction, TableState } from './types'

/** Starting values; anything left out starts empty. */
export interface TableStateInit {
  density?: TableDensity | undefined
  groupBy?: readonly string[] | undefined
  expandedRowKeys?: readonly Key[] | undefined
  selectedRowKeys?: readonly Key[] | undefined
}

export function createInitialTableState(init: TableStateInit = {}): TableState {
  return {
    density: init.density ?? 'comfortable',
    sort: null,
    groupBy: [...(init.groupBy ?? [])],
    expandedRowKeys: [...(init.expandedRowKeys ?? [])],
    selectedRowKeys: [...(init.selectedRowKeys ?? [])],
    childPages: {},
  }
}

/**
 * Applies one change. Invalid input (a non-finite page) leaves the state
 * untouched instead of throwing, so a bad click never breaks the table.
 */
export function tableReducer(
  state: TableState,
  action: TableAction,
): TableState {
  switch (action.type) {
    case 'setDensity':
      return { ...state, density: action.density }
    case 'setSort':
      return { ...state, sort: action.sort }
    case 'setGroupBy':
      return { ...state, groupBy: action.groupBy }
    case 'setExpandedRowKeys':
      return { ...state, expandedRowKeys: action.keys }
    case 'setSelectedRowKeys':
      return { ...state, selectedRowKeys: action.keys }
    case 'setChildPage': {
      if (!Number.isFinite(action.page)) return state
      const page = Math.max(1, Math.floor(action.page))
      return {
        ...state,
        childPages: { ...state.childPages, [String(action.parentKey)]: page },
      }
    }
    default:
      return state
  }
}

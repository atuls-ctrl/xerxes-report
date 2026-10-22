import type {
  ExpandableConfig,
  TableRowSelection,
} from 'antd/es/table/interface'
import { useReducer, type Dispatch, type Key } from 'react'
import { createInitialTableState, tableReducer } from '../store/reducer'
import type { TableAction, TableActions, TableState } from '../store/types'
import type { TableDensity, TableGroupByProps, TableRowKey } from '../types'
import { toArray } from '../utils/array'
import { collectRowKeys, findRowsByKeys } from '../utils/records'

type SelectionChange<RecordType> = NonNullable<
  TableRowSelection<RecordType>['onChange']
>

export interface TableControllerOptions<RecordType extends object> {
  dataSource: readonly RecordType[] | undefined
  rowKey: TableRowKey<RecordType>
  childrenColumnName: string
  density: TableDensity | undefined
  defaultDensity: TableDensity
  onDensityChange: ((density: TableDensity) => void) | undefined
  groupBy: TableGroupByProps | undefined
  rowSelection: TableRowSelection<RecordType> | undefined
  expandable: ExpandableConfig<RecordType> | undefined
}

export interface TableController<RecordType> {
  /** What is on screen: the store merged with the controlled props. */
  state: TableState
  /** Public writes, shared through `useTableActions`. */
  actions: TableActions
  /** Raw dispatch, for updates that only mirror Ant Design (sorting). */
  dispatch: Dispatch<TableAction>
  /** Ant Design's selection callback, routed through the store. */
  onSelectionChange: SelectionChange<RecordType>
  /** Ant Design's expand callback, routed through the store. */
  onExpandedRowsChange: (keys: readonly Key[]) => void
}

function getInitialExpandedKeys<RecordType extends object>({
  expandable,
  dataSource,
  rowKey,
  childrenColumnName,
}: TableControllerOptions<RecordType>): readonly Key[] {
  if (expandable?.defaultExpandedRowKeys) {
    return expandable.defaultExpandedRowKeys
  }
  if (expandable?.defaultExpandAllRows && dataSource) {
    return collectRowKeys(dataSource, rowKey, childrenColumnName)
  }
  return []
}

function initTableState<RecordType extends object>(
  options: TableControllerOptions<RecordType>,
): TableState {
  return createInitialTableState({
    density: options.defaultDensity,
    groupBy: toArray(options.groupBy?.defaultValue),
    expandedRowKeys: getInitialExpandedKeys(options),
    selectedRowKeys: options.rowSelection?.defaultSelectedRowKeys,
  })
}

/**
 * Owns the state of one table. Every value works controlled (prop set) or
 * uncontrolled (kept in the store); either way the matching `on…Change`
 * prop is called, so the parent can follow along.
 */
export function useTableController<RecordType extends object>(
  options: TableControllerOptions<RecordType>,
): TableController<RecordType> {
  const {
    dataSource,
    rowKey,
    childrenColumnName,
    density,
    onDensityChange,
    groupBy,
    rowSelection,
    expandable,
  } = options
  const [stored, dispatch] = useReducer(tableReducer, options, initTableState)

  const groupByValue = groupBy?.value
  const state: TableState = {
    ...stored,
    density: density ?? stored.density,
    groupBy:
      groupByValue === undefined ? stored.groupBy : toArray(groupByValue),
    expandedRowKeys: expandable?.expandedRowKeys
      ? [...expandable.expandedRowKeys]
      : stored.expandedRowKeys,
    selectedRowKeys: rowSelection?.selectedRowKeys ?? stored.selectedRowKeys,
  }

  const onSelectionChange: SelectionChange<RecordType> = (keys, rows, info) => {
    if (rowSelection?.selectedRowKeys === undefined) {
      dispatch({ type: 'setSelectedRowKeys', keys })
    }
    rowSelection?.onChange?.(keys, rows, info)
  }

  const onExpandedRowsChange = (keys: readonly Key[]) => {
    if (expandable?.expandedRowKeys === undefined) {
      dispatch({ type: 'setExpandedRowKeys', keys: [...keys] })
    }
    expandable?.onExpandedRowsChange?.(keys)
  }

  const setDensity = (next: TableDensity) => {
    if (density === undefined) dispatch({ type: 'setDensity', density: next })
    onDensityChange?.(next)
  }

  const setSelectedRowKeys = (
    value: Parameters<TableActions['setSelectedRowKeys']>[0],
  ) => {
    const all = toArray(value)
    const keys = rowSelection?.type === 'radio' ? all.slice(0, 1) : all
    const rows = dataSource
      ? findRowsByKeys(dataSource, keys, rowKey, childrenColumnName)
      : []
    onSelectionChange(keys, rows, {
      type: keys.length === 0 ? 'none' : 'multiple',
    })
  }

  const actions: TableActions = {
    setDensity,
    toggleDensity: () => {
      setDensity(state.density === 'compact' ? 'comfortable' : 'compact')
    },
    setGroupBy: (value) => {
      const next = toArray(value)
      if (groupByValue === undefined) {
        dispatch({ type: 'setGroupBy', groupBy: next })
      }
      groupBy?.onChange?.(next)
    },
    setExpandedRowKeys: (keys) => {
      onExpandedRowsChange(toArray(keys))
    },
    setSelectedRowKeys,
    clearSelection: () => {
      setSelectedRowKeys([])
    },
    setChildPage: (parentKey, page) => {
      dispatch({ type: 'setChildPage', parentKey, page })
    },
  }

  return { state, actions, dispatch, onSelectionChange, onExpandedRowsChange }
}

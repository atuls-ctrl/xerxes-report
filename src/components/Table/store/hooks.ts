import { useContext } from 'react'
import { TableActionsContext, TableStateContext } from './context'
import type { TableActions, TableState } from './types'

/**
 * State of the table this component is rendered in, e.g. from `toolbar`
 * content or a cell `render`. Throws outside a `Table`.
 */
export function useTableState(): TableState {
  const state = useContext(TableStateContext)
  if (!state) {
    throw new Error('useTableState must be used inside a Table')
  }
  return state
}

/** Writes for the table this component is rendered in. Throws outside one. */
export function useTableActions(): TableActions {
  const actions = useContext(TableActionsContext)
  if (!actions) {
    throw new Error('useTableActions must be used inside a Table')
  }
  return actions
}

import type { ReactNode } from 'react'
import { TableActionsContext, TableStateContext } from './context'
import type { TableActions, TableState } from './types'

export interface TableStoreProviderProps {
  state: TableState
  actions: TableActions
  children: ReactNode
}

/**
 * Shares one table's state with everything rendered inside it. `Table`
 * renders this itself; each table has its own store, so nested tables never
 * share state.
 */
export function TableStoreProvider({
  state,
  actions,
  children,
}: TableStoreProviderProps) {
  return (
    <TableActionsContext.Provider value={actions}>
      <TableStateContext.Provider value={state}>
        {children}
      </TableStateContext.Provider>
    </TableActionsContext.Provider>
  )
}

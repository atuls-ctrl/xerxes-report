import { createContext } from 'react'
import type { TableActions, TableState } from './types'

// Split so write-only callers do not re-render when the state changes.

/** State of the nearest table. `null` means no table above the caller. */
export const TableStateContext = createContext<TableState | null>(null)

/** Writes for the nearest table. `null` means no table above the caller. */
export const TableActionsContext = createContext<TableActions | null>(null)

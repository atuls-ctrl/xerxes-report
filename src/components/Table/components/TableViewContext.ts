import {
  createContext,
  useContext,
  type ComponentType,
  type HTMLAttributes,
} from 'react'
import { DEFAULT_PAGE_SIZE_OPTIONS, TABLE_TEXT } from '../constants'
import { EMPTY_CHILD_PAGERS, type ChildPagerMap } from '../utils/childPaging'

/**
 * Per-render layout values for the components Ant Design renders for us
 * (`BodyRow`, `RowsPerPage`). Ant Design creates those itself and passes
 * only its own props, so these come through context. Derived from props and
 * the store on every render; not state.
 */
export interface TableViewContextValue {
  /** Child pagers per anchor row key. Empty when child paging is off. */
  childPagers: ChildPagerMap
  /** Columns a full-width row (the child pager) spans. */
  colSpan: number
  /** The consumer's `components.body.row`, or a plain `<tr>`. */
  Row: ComponentType<HTMLAttributes<HTMLTableRowElement>> | 'tr'
  pageSizeOptions: number[]
  rowsPerPageLabel: string
}

export const TableViewContext = createContext<TableViewContextValue>({
  childPagers: EMPTY_CHILD_PAGERS,
  colSpan: 1,
  Row: 'tr',
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  rowsPerPageLabel: TABLE_TEXT.rowsPerPage,
})

export const useTableView = () => useContext(TableViewContext)

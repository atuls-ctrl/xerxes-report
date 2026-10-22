import type { TableToolbarProps } from '../components/TableToolbar'
import type { TableColumnsControlProps, TableSearchProps } from '../types'

/** `true` when the toolbar has anything to show. */
export function hasToolbarContent(props: TableToolbarProps): boolean {
  return (
    props.groupBy !== undefined ||
    props.toolbar !== undefined ||
    props.extra !== undefined ||
    props.actions !== undefined ||
    props.search !== undefined ||
    props.columnsControl !== undefined ||
    props.showDensityToggle
  )
}

/** `search` prop to search-box props: `true` is the defaults, `false` none. */
export const resolveSearch = (
  search: boolean | TableSearchProps,
): TableSearchProps | undefined =>
  search === true ? {} : search === false ? undefined : search

/** `columnsControl` prop to button props: `true` is the defaults. */
export const resolveColumnsControl = (
  columnsControl: boolean | TableColumnsControlProps | undefined,
): TableColumnsControlProps | undefined =>
  columnsControl === true
    ? {}
    : columnsControl === false
      ? undefined
      : columnsControl

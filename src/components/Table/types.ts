import type { TableProps as AntTableProps } from 'antd'
import type { ColumnGroupType, ColumnType } from 'antd/es/table'
import type { GetRowKey } from 'antd/es/table/interface'
import type { Key, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import type { InputProps } from '../Input'

/**
 * One value or a list of them. Props typed with this accept either form, so
 * `activeRowKey="31023"` and `activeRowKey={['31023', '52011']}` both work.
 */
export type OneOrMany<T> = T | readonly T[]

export type TableDensity = 'comfortable' | 'compact'

interface TableColumnExtras {
  /** Tinted column, e.g. the funnel total next to event columns. */
  highlight?: boolean
}

export type TableColumnType<RecordType> = ColumnType<RecordType> &
  TableColumnExtras

export interface TableColumnGroupType<RecordType>
  extends Omit<ColumnGroupType<RecordType>, 'children'>, TableColumnExtras {
  children: TableColumnsType<RecordType>
}

/** Ant Design columns plus `highlight`. Groups render as the small caps row. */
export type TableColumnsType<RecordType> = (
  TableColumnGroupType<RecordType> | TableColumnType<RecordType>
)[]

export interface TableTotalRow<RecordType> {
  /** Values for each column. Rendered with the column's own `render`. */
  record: Partial<RecordType>
  /** First-column text. */
  label?: ReactNode
  /** Muted text after the label, e.g. "· 9 campaign rows". */
  caption?: ReactNode
}

export interface TableSearchProps extends Pick<
  InputProps,
  'value' | 'defaultValue' | 'placeholder' | 'onChange' | 'width' | 'disabled'
> {
  /** Fires with the new text on every change. */
  onSearch?: (value: string) => void
}

export interface TableGroupByOption {
  value: string
  label: ReactNode
}

export interface TableGroupByProps {
  /** Dimensions the rows can be grouped by. */
  options: TableGroupByOption[]
  /** Picked dimension(s), outermost first. */
  value?: OneOrMany<string>
  defaultValue?: OneOrMany<string>
  /** Always called with a list, even when one dimension is picked. */
  onChange?: (value: string[]) => void
  /** Text before the chips. */
  label?: ReactNode
  /** Trigger text when nothing is picked. */
  placeholder?: ReactNode
}

export interface TableColumnsControlProps {
  /** Hidden leaf column(s), by `key` (or `dataIndex` when there is no key). */
  hiddenKeys?: OneOrMany<string>
  /** Button text. */
  label?: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export interface TableFooterRange {
  start: number
  end: number
  total: number
}

/** `rowKey` as Ant Design accepts it: a field name or a function. */
export type TableRowKey<RecordType> =
  string | keyof RecordType | GetRowKey<RecordType> | undefined

export interface TableProps<RecordType extends object> extends Omit<
  AntTableProps<RecordType>,
  'columns' | 'size' | 'bordered' | 'title' | 'footer' | 'summary'
> {
  columns?: TableColumnsType<RecordType>
  /** Row height. `compact` fits more rows on screen. */
  density?: TableDensity
  defaultDensity?: TableDensity
  onDensityChange?: (density: TableDensity) => void
  /** Shows the Compact / Comfortable button in the toolbar. */
  showDensityToggle?: boolean
  /** Toolbar content on the left, e.g. a selection count. */
  toolbar?: ReactNode
  /** Toolbar content before the search, e.g. a switch. */
  extra?: ReactNode
  /** Toolbar content at the end, after the Columns button. */
  actions?: ReactNode
  /** Search box in the toolbar. `true` uses the defaults. */
  search?: boolean | TableSearchProps
  /**
   * "Group by" picker on the left of the toolbar. It only reports the
   * picked dimensions; build the grouped `dataSource` from them.
   */
  groupBy?: TableGroupByProps
  /** Columns button with the "8 of 136" count. `true` uses the defaults. */
  columnsControl?: boolean | TableColumnsControlProps
  /** Pinned row under the header with the totals. */
  totalRow?: TableTotalRow<RecordType>
  /** Fires on row click and on Enter / Space when a row is focused. */
  onRowClick?: (
    record: RecordType,
    index: number | undefined,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => void
  /**
   * Highlights one row (or several), e.g. the one whose details drawer is
   * open.
   */
  activeRowKey?: OneOrMany<Key> | undefined
  /** Row(s) whose children are loading. Their caret becomes a spinner. */
  loadingRowKeys?: OneOrMany<Key> | undefined
  /** Text shown when there are no rows. */
  emptyText?: ReactNode
  /** Noun used in the footer, e.g. "campaign rows". */
  rowNoun?: string
  /** Extra footer text after the range, e.g. "Click a row for details". */
  footerHint?: ReactNode
  /** Replaces the footer text. */
  footerText?: (range: TableFooterRange) => ReactNode
  /** Text before the page-size select. */
  rowsPerPageLabel?: string
  /**
   * Pages the children of an expanded row when there are more than this,
   * with a small pager under them. Children are sorted by the active column
   * sort before paging.
   */
  childPageSize?: number
}

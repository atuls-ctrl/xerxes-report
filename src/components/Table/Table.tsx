import {
  Pagination as AntPagination,
  Select as AntSelect,
  Table as AntTable,
  type TableProps as AntTableProps,
} from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  TablePaginationConfig,
} from 'antd/es/table'
import type { SorterResult, SortOrder } from 'antd/es/table/interface'
import {
  createContext,
  isValidElement,
  useContext,
  useState,
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type Key,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Icon } from '../icons'
import { Input, type InputProps } from '../Input'
import styles from './Table.module.scss'

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

export interface TableFooterRange {
  start: number
  end: number
  total: number
}

type AntProps<RecordType> = AntTableProps<RecordType>

export interface TableProps<RecordType extends object> extends Omit<
  AntProps<RecordType>,
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
  /** Toolbar content at the end, e.g. a Columns button. */
  actions?: ReactNode
  /** Search box in the toolbar. `true` uses the defaults. */
  search?: boolean | TableSearchProps
  /** Pinned row under the header with the totals. */
  totalRow?: TableTotalRow<RecordType>
  /** Fires on row click and on Enter / Space when a row is focused. */
  onRowClick?: (
    record: RecordType,
    index: number | undefined,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => void
  /** Highlights one row, e.g. the one whose details drawer is open. */
  activeRowKey?: Key
  /** Rows whose children are loading. Their caret becomes a spinner. */
  loadingRowKeys?: readonly Key[]
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

const DEFAULT_PAGE_SIZE = 25
const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]
const SELECTION_COLUMN_WIDTH = 40

const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(' ') || undefined

// Spreads `className` only when there is one (exactOptionalPropertyTypes).
const classNameProp = (className: string | undefined) =>
  className === undefined ? {} : { className }

const isGroup = <RecordType,>(
  column: TableColumnGroupType<RecordType> | TableColumnType<RecordType>,
): column is TableColumnGroupType<RecordType> =>
  'children' in column && Array.isArray(column.children)

// Adds the section dividers (after the first column and around every
// group), the small-caps group header style and the highlight tint.
function decorateColumns<RecordType>(
  columns: TableColumnsType<RecordType>,
  isTopLevel = true,
  startsSection = false,
): ColumnsType<RecordType> {
  return columns.map((column, index) => {
    const previous = index > 0 ? columns[index - 1] : undefined
    const isSectionStart = isTopLevel
      ? previous !== undefined &&
        (index === 1 || isGroup(column) || isGroup(previous))
      : startsSection && index === 0

    if (isGroup(column)) {
      const { children, highlight, className, ...rest } = column
      return {
        ...rest,
        ...classNameProp(
          cx(
            className,
            styles.groupHeader,
            isSectionStart && styles.sectionStart,
            highlight && styles.highlight,
          ),
        ),
        children: decorateColumns(children, false, isSectionStart),
      }
    }

    const { highlight, className, ...rest } = column
    return {
      ...rest,
      ...classNameProp(
        cx(
          className,
          isSectionStart && styles.sectionStart,
          highlight && styles.highlight,
        ),
      ),
    }
  })
}

function getLeafColumns<RecordType>(
  columns: ColumnsType<RecordType>,
): ColumnType<RecordType>[] {
  return columns.flatMap((column) =>
    'children' in column ? getLeafColumns(column.children) : [column],
  )
}

function getValue(record: object, dataIndex: unknown): unknown {
  let path: readonly (string | number)[]
  if (typeof dataIndex === 'string' || typeof dataIndex === 'number') {
    path = [dataIndex]
  } else if (Array.isArray(dataIndex)) {
    path = dataIndex as readonly (string | number)[]
  } else {
    return undefined
  }
  let current: unknown = record
  for (const segment of path) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[segment]
  }
  return current
}

function renderSummaryValue<RecordType>(
  column: ColumnType<RecordType>,
  record: Partial<RecordType>,
): ReactNode {
  const value = getValue(record, column.dataIndex)
  if (!column.render) return value as ReactNode
  const rendered = column.render(value, record as RecordType, -1)
  // `render` may return `{ children, props }` (a "rendered cell").
  if (
    rendered !== null &&
    typeof rendered === 'object' &&
    !isValidElement(rendered) &&
    'children' in rendered
  ) {
    return rendered.children
  }
  return rendered as ReactNode
}

function getRowKey<RecordType extends object>(
  rowKey: AntProps<RecordType>['rowKey'],
  record: RecordType,
): Key | undefined {
  if (typeof rowKey === 'function') return rowKey(record)
  const value = (record as Record<string, unknown>)[
    typeof rowKey === 'string' ? rowKey : 'key'
  ]
  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined
}

// ---- Child paging (pager under an expanded row) ----------------------------
type CompareFn<RecordType> = (a: RecordType, b: RecordType) => number

// Which column the user sorted by; `undefined` until they sort once.
interface SortState {
  columnId: string
  order: SortOrder
}

const getColumnId = (key: unknown, dataIndex: unknown) =>
  String(key ?? dataIndex)

// The comparator for the active sort, resolved the way Ant Design does:
// controlled `sortOrder` first, then the user's last sort, then
// `defaultSortOrder`.
function getActiveCompare<RecordType>(
  leaves: ColumnType<RecordType>[],
  sortState: SortState | undefined,
): CompareFn<RecordType> | undefined {
  let column: ColumnType<RecordType> | undefined
  let order: SortOrder | undefined
  if (leaves.some((leaf) => leaf.sortOrder !== undefined)) {
    column = leaves.find((leaf) => leaf.sortOrder)
    order = column?.sortOrder
  } else if (sortState) {
    column = leaves.find(
      (leaf) => getColumnId(leaf.key, leaf.dataIndex) === sortState.columnId,
    )
    order = sortState.order
  } else {
    column = leaves.find((leaf) => leaf.defaultSortOrder)
    order = column?.defaultSortOrder
  }
  const sorter = column?.sorter
  const compare =
    typeof sorter === 'function'
      ? sorter
      : typeof sorter === 'object'
        ? sorter.compare
        : undefined
  if (!compare || !order) return undefined
  const direction = order === 'ascend' ? 1 : -1
  return (a, b) => direction * compare(a, b, order)
}

interface ChildPagerInfo {
  parentKey: Key
  /** Depth of the paged children (1 = children of a top-level row). */
  level: number
  page: number
  pageSize: number
  total: number
}

interface ChildPagerContextValue {
  /** Pagers to draw after the row with this key, innermost first. */
  pagers: Map<string, ChildPagerInfo[]>
  colSpan: number
  onPageChange: (parentKey: Key, page: number) => void
  Row: ComponentType<HTMLAttributes<HTMLTableRowElement>> | 'tr'
}

const ChildPagerContext = createContext<ChildPagerContextValue | null>(null)

type BodyRowProps = HTMLAttributes<HTMLTableRowElement> & {
  'data-row-key'?: Key
}

type PagerCssVars = CSSProperties & Record<`--child-pager-${string}`, string>

// Ant Design's body row, plus the child pager(s) that close a paged group.
function BodyRow(props: BodyRowProps) {
  const context = useContext(ChildPagerContext)
  const Row = context?.Row ?? 'tr'
  const rowKey = props['data-row-key']
  const pagers =
    context && rowKey !== undefined ? context.pagers.get(String(rowKey)) : []
  if (!context || !pagers?.length) return <Row {...props} />
  return (
    <>
      <Row {...props} />
      {pagers.map((pager) => {
        const indent: PagerCssVars = {
          '--child-pager-level': String(pager.level),
        }
        return (
          <tr
            key={`pager-${String(pager.parentKey)}`}
            className={styles.childPagerRow}
          >
            <td colSpan={context.colSpan}>
              <div className={styles.childPager} style={indent}>
                <AntPagination
                  size="small"
                  current={pager.page}
                  pageSize={pager.pageSize}
                  total={pager.total}
                  showSizeChanger={false}
                  showTotal={(total, [start, end]) =>
                    `${String(start)}–${String(end)} of ${String(total)}`
                  }
                  itemRender={renderPagerItem}
                  onChange={(page) => {
                    context.onPageChange(pager.parentKey, page)
                  }}
                />
              </div>
            </td>
          </tr>
        )
      })}
    </>
  )
}

// ---- Selection checkbox ----------------------------------------------------
interface OriginCheckboxProps {
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  'aria-label'?: string
  onChange?: (event: CheckboxChangeEvent) => void
}

// Renders the project Checkbox with the state Ant Design computed for its
// own checkbox, so selection logic (select all, tree, shift-click) is kept.
function SelectionCheckbox({ origin }: { origin: ReactNode }) {
  if (!isValidElement<OriginCheckboxProps>(origin)) return origin
  const {
    checked = false,
    indeterminate = false,
    disabled = false,
    'aria-label': ariaLabel,
    onChange,
  } = origin.props

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      target: { checked: event.target.checked },
      nativeEvent: event.nativeEvent as globalThis.MouseEvent,
      stopPropagation: () => {
        event.stopPropagation()
      },
      preventDefault: () => {
        event.preventDefault()
      },
    })
  }

  return (
    // Keeps a checkbox click from also firing the row click.
    <span
      className={styles.selection}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
    </span>
  )
}

// ---- Footer page-size select -----------------------------------------------
interface PageSizeContextValue {
  options: number[]
  label: string
}

const PageSizeContext = createContext<PageSizeContextValue>({
  options: DEFAULT_PAGE_SIZES,
  label: 'Rows per page',
})

interface RowsPerPageProps {
  value: number
  onChange: (value: number) => void
  disabled: boolean
  className: string
}

// Ant Design's pagination renders this in place of its own size changer and
// passes the table's current page size plus the setter, so the Select stays
// in sync with the table. The options are not passed, so they come through
// context.
function RowsPerPage({
  value,
  onChange,
  disabled,
  className,
}: RowsPerPageProps) {
  const { options, label } = useContext(PageSizeContext)
  return (
    <AntSelect<number>
      className={`${styles.rowsPerPage} ${className}`}
      classNames={{
        prefix: styles.rowsPerPageLabel,
        content: styles.rowsPerPageValue,
        suffix: styles.rowsPerPageArrow,
        popup: {
          root: styles.rowsPerPagePopup,
          listItem: styles.rowsPerPageOption,
        },
      }}
      variant="borderless"
      value={value}
      disabled={disabled}
      options={options.map((option) => ({
        value: option,
        label: String(option),
      }))}
      onChange={onChange}
      prefix={label}
      // antd's own Select API uses `suffixIcon`; the deprecation comes from
      // the underlying rc-select types, which antd's Select does not forward.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      suffixIcon={
        <Icon name="down" width={14} height={14} aria-hidden="true" />
      }
      aria-label={label}
      menuItemSelectedIcon={
        <Icon name="check" width={14} height={14} aria-hidden="true" />
      }
      placement="bottomRight"
      popupMatchSelectWidth={false}
    />
  )
}

const renderPagerItem: NonNullable<TablePaginationConfig['itemRender']> = (
  _page,
  type,
  element,
) => {
  // Figma "Page gap": a quiet ellipsis (antd swaps in arrows on hover).
  if (type === 'jump-prev' || type === 'jump-next') {
    return <span className={styles.pagerGap}>…</span>
  }
  if (type !== 'prev' && type !== 'next') return element
  // The surrounding <li> is the focusable control; the button is visual.
  return (
    <button type="button" tabIndex={-1} className={styles.pagerArrow}>
      <Icon
        name={type === 'prev' ? 'left' : 'right'}
        width={15}
        height={15}
        aria-hidden="true"
      />
    </button>
  )
}

// ---- Table -----------------------------------------------------------------
export function Table<RecordType extends object>({
  columns = [],
  dataSource,
  density,
  defaultDensity = 'comfortable',
  onDensityChange,
  showDensityToggle = false,
  toolbar,
  extra,
  actions,
  search = false,
  totalRow,
  onRowClick,
  activeRowKey,
  loadingRowKeys,
  emptyText = 'No rows match these filters.',
  rowNoun = 'rows',
  footerHint,
  footerText,
  rowsPerPageLabel = 'Rows per page',
  childPageSize,
  rowKey = 'key',
  rowClassName,
  rowSelection,
  expandable,
  pagination,
  onRow,
  onChange,
  components,
  locale,
  scroll,
  sticky,
  className,
  rootClassName,
  style,
  ...rest
}: TableProps<RecordType>) {
  const [internalDensity, setInternalDensity] = useState(defaultDensity)
  const currentDensity = density ?? internalDensity
  const isCompact = currentDensity === 'compact'

  const toggleDensity = () => {
    const next: TableDensity = isCompact ? 'comfortable' : 'compact'
    if (density === undefined) setInternalDensity(next)
    onDensityChange?.(next)
  }

  const decoratedColumns = decorateColumns(columns)
  const leafColumns = getLeafColumns(decoratedColumns)
  const loadingKeys = new Set(loadingRowKeys)

  // ---- Child paging ----
  const isChildPaging = childPageSize !== undefined && childPageSize > 0
  const childrenColumnName = expandable?.childrenColumnName ?? 'children'
  const [sortState, setSortState] = useState<SortState>()
  const [childPages, setChildPages] = useState<Record<string, number>>({})
  // Expanded keys are tracked here (when child paging is on) so the pager
  // can follow the last visible row of a paged group.
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<
    readonly Key[]
  >(() => expandable?.defaultExpandedRowKeys ?? [])
  const expandedKeys = expandable?.expandedRowKeys ?? internalExpandedKeys
  const childPagers = new Map<string, ChildPagerInfo[]>()

  let pagedDataSource = dataSource
  if (isChildPaging && dataSource) {
    const compare = getActiveCompare(leafColumns, sortState)
    const expandedSet = new Set(expandedKeys.map(String))
    const getChildren = (row: RecordType) => {
      const children = (row as Record<string, unknown>)[childrenColumnName]
      return Array.isArray(children) ? (children as RecordType[]) : undefined
    }
    // The row the pager follows: the last row drawn for the group.
    const lastVisibleRow = (row: RecordType): RecordType => {
      const key = getRowKey(rowKey, row)
      const last = getChildren(row)?.at(-1)
      return last && key !== undefined && expandedSet.has(String(key))
        ? lastVisibleRow(last)
        : row
    }
    const pageRows = (rows: readonly RecordType[], level: number) =>
      rows.map((row): RecordType => {
        const children = getChildren(row)
        if (!children?.length) return row
        const parentKey = getRowKey(rowKey, row)
        let shown = children
        let pager: ChildPagerInfo | undefined
        if (parentKey !== undefined && children.length > childPageSize) {
          const pageCount = Math.ceil(children.length / childPageSize)
          const page = Math.min(childPages[String(parentKey)] ?? 1, pageCount)
          const ordered = compare ? [...children].sort(compare) : children
          shown = ordered.slice(
            (page - 1) * childPageSize,
            page * childPageSize,
          )
          pager = {
            parentKey,
            level: level + 1,
            page,
            pageSize: childPageSize,
            total: children.length,
          }
        }
        const pagedChildren = pageRows(shown, level + 1)
        const lastShown = pagedChildren.at(-1)
        if (pager && lastShown) {
          const anchor = getRowKey(rowKey, lastVisibleRow(lastShown))
          if (anchor !== undefined) {
            const list = childPagers.get(String(anchor)) ?? []
            childPagers.set(String(anchor), [...list, pager])
          }
        }
        return { ...row, [childrenColumnName]: pagedChildren }
      })
    pagedDataSource = pageRows(dataSource, 0)
  }

  // ---- Rows ----
  const getRowClassName: AntProps<RecordType>['rowClassName'] = (
    record,
    index,
    indent,
  ) => {
    const custom =
      typeof rowClassName === 'function'
        ? rowClassName(record, index, indent)
        : rowClassName
    const key = getRowKey(rowKey, record)
    return (
      cx(
        custom,
        onRowClick && styles.clickable,
        activeRowKey !== undefined && key === activeRowKey && styles.active,
      ) ?? ''
    )
  }

  const getRowProps: AntProps<RecordType>['onRow'] = (record, index) => {
    const props = onRow?.(record, index) ?? {}
    if (!onRowClick) return props
    return {
      ...props,
      tabIndex: props.tabIndex ?? 0,
      'aria-selected':
        activeRowKey === undefined
          ? undefined
          : getRowKey(rowKey, record) === activeRowKey,
      onClick: (event: MouseEvent<HTMLElement>) => {
        props.onClick?.(event)
        onRowClick(record, index, event)
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        props.onKeyDown?.(event)
        // Only the row itself; keys inside cells (checkbox, links) pass.
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onRowClick(record, index, event)
        }
      },
    }
  }

  // ---- Expand caret ----
  const mergedExpandable: AntProps<RecordType>['expandable'] = {
    indentSize: 20,
    expandIcon: ({ expanded, expandable: canExpand, record, onExpand }) => {
      if (!canExpand) {
        return <span className={styles.expandSpacer} aria-hidden="true" />
      }
      const key = getRowKey(rowKey, record)
      const isLoading = key !== undefined && loadingKeys.has(key)
      return (
        <button
          type="button"
          className={styles.expandButton}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse row' : 'Expand row'}
          aria-busy={isLoading || undefined}
          data-loading={isLoading || undefined}
          onClick={(event) => {
            event.stopPropagation()
            onExpand(record, event)
          }}
        >
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <Icon name="right" width={13} height={13} aria-hidden="true" />
          )}
        </button>
      )
    },
    ...expandable,
    ...(isChildPaging && {
      expandedRowKeys: expandedKeys,
      onExpandedRowsChange: (keys: readonly Key[]) => {
        setInternalExpandedKeys(keys)
        expandable?.onExpandedRowsChange?.(keys)
      },
    }),
  }

  // ---- Selection ----
  const mergedRowSelection: AntProps<RecordType>['rowSelection'] =
    rowSelection && {
      columnWidth: SELECTION_COLUMN_WIDTH,
      ...(rowSelection.type !== 'radio' && {
        renderCell: (_checked, _record, _index, origin) => (
          <SelectionCheckbox origin={origin} />
        ),
        ...(!rowSelection.selections && {
          columnTitle: (origin: ReactNode) => (
            <SelectionCheckbox origin={origin} />
          ),
        }),
      }),
      ...rowSelection,
    }

  // ---- Total row ----
  const leadingCells =
    (rowSelection ? 1 : 0) + (expandable?.expandedRowRender ? 1 : 0)

  const renderSummary = totalRow
    ? () => (
        <AntTable.Summary fixed="top">
          <AntTable.Summary.Row className={styles.totalRow}>
            {Array.from({ length: leadingCells }, (_, index) => (
              <AntTable.Summary.Cell
                key={`lead-${String(index)}`}
                index={index}
              />
            ))}
            {leafColumns.map((column, index) => (
              <AntTable.Summary.Cell
                key={String(column.key ?? index)}
                index={leadingCells + index}
                {...(column.align !== undefined && { align: column.align })}
                {...classNameProp(column.className)}
              >
                {index === 0 ? (
                  <span className={styles.totalLabel}>
                    {totalRow.label ?? 'Total'}
                    {totalRow.caption !== undefined && (
                      <span className={styles.totalCaption}>
                        {totalRow.caption}
                      </span>
                    )}
                  </span>
                ) : (
                  renderSummaryValue(column, totalRow.record)
                )}
              </AntTable.Summary.Cell>
            ))}
          </AntTable.Summary.Row>
        </AntTable.Summary>
      )
    : undefined

  // ---- Footer ----
  const renderFooterText = (total: number, [start, end]: [number, number]) => {
    const range = { start, end, total }
    if (footerText) return footerText(range)
    const text =
      total === 0
        ? `0 ${rowNoun}`
        : `${String(start)}–${String(end)} of ${String(total)} ${rowNoun}`
    return (
      <>
        {text}
        {footerHint !== undefined && <> · {footerHint}</>}
      </>
    )
  }

  const pageSizeOptions = (
    (pagination ? pagination.pageSizeOptions : undefined) ?? DEFAULT_PAGE_SIZES
  ).map(Number)

  const mergedPagination: false | TablePaginationConfig =
    pagination === false
      ? false
      : {
          defaultPageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          showTotal: renderFooterText,
          itemRender: renderPagerItem,
          components: { sizeChanger: RowsPerPage },
          ...pagination,
          pageSizeOptions,
          className: [styles.pagination, pagination?.className]
            .filter(Boolean)
            .join(' '),
        }

  const handleChange: AntProps<RecordType>['onChange'] = (
    paginationInfo,
    filters,
    sorter,
    extra,
  ) => {
    if (extra.action === 'sort') {
      const first: SorterResult<RecordType> | undefined = Array.isArray(sorter)
        ? sorter.at(0)
        : sorter
      setSortState(
        first
          ? {
              columnId: getColumnId(first.columnKey, first.field),
              order: first.order ?? null,
            }
          : undefined,
      )
    }
    onChange?.(paginationInfo, filters, sorter, extra)
  }

  const userBody = components?.body
  const userRow = typeof userBody === 'object' ? userBody.row : undefined
  const mergedComponents: AntProps<RecordType>['components'] = isChildPaging
    ? {
        ...components,
        body: {
          ...(typeof userBody === 'object' ? userBody : {}),
          row: BodyRow,
        },
      }
    : components

  const childPagerContext: ChildPagerContextValue = {
    pagers: childPagers,
    colSpan:
      leafColumns.filter((column) => !column.hidden).length + leadingCells,
    onPageChange: (parentKey, page) => {
      setChildPages((pages) => ({ ...pages, [String(parentKey)]: page }))
    },
    Row:
      (userRow as
        ComponentType<HTMLAttributes<HTMLTableRowElement>> | undefined) ?? 'tr',
  }

  // ---- Toolbar ----
  const searchProps = search === true ? {} : search || undefined
  const hasToolbar =
    toolbar !== undefined ||
    extra !== undefined ||
    actions !== undefined ||
    searchProps !== undefined ||
    showDensityToggle

  // The pinned total row needs a fixed header (sticky or scroll.y).
  const mergedSticky =
    sticky ?? (totalRow && scroll?.y === undefined ? true : undefined)

  return (
    <div
      className={cx(styles.root, rootClassName)}
      style={style}
      data-density={currentDensity}
    >
      {hasToolbar && (
        <div className={styles.toolbar}>
          {toolbar !== undefined && (
            <div className={styles.toolbarStart}>{toolbar}</div>
          )}
          <div className={styles.toolbarEnd}>
            {extra}
            {searchProps && (
              <Input
                type="search"
                size="md"
                width={searchProps.width ?? 194}
                placeholder={searchProps.placeholder ?? 'Search rows'}
                aria-label={searchProps.placeholder ?? 'Search rows'}
                leadingIcon={<Icon name="search" size={16} />}
                {...(searchProps.value !== undefined && {
                  value: searchProps.value,
                })}
                {...(searchProps.defaultValue !== undefined && {
                  defaultValue: searchProps.defaultValue,
                })}
                {...(searchProps.disabled !== undefined && {
                  disabled: searchProps.disabled,
                })}
                onChange={(event) => {
                  searchProps.onChange?.(event)
                  searchProps.onSearch?.(event.target.value)
                }}
              />
            )}
            {showDensityToggle && (
              <Button
                size="md"
                icon={<Icon name="menu" size={16} />}
                className={styles.densityToggle}
                data-active={isCompact || undefined}
                onClick={toggleDensity}
              >
                {isCompact ? 'Comfortable' : 'Compact'}
              </Button>
            )}
            {actions}
          </div>
        </div>
      )}
      <PageSizeContext.Provider
        value={{ options: pageSizeOptions, label: rowsPerPageLabel }}
      >
        <ChildPagerContext.Provider value={childPagerContext}>
          <AntTable<RecordType>
            {...rest}
            {...classNameProp(className)}
            {...(pagedDataSource !== undefined && {
              dataSource: pagedDataSource,
            })}
            {...(mergedComponents !== undefined && {
              components: mergedComponents,
            })}
            onChange={handleChange}
            {...(mergedRowSelection !== undefined && {
              rowSelection: mergedRowSelection,
            })}
            {...(renderSummary !== undefined && { summary: renderSummary })}
            {...(mergedSticky !== undefined && { sticky: mergedSticky })}
            rootClassName={styles.table}
            columns={decoratedColumns}
            rowKey={rowKey}
            rowClassName={getRowClassName}
            onRow={getRowProps}
            expandable={mergedExpandable}
            pagination={mergedPagination}
            scroll={{ x: 'max-content', ...scroll }}
            locale={{
              emptyText: <div className={styles.empty}>{emptyText}</div>,
              ...locale,
            }}
          />
        </ChildPagerContext.Provider>
      </PageSizeContext.Provider>
    </div>
  )
}

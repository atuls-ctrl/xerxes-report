import { Table as AntTable, type TableProps as AntTableProps } from 'antd'
import type { ReactNode } from 'react'
import { BodyRow } from './components/BodyRow'
import { ExpandIcon } from './components/ExpandIcon'
import { SelectionCheckbox } from './components/SelectionCheckbox'
import { TableToolbar, type TableToolbarProps } from './components/TableToolbar'
import {
  TableViewContext,
  type TableViewContextValue,
} from './components/TableViewContext'
import { TotalRow } from './components/TotalRow'
import {
  EXPAND_INDENT_SIZE,
  SELECTION_COLUMN_WIDTH,
  TABLE_TEXT,
} from './constants'
import { useTableController } from './hooks/useTableController'
import { TableStoreProvider } from './store/TableStoreProvider'
import styles from './Table.module.scss'
import type { TableProps } from './types'
import { toArray } from './utils/array'
import { EMPTY_CHILD_PAGERS, pageChildRows } from './utils/childPaging'
import { classNameProp, cx } from './utils/classNames'
import { prepareColumns } from './utils/columns'
import { buildPagination, getPageSizeOptions } from './utils/pagination'
import { getRowKey } from './utils/records'
import { createRowClassName, createRowProps } from './utils/rows'
import { getActiveCompare, toSortState } from './utils/sorting'
import {
  hasToolbarContent,
  resolveColumnsControl,
  resolveSearch,
} from './utils/toolbar'

type AntProps<RecordType> = AntTableProps<RecordType>

/**
 * Report table: Ant Design's Table with the Figma toolbar, total row,
 * footer, density, child paging and project checkboxes. Shared UI state
 * lives in a per-table store (see `./store`), so content rendered inside the
 * table can read and change it with `useTableState` / `useTableActions`.
 */
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
  groupBy,
  columnsControl,
  totalRow,
  onRowClick,
  activeRowKey,
  loadingRowKeys,
  emptyText = TABLE_TEXT.empty,
  rowNoun = TABLE_TEXT.rowNoun,
  footerHint,
  footerText,
  rowsPerPageLabel = TABLE_TEXT.rowsPerPage,
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
  const childrenColumnName = expandable?.childrenColumnName ?? 'children'
  const store = useTableController({
    dataSource,
    rowKey,
    childrenColumnName,
    density,
    defaultDensity,
    onDensityChange,
    groupBy,
    rowSelection,
    expandable,
  })
  const { state } = store

  // ---- Columns ----
  const columnsProps = resolveColumnsControl(columnsControl)
  const { columns: tableColumns, leafColumns } = prepareColumns(
    columns,
    toArray(columnsProps?.hiddenKeys),
  )

  // ---- Child paging ----
  const isChildPaging = childPageSize !== undefined && childPageSize > 0
  const paged =
    isChildPaging && dataSource
      ? pageChildRows({
          rows: dataSource,
          pageSize: childPageSize,
          rowKey,
          childrenColumnName,
          expandedRowKeys: state.expandedRowKeys,
          pages: state.childPages,
          compare: getActiveCompare(leafColumns, state.sort),
        })
      : undefined

  // ---- Rows ----
  const rowOptions = {
    rowKey,
    activeKeys: new Set(toArray(activeRowKey)),
    onRowClick,
  }
  const loadingKeys = new Set(toArray(loadingRowKeys))

  // ---- Expand caret ----
  const mergedExpandable: AntProps<RecordType>['expandable'] = {
    indentSize: EXPAND_INDENT_SIZE,
    expandIcon: ({ expanded, expandable: canExpand, record, onExpand }) => {
      const key = getRowKey(rowKey, record)
      return (
        <ExpandIcon
          expanded={expanded}
          expandable={canExpand}
          loading={key !== undefined && loadingKeys.has(key)}
          onToggle={(event) => {
            onExpand(record, event)
          }}
        />
      )
    },
    ...expandable,
    // Always driven by the store so the child pager can follow the last
    // visible row of a paged group, and so `setExpandedRowKeys` works.
    expandedRowKeys: state.expandedRowKeys,
    onExpandedRowsChange: store.onExpandedRowsChange,
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
      selectedRowKeys: state.selectedRowKeys,
      onChange: store.onSelectionChange,
    }

  // ---- Total row ----
  const leadingCellCount =
    (rowSelection ? 1 : 0) + (expandable?.expandedRowRender ? 1 : 0)
  // `Summary fixed="top"` must be the direct return value to be pinned.
  const renderSummary = totalRow
    ? () => (
        <AntTable.Summary fixed="top">
          <TotalRow
            totalRow={totalRow}
            leafColumns={leafColumns}
            leadingCellCount={leadingCellCount}
          />
        </AntTable.Summary>
      )
    : undefined

  // ---- Sorting ----
  const handleChange: AntProps<RecordType>['onChange'] = (
    paginationInfo,
    filters,
    sorter,
    changeInfo,
  ) => {
    if (changeInfo.action === 'sort') {
      store.dispatch({ type: 'setSort', sort: toSortState(sorter) })
    }
    onChange?.(paginationInfo, filters, sorter, changeInfo)
  }

  // ---- Components rendered by Ant Design ----
  const userBody = typeof components?.body === 'object' ? components.body : {}
  const mergedComponents: AntProps<RecordType>['components'] = isChildPaging
    ? { ...components, body: { ...userBody, row: BodyRow } }
    : components

  const view: TableViewContextValue = {
    childPagers: paged?.pagers ?? EMPTY_CHILD_PAGERS,
    colSpan:
      leafColumns.filter((column) => !column.hidden).length + leadingCellCount,
    Row: (userBody.row as TableViewContextValue['Row'] | undefined) ?? 'tr',
    pageSizeOptions: getPageSizeOptions(pagination),
    rowsPerPageLabel,
  }

  // ---- Toolbar ----
  const toolbarProps: TableToolbarProps = {
    groupBy,
    toolbar,
    extra,
    actions,
    search: resolveSearch(search),
    columnsControl: columnsProps,
    showDensityToggle,
  }

  const rows = paged?.rows ?? dataSource
  // The pinned total row needs a fixed header (sticky or scroll.y).
  const mergedSticky =
    sticky ?? (totalRow && scroll?.y === undefined ? true : undefined)

  return (
    <TableStoreProvider state={state} actions={store.actions}>
      <TableViewContext.Provider value={view}>
        <div
          className={cx(styles.root, rootClassName)}
          style={style}
          data-density={state.density}
        >
          {hasToolbarContent(toolbarProps) && (
            <TableToolbar {...toolbarProps} />
          )}
          <AntTable<RecordType>
            {...rest}
            {...classNameProp(className)}
            {...(rows !== undefined && { dataSource: rows })}
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
            columns={tableColumns}
            rowKey={rowKey}
            rowClassName={createRowClassName(rowClassName, rowOptions)}
            onRow={createRowProps(onRow, rowOptions)}
            expandable={mergedExpandable}
            pagination={buildPagination(pagination, {
              rowNoun,
              footerHint,
              footerText,
            })}
            scroll={{ x: 'max-content', ...scroll }}
            locale={{
              emptyText: <div className={styles.empty}>{emptyText}</div>,
              ...locale,
            }}
          />
        </div>
      </TableViewContext.Provider>
    </TableStoreProvider>
  )
}

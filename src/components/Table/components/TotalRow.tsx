import { Table as AntTable } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { TABLE_TEXT } from '../constants'
import styles from '../Table.module.scss'
import type { TableTotalRow } from '../types'
import { classNameProp } from '../utils/classNames'
import { renderSummaryValue } from '../utils/summary'

export interface TotalRowProps<RecordType> {
  totalRow: TableTotalRow<RecordType>
  leafColumns: readonly ColumnType<RecordType>[]
  /** Empty cells first, for the selection and expand columns. */
  leadingCellCount: number
}

/**
 * The pinned totals row. Render it inside `<AntTable.Summary fixed="top">`
 * returned straight from `summary`: Ant Design only pins the summary when
 * that element is the direct return value.
 */
export function TotalRow<RecordType>({
  totalRow,
  leafColumns,
  leadingCellCount,
}: TotalRowProps<RecordType>) {
  return (
    <AntTable.Summary.Row className={styles.totalRow}>
      {Array.from({ length: leadingCellCount }, (_, index) => (
        <AntTable.Summary.Cell key={`lead-${String(index)}`} index={index} />
      ))}
      {leafColumns.map((column, index) => (
        <AntTable.Summary.Cell
          key={String(column.key ?? index)}
          index={leadingCellCount + index}
          {...(column.align !== undefined && { align: column.align })}
          {...classNameProp(column.className)}
        >
          {index === 0 ? (
            <span className={styles.totalLabel}>
              {totalRow.label ?? TABLE_TEXT.total}
              {totalRow.caption !== undefined && (
                <span className={styles.totalCaption}>{totalRow.caption}</span>
              )}
            </span>
          ) : (
            renderSummaryValue(column, totalRow.record)
          )}
        </AntTable.Summary.Cell>
      ))}
    </AntTable.Summary.Row>
  )
}

import type { ReactNode } from 'react'
import { Button } from '../../Button'
import { Icon } from '../../icons'
import { TABLE_TEXT } from '../constants'
import { useTableActions, useTableState } from '../store/hooks'
import styles from '../Table.module.scss'
import type {
  TableColumnsControlProps,
  TableGroupByProps,
  TableSearchProps,
} from '../types'
import { GroupByControl } from './GroupByControl'
import { TableSearch } from './TableSearch'

export interface TableToolbarProps {
  groupBy: TableGroupByProps | undefined
  toolbar: ReactNode
  extra: ReactNode
  actions: ReactNode
  search: TableSearchProps | undefined
  columnsControl: TableColumnsControlProps | undefined
  showDensityToggle: boolean
}

/**
 * Row above the table. Start: Group by, then `toolbar`. End: `extra`,
 * search, density, Columns, then `actions`.
 */
export function TableToolbar({
  groupBy,
  toolbar,
  extra,
  actions,
  search,
  columnsControl,
  showDensityToggle,
}: TableToolbarProps) {
  const hasStart = groupBy !== undefined || toolbar !== undefined
  return (
    <div className={styles.toolbar}>
      {hasStart && (
        <div className={styles.toolbarStart}>
          {groupBy && <GroupByControl {...groupBy} />}
          {toolbar}
        </div>
      )}
      <div className={styles.toolbarEnd}>
        {extra}
        {search && <TableSearch {...search} />}
        {showDensityToggle && <DensityToggle />}
        {columnsControl && <ColumnsButton {...columnsControl} />}
        {actions}
      </div>
    </div>
  )
}

/** Switches between comfortable and compact rows. */
function DensityToggle() {
  const { density } = useTableState()
  const { toggleDensity } = useTableActions()
  const isCompact = density === 'compact'
  return (
    <Button
      size="md"
      icon={<Icon name="menu" size={16} />}
      className={styles.densityToggle}
      data-active={isCompact || undefined}
      onClick={toggleDensity}
    >
      {isCompact ? 'Comfortable' : 'Compact'}
    </Button>
  )
}

/** Opens the parent's column picker; the table only reports the click. */
function ColumnsButton({ label, onClick }: TableColumnsControlProps) {
  return (
    <Button
      size="md"
      icon={<Icon name="cols" size={16} />}
      {...(onClick !== undefined && { onClick })}
    >
      {label ?? TABLE_TEXT.columns}
    </Button>
  )
}

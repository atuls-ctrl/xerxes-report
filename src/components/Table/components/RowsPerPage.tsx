import { Select as AntSelect } from 'antd'
import { Icon } from '../../icons'
import styles from '../Table.module.scss'
import { useTableView } from './TableViewContext'

interface RowsPerPageProps {
  value: number
  onChange: (value: number) => void
  disabled: boolean
  className: string
}

/**
 * Footer page-size select. Ant Design's pagination renders this in place of
 * its own size changer and passes the current page size plus the setter, so
 * the Select stays in sync with the table. The options are not passed, so
 * they come through context.
 */
export function RowsPerPage({
  value,
  onChange,
  disabled,
  className,
}: RowsPerPageProps) {
  const { pageSizeOptions, rowsPerPageLabel } = useTableView()
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
      options={pageSizeOptions.map((option) => ({
        value: option,
        label: String(option),
      }))}
      onChange={onChange}
      prefix={rowsPerPageLabel}
      // antd's own Select API uses `suffixIcon`; the deprecation comes from
      // the underlying rc-select types, which antd's Select does not forward.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      suffixIcon={
        <Icon name="down" width={14} height={14} aria-hidden="true" />
      }
      aria-label={rowsPerPageLabel}
      menuItemSelectedIcon={
        <Icon name="check" width={14} height={14} aria-hidden="true" />
      }
      placement="bottomRight"
      popupMatchSelectWidth={false}
    />
  )
}

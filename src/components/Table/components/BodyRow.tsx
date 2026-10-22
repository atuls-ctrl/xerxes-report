import { Pagination as AntPagination } from 'antd'
import type { CSSProperties, HTMLAttributes, Key } from 'react'
import { useTableActions } from '../store/hooks'
import styles from '../Table.module.scss'
import type { ChildPagerInfo } from '../utils/childPaging'
import { formatRange, renderPagerItem } from '../utils/pagerItem'
import { useTableView } from './TableViewContext'

type BodyRowProps = HTMLAttributes<HTMLTableRowElement> & {
  'data-row-key'?: Key
}

type PagerCssVars = CSSProperties & Record<`--child-pager-${string}`, string>

/**
 * Ant Design's body row, plus the child pager(s) that close a paged group.
 * Only used when `childPageSize` is set.
 */
export function BodyRow(props: BodyRowProps) {
  const { childPagers, Row } = useTableView()
  const rowKey = props['data-row-key']
  const pagers =
    rowKey === undefined ? undefined : childPagers.get(String(rowKey))
  if (!pagers?.length) return <Row {...props} />
  return (
    <>
      <Row {...props} />
      {pagers.map((pager) => (
        <ChildPagerRow key={`pager-${String(pager.parentKey)}`} pager={pager} />
      ))}
    </>
  )
}

function ChildPagerRow({ pager }: { pager: ChildPagerInfo }) {
  const { colSpan } = useTableView()
  const { setChildPage } = useTableActions()
  const indent: PagerCssVars = { '--child-pager-level': String(pager.level) }
  return (
    <tr className={styles.childPagerRow}>
      <td colSpan={colSpan}>
        <div className={styles.childPager} style={indent}>
          <AntPagination
            size="small"
            current={pager.page}
            pageSize={pager.pageSize}
            total={pager.total}
            showSizeChanger={false}
            showTotal={formatRange}
            itemRender={renderPagerItem}
            onChange={(page) => {
              setChildPage(pager.parentKey, page)
            }}
          />
        </div>
      </td>
    </tr>
  )
}

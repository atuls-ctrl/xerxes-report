import type { TablePaginationConfig } from 'antd/es/table'
import type { ReactNode } from 'react'
import { RowsPerPage } from '../components/RowsPerPage'
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../constants'
import styles from '../Table.module.scss'
import type { TableProps } from '../types'
import { cx } from './classNames'
import { renderPagerItem } from './pagerItem'

type PaginationProp = TableProps<object>['pagination']

interface FooterTextOptions {
  rowNoun: string
  footerHint: ReactNode
  footerText: TableProps<object>['footerText']
}

/** Footer text, e.g. "1–25 of 120 campaign rows · Click a row for details". */
export function createFooterText({
  rowNoun,
  footerHint,
  footerText,
}: FooterTextOptions) {
  return (total: number, [start, end]: [number, number]): ReactNode => {
    if (footerText) return footerText({ start, end, total })
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
}

/** Page sizes for the "Rows per page" select, as numbers. */
export function getPageSizeOptions(pagination: PaginationProp): number[] {
  const options = pagination ? pagination.pageSizeOptions : undefined
  return (options ?? DEFAULT_PAGE_SIZE_OPTIONS).map(Number)
}

/**
 * Ant Design pagination with the Figma footer: range text, pager items and
 * the "Rows per page" select. The consumer's config wins, except for the
 * normalized page sizes and the merged class name.
 */
export function buildPagination(
  pagination: PaginationProp,
  footer: FooterTextOptions,
): false | TablePaginationConfig {
  if (pagination === false) return false
  return {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    showSizeChanger: true,
    showTotal: createFooterText(footer),
    itemRender: renderPagerItem,
    components: { sizeChanger: RowsPerPage },
    ...pagination,
    pageSizeOptions: getPageSizeOptions(pagination),
    className: cx(styles.pagination, pagination?.className) ?? '',
  }
}

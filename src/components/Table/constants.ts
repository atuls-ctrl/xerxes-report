export const DEFAULT_PAGE_SIZE = 25
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

/** Width of the checkbox column, in px. */
export const SELECTION_COLUMN_WIDTH = 40
/** Indent per nesting level of tree rows, in px. */
export const EXPAND_INDENT_SIZE = 20
/** Figma toolbar search width, in px. */
export const DEFAULT_SEARCH_WIDTH = 194

/** Default copy. Each entry can be replaced through a prop. */
export const TABLE_TEXT = {
  empty: 'No rows match these filters.',
  rowNoun: 'rows',
  rowsPerPage: 'Rows per page',
  search: 'Search rows',
  total: 'Total',
  columns: 'Columns',
  groupBy: 'Group by',
  groupByTitle: 'Group rows by',
  groupByPlaceholder: 'None',
  groupByReset: 'Reset',
} as const

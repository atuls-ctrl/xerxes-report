import type { IconKey } from '../icons'

/**
 * One row in a nav section. A row is either a link (`to`) or a group of links
 * (`children`), never both.
 */
export interface SidebarNavItem {
  /** Stable and unique across all sections. Used as the React key and DOM id. */
  id: string
  label: string
  /** Top-level rows only. Nested rows render without an icon. */
  icon?: IconKey
  /** Route path. Omit on a group that only expands. */
  to?: string
  /** Nested links. Setting this makes the row a group. */
  children?: SidebarNavItem[]
}

/** Labeled block in the scrollable nav (Reports, Saved reports, Admin). */
export interface SidebarSection {
  /** Stable and unique across sections. */
  id: string
  /** Section heading, rendered uppercase by CSS. */
  label: string
  items: SidebarNavItem[]
  /** Shown under the label when `items` is empty. Hidden when collapsed. */
  emptyLabel?: string
}

/** Health of a connected data source; drives the status dot color. */
export type DataSourceStatus = 'live' | 'attention'

/** Footer row for one connected data source. */
export interface SidebarDataSource {
  id: string
  name: string
  status: DataSourceStatus
  /** Display-ready text, e.g. "4 min ago" or "CSV · 1 Sep". Not formatted here. */
  detail: string
}

/** Props for `Sidebar`. */
export interface SidebarProps {
  /** Product name beside the logo. */
  productName?: string
  /** Second line under the product name, e.g. "Demand view". */
  workspace?: string
  sections: SidebarSection[]
  /** Pinned footer. Missing or empty hides the footer. */
  dataSources?: SidebarDataSource[]
  /** Controlled collapsed state. Omit to let the sidebar manage it. */
  collapsed?: boolean
  /** Initial state when uncontrolled. */
  defaultCollapsed?: boolean
  /** Fires with the next state when the user toggles the rail. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Accessible name of the toggle while expanded. */
  collapseLabel?: string
  /** Accessible name of the toggle while collapsed. */
  expandLabel?: string
  className?: string
}

/** Narrows a nav item to a group, i.e. a row that only expands. */
export function isNavGroup(
  item: SidebarNavItem,
): item is SidebarNavItem & { children: SidebarNavItem[] } {
  return item.children !== undefined && item.children.length > 0
}

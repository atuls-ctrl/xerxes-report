import { useId, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../Button'
import { Icon } from '../icons'
import styles from './Sidebar.module.scss'
import {
  isNavGroup,
  type DataSourceStatus,
  type SidebarNavItem,
  type SidebarProps,
  type SidebarSection,
} from './types'

const DEFAULT_COLLAPSE_LABEL = 'Collapse sidebar'
const DEFAULT_EXPAND_LABEL = 'Expand sidebar'
const DEFAULT_PRODUCT_NAME = 'Xerxes Reports'

/** Spoken status so the footer dots are not color-only. */
const SOURCE_STATUS_LABEL: Record<DataSourceStatus, string> = {
  live: 'live',
  attention: 'needs attention',
}

/** True when `pathname` is this item's route. */
function isCurrentPath(pathname: string, to: string | undefined): boolean {
  return to !== undefined && pathname === to
}

/** True when a descendant link is the current page. */
function containsCurrentPath(item: SidebarNavItem, pathname: string): boolean {
  return (item.children ?? []).some(
    (child) =>
      isCurrentPath(pathname, child.to) || containsCurrentPath(child, pathname),
  )
}

/** Groups that contain the current route start open so nested links are visible. */
function openGroupsForPath(
  sections: SidebarSection[],
  pathname: string,
): Record<string, boolean> {
  const open: Record<string, boolean> = {}
  for (const section of sections) {
    for (const item of section.items) {
      if (isNavGroup(item) && containsCurrentPath(item, pathname)) {
        open[item.id] = true
      }
    }
  }
  return open
}

/** Persistent left navigation. Expanded shows labels; collapsed is icon-only. */
export function Sidebar({
  productName = DEFAULT_PRODUCT_NAME,
  workspace,
  sections,
  dataSources,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapseLabel = DEFAULT_COLLAPSE_LABEL,
  expandLabel = DEFAULT_EXPAND_LABEL,
  className,
}: SidebarProps) {
  const reactId = useId()
  const navId = `${reactId}-nav`
  const { pathname } = useLocation()

  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [openGroups, setOpenGroups] = useState(() =>
    openGroupsForPath(sections, pathname),
  )

  // Parent owns the rail when `collapsed` is passed (AppLayout needs the width).
  const isControlled = collapsed !== undefined
  const isCollapsed = isControlled ? collapsed : internalCollapsed

  const setCollapsed = (next: boolean) => {
    if (!isControlled) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const handleGroupClick = (id: string) => {
    // A group in the icon rail cannot show children; expand first, then open it.
    if (isCollapsed) {
      setCollapsed(false)
      setOpenGroups((prev) => ({ ...prev, [id]: true }))
      return
    }
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const hasSources = dataSources !== undefined && dataSources.length > 0
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    <aside
      className={classes}
      aria-label="Sidebar"
      data-collapsed={isCollapsed || undefined}
    >
      <div className={styles.brand}>
        <span
          className={styles.mark}
          aria-hidden={isCollapsed ? undefined : true}
          aria-label={isCollapsed ? productName : undefined}
        >
          <Icon name="barchart" size={24} aria-hidden />
        </span>
        <div className={styles.brandText}>
          <p className={styles.productName}>{productName}</p>
          {workspace !== undefined && workspace !== '' && (
            <p className={styles.workspace}>{workspace}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="lg"
          icon={<Icon name="panel" />}
          aria-expanded={!isCollapsed}
          aria-controls={navId}
          aria-label={isCollapsed ? expandLabel : collapseLabel}
          onClick={() => setCollapsed(!isCollapsed)}
        />
      </div>

      <nav id={navId} className={styles.nav} aria-label="Primary">
        {sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 className={styles.sectionLabel}>{section.label}</h2>
            {section.items.length === 0 ? (
              section.emptyLabel !== undefined && (
                <p className={styles.empty}>{section.emptyLabel}</p>
              )
            ) : (
              <ul className={styles.list}>
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    isOpen={openGroups[item.id] ?? false}
                    childrenId={`${reactId}-${item.id}-children`}
                    onGroupClick={handleGroupClick}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </nav>

      {hasSources && (
        <section className={styles.sources}>
          <h2 className={styles.sectionLabel}>Data sources</h2>
          <ul className={styles.sourceList}>
            {dataSources.map((source) => (
              <li key={source.id} className={styles.source}>
                <span
                  className={styles.dot}
                  data-status={source.status}
                  aria-hidden
                />
                <span className={styles.sourceName}>{source.name}</span>
                <span className={styles.srOnly}>
                  {SOURCE_STATUS_LABEL[source.status]}
                </span>
                <span className={styles.sourceDetail}>{source.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}

/** Props for one top-level nav row. */
interface SidebarItemProps {
  item: SidebarNavItem
  pathname: string
  isCollapsed: boolean
  isOpen: boolean
  childrenId: string
  onGroupClick: (id: string) => void
}

/** One top-level row: a page link, or a button that reveals nested links. */
function SidebarItem({
  item,
  pathname,
  isCollapsed,
  isOpen,
  childrenId,
  onGroupClick,
}: SidebarItemProps) {
  if (isNavGroup(item)) {
    const isActive = containsCurrentPath(item, pathname)
    return (
      <li>
        <button
          type="button"
          className={styles.item}
          data-active={isActive || undefined}
          aria-expanded={isOpen}
          aria-controls={childrenId}
          title={item.label}
          onClick={() => onGroupClick(item.id)}
        >
          <ItemContent item={item} />
        </button>
        {/* Nested links stay unmounted in the icon rail and while the group is closed. */}
        {!isCollapsed && isOpen && (
          <ul id={childrenId} className={styles.children}>
            {item.children.map((child) =>
              // A nested row without a route is configuration error; skip it.
              child.to === undefined ? null : (
                <li key={child.id}>
                  <NavLink
                    to={child.to}
                    end
                    className={`${styles.item} ${styles.child}`}
                    title={child.label}
                  >
                    <span className={styles.itemLabel}>{child.label}</span>
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        )}
      </li>
    )
  }

  // A top-level row that is neither a group nor a link has nothing to render.
  if (item.to === undefined) return null

  return (
    <li>
      <NavLink to={item.to} end className={styles.item} title={item.label}>
        <ItemContent item={item} />
      </NavLink>
    </li>
  )
}

/** Icon plus label shared by group buttons and leaf links. */
function ItemContent({ item }: { item: SidebarNavItem }) {
  return (
    <>
      {item.icon !== undefined && (
        <span className={styles.itemIcon} aria-hidden="true">
          <Icon name={item.icon} size={18} strokeWidth={1.75} />
        </span>
      )}
      <span className={styles.itemLabel}>{item.label}</span>
    </>
  )
}

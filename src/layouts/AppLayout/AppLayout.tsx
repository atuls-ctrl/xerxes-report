import { useState } from 'react'
import { Content } from '../../components/Content'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { DEFAULT_SIDEBAR_SECTIONS } from '../../components/Sidebar/sidebarNav'
import {
  comparePeriodLabel,
  perspectiveLabel,
  toDatePickerValue,
  useReportQuery,
  useReportQueryActions,
} from '../../state/reportQuery'
import styles from './AppLayout.module.scss'
import { DEFAULT_DATA_SOURCES } from './dataSources'

const SIDEBAR_COLLAPSED_KEY = 'xerxes.sidebar.collapsed'

/** Reads the last rail width. Missing or unreadable storage means expanded. */
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

/** Persists the rail so a reload keeps the user's last choice. */
function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  } catch {
    // Private mode or a full quota; the session still toggles in memory.
  }
}

/**
 * App chrome: sidebar, header, and the routed page.
 * Sole writer of the report query; Header and Sidebar only get props.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const query = useReportQuery()
  const actions = useReportQueryActions()

  // Falls back to the raw id if a saved source is no longer connected.
  const sourceLabel =
    DEFAULT_DATA_SOURCES.find((source) => source.id === query.sourceId)?.name ??
    query.sourceId

  const handleCollapsedChange = (next: boolean) => {
    setCollapsed(next)
    writeCollapsed(next)
  }

  return (
    <div className={styles.root}>
      <Sidebar
        sections={DEFAULT_SIDEBAR_SECTIONS}
        dataSources={DEFAULT_DATA_SOURCES}
        productName="Xerxes Reports"
        workspace={perspectiveLabel(query.perspective)}
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
      />
      <div className={styles.body}>
        <Header
          dateValue={toDatePickerValue(query)}
          compare={query.compare}
          compareLabel={comparePeriodLabel(query)}
          sourceLabel={sourceLabel}
          perspective={query.perspective}
          currency={query.currency}
          onDateChange={actions.setDate}
          onCompareChange={actions.setCompare}
          onPerspectiveChange={actions.setPerspective}
          onCurrencyChange={actions.setCurrency}
        />
        <Content />
      </div>
    </div>
  )
}

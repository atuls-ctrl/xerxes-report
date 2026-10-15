import { useState } from 'react'
import { Content } from '../../components/Content'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { DEFAULT_SIDEBAR_SECTIONS } from '../../components/Sidebar/sidebarNav'
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

/** App chrome: sidebar, header, and the routed page. */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

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
        workspace="Demand view"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
      />
      <div className={styles.body}>
        <Header />
        <Content />
      </div>
    </div>
  )
}

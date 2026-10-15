import type { SidebarDataSource } from '../../components/Sidebar'

/**
 * Placeholder footer rows matching the Figma sidebar. Swap this for an API
 * result in AppLayout; `Sidebar` already accepts any `SidebarDataSource[]`.
 */
export const DEFAULT_DATA_SOURCES: SidebarDataSource[] = [
  { id: 'trackier', name: 'Trackier', status: 'live', detail: '4 min ago' },
  { id: 'appsflyer', name: 'AppsFlyer', status: 'live', detail: '38 min ago' },
  { id: 'adjust', name: 'Adjust', status: 'live', detail: '1 h ago' },
  { id: 'branch', name: 'Branch', status: 'live', detail: '1 h ago' },
  { id: 'appmetrica', name: 'AppMetrica', status: 'live', detail: '2 h ago' },
  {
    id: 'mytracker',
    name: 'MyTracker',
    status: 'attention',
    detail: 'Re-auth needed',
  },
  { id: 'singular', name: 'Singular', status: 'live', detail: '45 min ago' },
  { id: 'kochava', name: 'Kochava', status: 'live', detail: '2 h ago' },
  { id: 'mfilter', name: 'mFilter', status: 'live', detail: 'CSV · 1 Sep' },
  {
    id: 'fraudscore',
    name: 'Fraudscore',
    status: 'live',
    detail: 'CSV · 1 Jul',
  },
]

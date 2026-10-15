import { ROUTE_PATHS } from '../../routes/paths'
import type { SidebarSection } from './types'

/**
 * Default app-shell navigation. Static configuration, not API data:
 * Pass a different list to `Sidebar` for
 * role-specific menus instead of branching inside the component.
 */
export const DEFAULT_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: 'reports',
    label: 'Reports',
    items: [
      {
        id: 'performance',
        label: 'Performance',
        icon: 'trend',
        children: [
          {
            id: 'campaign-overview',
            label: 'Campaign overview',
            to: ROUTE_PATHS.campaignOverview,
          },
          {
            id: 'goals-events',
            label: 'Goals & events',
            to: ROUTE_PATHS.goalsEvents,
          },
        ],
      },
      {
        id: 'mmp-analytics',
        label: 'MMP analytics',
        icon: 'phoneOutline',
        to: ROUTE_PATHS.mmpAnalytics,
      },
      {
        id: 'fraud-tools',
        label: 'Fraud tools',
        icon: 'shield',
        to: ROUTE_PATHS.fraudTools,
      },
      { id: 'crm', label: 'CRM', icon: 'handshake', to: ROUTE_PATHS.crm },
    ],
  },
  {
    // Filled from the user's saved reports once that feature ships.
    id: 'saved-reports',
    label: 'Saved reports',
    items: [],
    emptyLabel: 'Reports you save with “Save as report” appear here.',
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      {
        id: 'users-roles',
        label: 'Users & roles',
        icon: 'users',
        to: ROUTE_PATHS.usersRoles,
      },
      {
        id: 'event-mapper',
        label: 'Event mapper',
        icon: 'link',
        to: ROUTE_PATHS.eventMapper,
      },
    ],
  },
]

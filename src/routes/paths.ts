/**
 * App URL paths. Navigation and `<Route>` definitions both read from here so a
 * link can never point at a path the router does not know.
 */
export const ROUTE_PATHS = {
  home: '/',
  // campaignOverview: '/reports/performance/campaign-overview',
  campaignOverview: '/',
  goalsEvents: '/reports/performance/goals-events',
  mmpAnalytics: '/reports/mmp-analytics',
  fraudTools: '/reports/fraud-tools',
  crm: '/reports/crm',
  usersRoles: '/admin/users',
  eventMapper: '/admin/event-mapper',
} as const

/** Any path in `ROUTE_PATHS`. */
export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]

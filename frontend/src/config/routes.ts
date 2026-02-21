/** App route paths for navigation – single source of truth */

export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: (userId: string) => `/profile/${userId}`,
  organizations: '/organizations',
  organization: (orgId: string) => `/organizations/${orgId}`,
  invitations: '/invitations',
} as const;

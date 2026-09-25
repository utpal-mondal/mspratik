// Route permission mapping based on API permissions
export const routePermissions: Record<string, string[]> = {
  // Dashboard
  '/dashboard': [], // No specific permission required
  '/dashboard2': [],

  // Settings (only available to company admins)
  '/settings': ['is_cadmin'],
};

// Helper function to get required permissions for a route
export const getRequiredPermissions = (pathname: string): string[] => {
  // Check for exact match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  // Check for prefix matches (e.g., /orders/[id] should match /orders)
  for (const [route, permissions] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route + '/') || pathname === route) {
      return permissions;
    }
  }

  // Default: no permissions required
  return [];
};

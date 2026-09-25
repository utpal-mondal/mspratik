// Route to page title mapping used for the browser tab title.
// Pages that render their own <Head><title> override this value.
export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/dashboard2": "Dashboard",
  "/Home": "Home",

  // Settings
  "/settings": "Settings",
  "/settings/company-details": "Company Details",
  "/settings/roles": "Roles",
  "/settings/user": "Users",
  "/settings/user/create": "Create User",
  "/settings/user/edit/[id]": "Edit User",

  // Auth & misc
  "/auth": "Login",
  "/auth/login": "Login",
  "/auth/change-password": "Change Password",
  "/login": "Login",
  "/register": "Register",
  "/change-password": "Change Password",
  "/404": "Page Not Found",
  "/_error": "Error",
};

const isDynamicSegment = (segment: string) =>
  segment.startsWith("[") && segment.endsWith("]");

// Resolve a page title for a given pathname. Falls back to a
// humanized version of the first path segment, then "Dashboard".
export const getPageTitle = (pathname: string): string => {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);

  for (const [route, title] of Object.entries(pageTitles)) {
    const routeSegments = route.split("/").filter(Boolean);
    if (routeSegments.length !== segments.length) continue;
    const matches = routeSegments.every(
      (segment, i) => isDynamicSegment(segment) || segment === segments[i]
    );
    if (matches) {
      return title;
    }
  }

  if (segments.length > 0) {
    const base = segments[0].replace(/-/g, " ");
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  return "Dashboard";
};

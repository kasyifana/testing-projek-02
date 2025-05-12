export const PERMISSIONS = {
  VIEW_ALL_REPORTS: 'view_all_reports',
  HANDLE_SENSITIVE_REPORTS: 'handle_sensitive_reports',
  MANAGE_USERS: 'manage_users',
};

export const ROLES = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    label: 'Admin',
    permissions: [PERMISSIONS.VIEW_ALL_REPORTS],
  },
  MODERATOR: {
    label: 'Moderator',
    permissions: [],
  },
};

export function hasPermission(userRole, permission) {
  return ROLES[userRole]?.permissions.includes(permission) || false;
}

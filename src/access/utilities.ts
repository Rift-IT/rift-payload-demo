export type Role = 'admin' | 'editor'

// Permissive shape so this accepts both the full generated `User` and the
// sanitized `ClientUser` (whose generated type may omit custom fields).
type WithRoles = { roles?: Role[] | null }

/**
 * Returns true when the user holds at least one of the required roles.
 * Centralized so every access function shares one definition of "admin".
 */
export const checkRole = (required: Role[], user?: WithRoles | null): boolean => {
  if (!user) return false
  const roles = (user.roles ?? []) as Role[]
  return required.some((r) => roles.includes(r))
}

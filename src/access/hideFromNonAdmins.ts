import type { ClientUser } from 'payload'

/**
 * For `admin.hidden` — hides a collection/global from the admin nav for
 * non-admins. Receives `{ user }` (a ClientUser), not a full req.
 */
export const hideFromNonAdmins = ({ user }: { user: ClientUser | null }): boolean => {
  const roles = ((user as { roles?: string[] } | null)?.roles ?? []) as string[]
  return !roles.includes('admin')
}

import type { Access } from 'payload'

import { checkRole } from './utilities'

/**
 * Read access for publishable content (e.g. Pages):
 *  - Admins see everything, including drafts.
 *  - Everyone else only sees published documents.
 *
 * Returning a `where` constraint (rather than `false`) lets the public
 * front-end query published docs without authentication.
 */
export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (checkRole(['admin', 'editor'], user)) return true
  return {
    _status: {
      equals: 'published',
    },
  }
}

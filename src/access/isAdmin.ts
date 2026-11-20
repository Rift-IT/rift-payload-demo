import type { Access } from 'payload'

import { checkRole } from './utilities'

/** Collection-level: only users with the `admin` role. */
export const isAdmin: Access = ({ req: { user } }) => checkRole(['admin'], user)

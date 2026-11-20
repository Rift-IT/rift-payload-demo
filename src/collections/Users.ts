import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { checkRole } from '@/access/utilities'

/**
 * Auth + the minimal role model the whole access layer is built on.
 * `roles` drives `isAdmin` / `checkRole`. Admins manage everyone; any
 * authenticated user can read/update their own record.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'updatedAt'],
    group: 'Administration',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (!user) return false
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (!user) return false
      return { id: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      // Not `required` so server-side user creation (seeds, tests) needn't pass
      // it; the defaultValue still applies on create.
      defaultValue: ['editor'],
      label: 'Roles',
      // Only admins can grant/revoke roles — a user must not escalate themselves.
      access: {
        create: ({ req: { user } }) => checkRole(['admin'], user),
        update: ({ req: { user } }) => checkRole(['admin'], user),
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}

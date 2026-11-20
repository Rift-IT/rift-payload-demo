import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { hideFromNonAdmins } from '@/access/hideFromNonAdmins'

/**
 * Append-only event log written by `logActivity`. Powers the admin dashboard
 * "recent activity" widget. Rows are created via overrideAccess from server
 * code; the admin UI is read-only.
 */
export const ActivityLog: CollectionConfig = {
  slug: 'activity-log',
  labels: {
    singular: 'Activity',
    plural: 'Activity log',
  },
  access: {
    read: isAdmin,
    // Written only by server code (logActivity, hooks) via overrideAccess.
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  admin: {
    group: 'Administration',
    hidden: hideFromNonAdmins,
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'category', 'severity', 'source', 'createdAt'],
    description: 'System and user activity, newest first.',
  },
  fields: [
    {
      name: 'summary',
      type: 'text',
      required: true,
      label: 'Summary',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: [
        { label: 'System', value: 'system' },
        { label: 'Error', value: 'error' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    { name: 'source', type: 'text', label: 'Source' },
    { name: 'details', type: 'json', label: 'Details' },
  ],
  timestamps: true,
}

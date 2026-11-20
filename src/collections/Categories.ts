import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { hideFromNonAdmins } from '@/access/hideFromNonAdmins'
import { slugifyForPayload } from '@/utilities/slugify'

/**
 * A simple, reusable content taxonomy. Self-referential `parent` allows a
 * shallow hierarchy without pulling in a nested-docs dependency.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    hidden: hideFromNonAdmins,
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Categories for organizing content.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Parent category',
      admin: { position: 'sidebar' },
    },
    slugField({ slugify: slugifyForPayload }),
  ],
}

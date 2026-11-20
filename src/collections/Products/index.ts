import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

import { searchEndpoint } from './searchEndpoint'

/**
 * A new database table. Payload creates the `products` table, the admin UI
 * and a full REST + GraphQL API from this config alone.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'inStock', 'updatedAt'],
    listSearchableFields: ['name', 'description'],
  },
  access: {
    // Anyone can read (public API); only admins can change data.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  defaultSort: 'name',
  // Custom endpoints live next to the auto-generated ones: /api/products/search
  endpoints: [searchEndpoint],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Coffee', value: 'coffee' },
        { label: 'Tea', value: 'tea' },
        { label: 'Equipment', value: 'equipment' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Price in DKK.' },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      label: 'In stock',
      defaultValue: true,
      // Show a check mark in the list view instead of true/false.
      admin: { components: { Cell: '@/components/admin/BooleanIconCell#BooleanIconCell' } },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}

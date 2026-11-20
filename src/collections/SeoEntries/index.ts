import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { hideFromNonAdmins } from '@/access/hideFromNonAdmins'
import { normalizePath, validatePath } from '@/utilities/pathNormalization'

import { revalidateSeoEntry, revalidateSeoEntryDelete } from './hooks/revalidateSeoEntry'
import { syncPageSlugFromSeoEntry } from './hooks/syncPageSlugFromSeoEntry'

/**
 * SEO entries are the URL / SEO source of truth for the whole site. Each entry
 * owns a unique `path`; Pages auto-create one on first publish. Editing `path`
 * renames the page's URL and auto-creates a 301 redirect from the old path.
 */
export const SeoEntries: CollectionConfig = {
  slug: 'seo-entries',
  labels: {
    singular: 'SEO entry',
    plural: 'SEO',
  },
  access: {
    create: isAdmin,
    update: isAdmin,
    // SEO entries may only be deleted via the Pages.beforeDelete cascade,
    // which sets req.context.allowSeoEntryDelete. Direct admin/REST deletes
    // are blocked so a SEO row can't be orphaned from its page.
    delete: ({ req }) =>
      Boolean((req.context as { allowSeoEntryDelete?: boolean } | undefined)?.allowSeoEntryDelete),
    // Public read so generateMetadata can resolve SEO data without a user.
    read: () => true,
  },
  admin: {
    group: 'Marketing',
    hidden: hideFromNonAdmins,
    description: 'Centralized SEO and URL management for the whole site.',
    useAsTitle: 'path',
    defaultColumns: [
      'path',
      'metaTitle',
      'metaDescription',
      'noindex',
      'includeInSitemap',
      'updatedAt',
    ],
    listSearchableFields: ['path', 'metaTitle', 'metaDescription'],
  },
  hooks: {
    // revalidateSeoEntry runs first so it flushes Next caches on the OLD path
    // before syncPageSlugFromSeoEntry mutates the Page.
    afterChange: [revalidateSeoEntry, syncPageSlugFromSeoEntry],
    afterDelete: [revalidateSeoEntryDelete],
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL',
      // Editable on create; on update only for source=page (app-route entries
      // are defined by the folder structure and must not drift).
      access: {
        update: ({ doc }) => doc?.source === 'page',
      },
      admin: {
        description:
          'Path from root, e.g. "/" or "/about". Changing it auto-creates a 301 redirect from the old URL so existing links keep working.',
      },
      hooks: {
        beforeValidate: [(args) => normalizePath({ value: args.value })],
      },
      validate: (value: unknown) => validatePath(value),
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta title',
      admin: { description: 'Shown in the browser tab and search results.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta description',
      admin: { description: 'Recommended length: 120–160 characters.' },
    },
    {
      name: 'metaImage',
      type: 'upload',
      relationTo: 'media',
      label: 'OG image',
      admin: { description: 'Used when shared on social media (Open Graph).' },
    },
    {
      name: 'structuredData',
      type: 'json',
      label: 'Structured data (JSON-LD)',
      admin: {
        description:
          'Schema.org markup, rendered as <script type="application/ld+json"> on the page. Test it at https://validator.schema.org.',
      },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      label: 'noindex',
      admin: {
        components: { Cell: '@/components/admin/BooleanIconCell#BooleanIconCell' },
        description: 'Active: hidden from search engines and excluded from the sitemap.',
      },
    },
    {
      name: 'nofollow',
      type: 'checkbox',
      defaultValue: false,
      label: 'nofollow',
      admin: {
        components: { Cell: '@/components/admin/BooleanIconCell#BooleanIconCell' },
        description: 'Active: search engines do not follow links on this page.',
      },
    },
    {
      name: 'includeInSitemap',
      type: 'checkbox',
      defaultValue: true,
      label: 'Include in sitemap.xml',
      admin: {
        components: { Cell: '@/components/admin/BooleanIconCell#BooleanIconCell' },
        condition: (data) => {
          if (data?.noindex) return false
          if (typeof data?.path === 'string' && data.path.includes('[')) return false
          return true
        },
        description: 'Adds the page to sitemap.xml so search engines find it more easily.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'override',
      label: 'Source',
      options: [
        { label: 'CMS page', value: 'page' },
        { label: 'Override', value: 'override' },
      ],
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'CMS page: linked to a document in the Pages collection.',
      },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Linked page',
      admin: {
        condition: (data) => data?.source === 'page',
        description: "Auto-filled by the page's publish hook.",
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'autoRedirects',
      type: 'join',
      collection: 'redirects',
      on: 'createdFromSeoEntry',
      label: 'Associated redirects',
      admin: {
        position: 'sidebar',
        description: 'Automatic 301 redirects created when this URL changed.',
        defaultColumns: ['fromPath'],
        allowCreate: false,
        condition: (data) => Boolean(data?.autoRedirects?.docs?.length),
      },
      defaultLimit: 25,
    },
  ],
}

import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { hideFromNonAdmins } from '@/access/hideFromNonAdmins'
import { Hero } from '@/blocks/Hero/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { withBlockLabel } from '@/blocks/withBlockLabel'
import { logPublish } from '@/hooks/logPublish'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { slugifyForPayload } from '@/utilities/slugify'

import { ensureSeoEntryEndpoint } from './endpoints/ensureSeoEntryEndpoint'
import { createSeoEntryForPage } from './hooks/createSeoEntryForPage'
import { deleteSeoEntryForPage } from './hooks/deleteSeoEntryForPage'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: adminOrPublishedStatus,
    update: isAdmin,
  },
  admin: {
    group: 'Content',
    hidden: hideFromNonAdmins,
    description: 'Build and manage site pages.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug as string, collection: 'pages', req }) ?? '',
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'pages', req }),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      admin: { description: "The page's internal title." },
    },
    // Internal slug — a denormalized mirror of `seo-entries.path`. Displayed
    // read-only; the canonical, editable URL lives on the linked SEO entry.
    slugField({
      slugify: slugifyForPayload,
      overrides: (field) => {
        const slugTextField = field.fields[1]
        if (slugTextField && slugTextField.type === 'text') {
          slugTextField.label = 'URL'
          slugTextField.admin = {
            ...(slugTextField.admin ?? {}),
            readOnly: true,
            description: 'Set via the linked SEO entry.',
          }
          delete slugTextField.admin.components
        }
        return field
      },
    }),
    {
      name: 'pageSeoLink',
      type: 'ui',
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        components: {
          Field: '@/components/admin/PageSeoLink.client#PageSeoLinkField',
        },
      },
    },
    {
      name: 'publishedOn',
      type: 'date',
      label: 'Published on',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) return new Date()
            return value
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              label: 'Page layout',
              admin: {
                description: 'Add and arrange content blocks to build the page.',
              },
              blocks: [Hero, Content, MediaBlock].map(withBlockLabel),
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    // createSeoEntryForPage must run BEFORE revalidatePage so the SEO entry
    // exists when revalidatePage resolves the path.
    afterChange: [createSeoEntryForPage, revalidatePage, logPublish('Page')],
    // deleteSeoEntryForPage must run in beforeDelete — by afterDelete the
    // seo-entries.page FK is already nulled, so the cascade lookup would miss.
    beforeDelete: [deleteSeoEntryForPage],
    afterDelete: [revalidateDelete],
  },
  endpoints: [ensureSeoEntryEndpoint],
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}

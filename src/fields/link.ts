import type { Field } from 'payload'

/**
 * A reusable link group: either an internal Page reference or a custom URL,
 * with an optional label and "open in new tab" toggle. Used by blocks that
 * render a button/CTA.
 */
export const linkField = (
  overrides: { name?: string; condition?: (data: unknown, siblingData: unknown) => boolean } = {},
): Field => ({
  name: overrides.name ?? 'link',
  type: 'group',
  label: 'Link',
  admin: overrides.condition ? { condition: overrides.condition } : undefined,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Internal page', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'label',
      type: 'text',
      label: 'Label',
    },
    {
      name: 'reference',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Page',
      admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: { condition: (_, siblingData) => siblingData?.type === 'custom' },
    },
  ],
})

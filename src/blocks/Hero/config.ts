import type { Block } from 'payload'

import { linkField } from '@/fields/link'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Heading',
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background image',
    },
    {
      name: 'enableLink',
      type: 'checkbox',
      label: 'Show call-to-action button',
      defaultValue: false,
    },
    linkField({
      condition: (_, siblingData) => Boolean((siblingData as { enableLink?: boolean })?.enableLink),
    }),
  ],
}

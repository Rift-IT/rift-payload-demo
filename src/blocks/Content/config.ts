import type { Block } from 'payload'

import { defaultRichText } from '@/fields/defaultRichText'

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: 'Content',
    plural: 'Content blocks',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      editor: defaultRichText(),
      label: false,
    },
  ],
}

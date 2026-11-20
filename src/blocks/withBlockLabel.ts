import type { Block } from 'payload'

/**
 * Adds a custom row Label component to a block so the admin layout list shows
 * an auto-derived label from the block's own content instead of "Untitled".
 */
export function withBlockLabel(block: Block): Block {
  return {
    ...block,
    admin: {
      ...block.admin,
      components: {
        ...block.admin?.components,
        Label: '@/components/admin/BlockRowLabel#BlockRowLabel',
      },
    },
  }
}

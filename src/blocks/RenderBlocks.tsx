import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { HeroBlock } from '@/blocks/Hero/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

// Map block `slug` → front-end component. Add new blocks here as you create
// them; the key must match the block's `slug` in its config.
const blockComponents = {
  hero: HeroBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
}

type LayoutBlock = NonNullable<Page['layout']>[number]

export const RenderBlocks: React.FC<{ blocks: Page['layout'] }> = ({ blocks }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <Fragment>
      {blocks.map((block: LayoutBlock, index) => {
        const { blockType } = block
        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType as keyof typeof blockComponents]
          return (
            <div className="rift-block" key={index}>
              {/* @ts-expect-error — each component accepts its own block shape */}
              <Block {...block} />
            </div>
          )
        }
        return null
      })}
    </Fragment>
  )
}

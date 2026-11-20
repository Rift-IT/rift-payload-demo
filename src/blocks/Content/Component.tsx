import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import type { ContentBlock as ContentBlockType } from '@/payload-types'

export const ContentBlock: React.FC<ContentBlockType> = ({ richText }) => {
  if (!richText) return null
  return (
    <div className="rift-content">
      <RichText data={richText as SerializedEditorState} />
    </div>
  )
}

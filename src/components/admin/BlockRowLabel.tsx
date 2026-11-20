'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const blockTypeLabels: Record<string, string> = {
  hero: 'Hero',
  content: 'Content',
  mediaBlock: 'Media block',
}

/** Row label for the Pages `layout` blocks list — shows a friendly type name. */
export const BlockRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ blockType?: string; blockName?: string }>()
  const type = data?.blockType
  const friendly = (type && blockTypeLabels[type]) || type || 'Block'
  const suffix = data?.blockName ? ` — ${data.blockName}` : ''
  return (
    <span>
      {String(rowNumber ?? 0).padStart(2, '0')}. {friendly}
      {suffix}
    </span>
  )
}

export default BlockRowLabel

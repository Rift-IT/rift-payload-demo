import React from 'react'

import type { MediaBlock as MediaBlockType, Media } from '@/payload-types'

export const MediaBlock: React.FC<MediaBlockType> = ({ media, caption }) => {
  if (!media || typeof media !== 'object') return null
  const m = media as Media
  if (!m.url) return null

  return (
    <figure className="rift-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={m.url}
        alt={m.alt ?? ''}
        width={m.width ?? undefined}
        height={m.height ?? undefined}
      />
      {caption ? <figcaption className="rift-media__caption">{caption}</figcaption> : null}
    </figure>
  )
}

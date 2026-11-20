import React from 'react'

import type { HeroBlock as HeroBlockType, Media } from '@/payload-types'
import { resolveLinkHref } from '@/utilities/resolveLinkHref'

export const HeroBlock: React.FC<HeroBlockType> = ({
  heading,
  subheading,
  image,
  enableLink,
  link,
}) => {
  const bg = image && typeof image === 'object' ? (image as Media).url : undefined
  const href = enableLink ? resolveLinkHref(link) : null

  return (
    <section
      className="rift-hero"
      style={bg ? { backgroundImage: `url(${bg})` } : undefined}
      data-has-image={Boolean(bg)}
    >
      <div className="rift-hero__inner">
        <h1 className="rift-hero__heading">{heading}</h1>
        {subheading ? <p className="rift-hero__subheading">{subheading}</p> : null}
        {href ? (
          <a
            className="rift-button"
            href={href}
            {...(link?.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link?.label ?? 'Learn more'}
          </a>
        ) : null}
      </div>
    </section>
  )
}

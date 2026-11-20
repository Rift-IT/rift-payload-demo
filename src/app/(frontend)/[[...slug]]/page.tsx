import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import React from 'react'

import type { Media } from '@/payload-types'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getPageByPath } from '@/utilities/getPageByPath'
import { getSeoEntry } from '@/utilities/getSeoEntry'
import { findRedirectForPath } from '@/utilities/getRedirects'

type Params = { slug?: string[] }

const pathFromParams = (slug?: string[]): string => {
  if (!slug || slug.length === 0) return '/'
  return `/${slug.join('/')}`
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const path = pathFromParams(slug)
  const { isEnabled: isDraft } = await draftMode()

  const page = await getPageByPath(path, isDraft)

  if (!page) {
    // No page at this path — honor a redirect if one exists, else 404.
    const redirectDoc = await findRedirectForPath(path)
    if (redirectDoc && redirectDoc.statusPreset !== 'gone' && redirectDoc.toPath) {
      const permanent = [301, 308].includes(Number(redirectDoc.statusCode))
      if (permanent) permanentRedirect(redirectDoc.toPath)
      redirect(redirectDoc.toPath)
    }
    notFound()
  }

  const seo = await getSeoEntry(path)

  return (
    <>
      {seo?.structuredData ? <JsonLd data={seo.structuredData} /> : null}
      <RenderBlocks blocks={page.layout} />
    </>
  )
}

/** Schema.org structured data. `<` is escaped so content cannot close the script tag. */
const JsonLd = ({ data }: { data: unknown }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const path = pathFromParams(slug)
  const seo = await getSeoEntry(path)

  if (!seo) return {}

  const ogImage =
    seo.metaImage && typeof seo.metaImage === 'object' ? (seo.metaImage as Media).url : undefined

  return {
    title: seo.metaTitle ?? undefined,
    description: seo.metaDescription ?? undefined,
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
    },
    openGraph: ogImage
      ? {
          title: seo.metaTitle ?? undefined,
          description: seo.metaDescription ?? undefined,
          images: [{ url: ogImage }],
        }
      : undefined,
  }
}

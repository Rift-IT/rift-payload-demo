import type { Page } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { slugFromPath } from '@/utilities/pathNormalization'

async function getPageBySlugUncached(slug: string, draft: boolean): Promise<Page | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2, // populate block media / link references
    draft,
    overrideAccess: draft, // published-only for public; full access in preview
    pagination: false,
  })
  return result.docs[0] ?? null
}

/**
 * Resolves a public URL path to its Page. In draft (preview) mode it bypasses
 * the cache and access control so unpublished content renders; otherwise it
 * uses a tagged cache keyed by slug.
 */
export const getPageByPath = (path: string, draft = false): Promise<Page | null> => {
  const slug = slugFromPath(path)
  if (draft) return getPageBySlugUncached(slug, true)
  return unstable_cache(() => getPageBySlugUncached(slug, false), ['page', slug], {
    tags: ['pages', `page:${slug}`],
  })()
}

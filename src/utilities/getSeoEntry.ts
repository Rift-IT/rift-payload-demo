import type { SeoEntry } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getPayload } from 'payload'

async function getSeoEntryUncached(path: string): Promise<SeoEntry | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'seo-entries',
    where: { path: { equals: path } },
    limit: 1,
    depth: 1, // populate metaImage
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

/**
 * Cached SEO lookup keyed by path. Tagged 'seo-entries' for bulk invalidation
 * and 'seo-entry:${path}' for per-row precision. The revalidateSeoEntry hook
 * also calls revalidatePath for the entry's URL on save.
 *
 * React `cache()` dedupes concurrent same-path callers within a render (the
 * page and generateMetadata both resolve SEO for the same path);
 * `unstable_cache` persists across renders and handles tag invalidation.
 */
export const getSeoEntry = cache((path: string) =>
  unstable_cache(async () => getSeoEntryUncached(path), ['seo-entry', path], {
    tags: ['seo-entries', `seo-entry:${path}`],
  })(),
)

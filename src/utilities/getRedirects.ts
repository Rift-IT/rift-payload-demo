import type { Redirect } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

async function getActiveRedirectsUncached(): Promise<Redirect[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'redirects',
    where: { isActive: { equals: true } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  return result.docs as Redirect[]
}

/** Active redirects, cached and tagged 'redirects' (busted by the collection hooks). */
export const getActiveRedirects = unstable_cache(getActiveRedirectsUncached, ['active-redirects'], {
  tags: ['redirects'],
})

/** Finds the active redirect whose `fromPath` exactly matches `path`, if any. */
export const findRedirectForPath = async (path: string): Promise<Redirect | null> => {
  const redirects = await getActiveRedirects()
  return redirects.find((r) => r.fromPath === path) ?? null
}

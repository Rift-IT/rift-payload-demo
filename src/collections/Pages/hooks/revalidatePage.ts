import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '@/payload-types'

const pathFromSlug = (slug?: string | null): string => (!slug || slug === 'home' ? '/' : `/${slug}`)

/**
 * Busts the Next cache for a page's canonical URL on publish/unpublish.
 * User-driven path renames are handled by revalidateSeoEntry (which flushes
 * both old and new paths); this handles content edits and status changes.
 */
export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    const path = pathFromSlug((doc as { slug?: string }).slug)
    payload.logger.info(`Revalidating page at path: ${path}`)
    revalidatePath(path)
    revalidateTag('sitemap', 'default')
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    const oldPath = pathFromSlug((previousDoc as { slug?: string }).slug)
    payload.logger.info(`Revalidating unpublished page at path: ${oldPath}`)
    revalidatePath(oldPath)
    revalidateTag('sitemap', 'default')
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc
  revalidatePath(pathFromSlug((doc as { slug?: string }).slug))
  revalidateTag('sitemap', 'default')
  return doc
}

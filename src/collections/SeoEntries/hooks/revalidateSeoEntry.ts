import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { SeoEntry } from '@/payload-types'

// Template paths (e.g. /orders/[id]) aren't real URLs — never revalidatePath
// on them. The presence of `[` is the signal.
const isTemplatePath = (path?: string | null): boolean =>
  typeof path === 'string' && path.includes('[')

const flush = (
  payload: { logger: { info: (msg: string) => void } },
  entry: SeoEntry | null,
  previous: SeoEntry | null,
) => {
  if (entry?.path && !isTemplatePath(entry.path)) {
    payload.logger.info(`Revalidating SEO path: ${entry.path}`)
    revalidatePath(entry.path)
  }
  if (previous?.path && !isTemplatePath(previous.path) && previous.path !== entry?.path) {
    payload.logger.info(`Revalidating old SEO path: ${previous.path}`)
    revalidatePath(previous.path)
  }
  revalidateTag('seo-entries', 'default')
  revalidateTag('sitemap', 'default')
}

export const revalidateSeoEntry: CollectionAfterChangeHook<SeoEntry> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) flush(payload, doc, previousDoc ?? null)
  return doc
}

export const revalidateSeoEntryDelete: CollectionAfterDeleteHook<SeoEntry> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) flush(payload, null, doc)
  return doc
}

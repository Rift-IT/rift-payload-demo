import type { CollectionAfterChangeHook } from 'payload'

import type { Page } from '@/payload-types'

import { ensureSeoEntryForPage } from './ensureSeoEntryForPage'

/**
 * Auto-creates a SEO entry the first time a page is published.
 *
 * Gated on published status because (1) autosave drafts get an empty draft
 * created during the admin's React render, and materializing a SEO entry there
 * would cascade into revalidatePath which Next forbids during render; and
 * (2) drafts shouldn't claim a public URL or appear in the sitemap. The admin
 * "Create SEO entry" button bypasses this by calling ensureSeoEntryForPage
 * directly, so draft pages can still reserve an entry on demand.
 */
export const createSeoEntryForPage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (req.context.disableAutoSeoEntry) return doc
  if (doc._status !== 'published') return doc

  // Only act on the FIRST transition into 'published' to avoid duplicate rows
  // and a cascade on every save of an already-published page.
  const isFirstPublish = operation === 'create' || previousDoc?._status !== 'published'
  if (!isFirstPublish) return doc

  await ensureSeoEntryForPage(req, doc)
  return doc
}

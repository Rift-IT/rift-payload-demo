import type { CollectionBeforeDeleteHook } from 'payload'

/**
 * Cascades the SEO entry delete when a page is removed.
 *
 * Must run as `beforeDelete`, not `afterDelete`: by the time afterDelete fires
 * the SQLite adapter has already nulled `seo-entries.page`, so a lookup by
 * `page.equals = id` returns zero and the cascade silently no-ops, leaving an
 * orphan row. Running before keeps the FK intact for the query; both deletes
 * share the parent transaction via `req`.
 */
export const deleteSeoEntryForPage: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const existing = await req.payload.find({
    collection: 'seo-entries',
    where: { page: { equals: id } },
    limit: 1,
    depth: 0,
    req,
  })
  const entry = existing.docs[0]
  if (!entry) return

  // Open the gate on req.context so SeoEntries.access.delete permits this
  // cascade. Direct admin/REST deletes never set this flag, so they stay
  // blocked (preventing orphaned or accidentally-dropped SEO rows).
  ;(req.context as { allowSeoEntryDelete?: boolean }).allowSeoEntryDelete = true
  try {
    await req.payload.delete({
      collection: 'seo-entries',
      id: entry.id,
      req,
      overrideAccess: true,
    })
  } finally {
    ;(req.context as { allowSeoEntryDelete?: boolean }).allowSeoEntryDelete = false
  }
}

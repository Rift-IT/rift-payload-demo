import type { CollectionAfterChangeHook } from 'payload'

import type { SeoEntry } from '@/payload-types'
import { logActivity } from '@/lib/logActivity'
import { slugFromPath } from '@/utilities/pathNormalization'

/**
 * One-way sync: when an operator edits `path` on a source=page SEO entry,
 * update the linked Page's hidden `slug` mirror to match (so every internal
 * link/lookup that reads `page.slug` stays correct), and create or rewire a
 * 301 redirect from the old path to the new one so existing links keep working.
 *
 * Skipped on create (path was just initialized from the page — already synced)
 * and when the path didn't change.
 */
export const syncPageSlugFromSeoEntry: CollectionAfterChangeHook<SeoEntry> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update') return doc
  if (doc.source !== 'page') return doc
  if (!previousDoc || previousDoc.path === doc.path) return doc
  if (!doc.page) return doc

  const pageId = typeof doc.page === 'object' ? doc.page.id : doc.page
  if (!pageId) return doc

  const desiredSlug = slugFromPath(doc.path)

  // revalidateSeoEntry already ran (we're second in the array) and flushed both
  // paths, so suppress the Page hook's own revalidation to avoid double work.
  await req.payload.update({
    collection: 'pages',
    id: pageId,
    // slug is a hidden internal field; cast to satisfy the generated type.
    data: { slug: desiredSlug } as Record<string, unknown>,
    req,
    context: { disableRevalidate: true },
  })

  const fromPath = previousDoc.path
  const toPath = doc.path
  try {
    // Stale-redirect cleanup: if an auto redirect already lives on the NEW
    // path (page renamed away earlier, now renamed back), it's stale and would
    // shadow the live page — delete it first. Manual/imported redirects are
    // left alone (admin intent).
    const staleOnNewPath = await req.payload.find({
      collection: 'redirects',
      where: {
        and: [{ fromPath: { equals: toPath } }, { source: { equals: 'auto-seo-change' } }],
      },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (staleOnNewPath.docs[0]) {
      await req.payload.delete({
        collection: 'redirects',
        id: staleOnNewPath.docs[0].id,
        req,
        overrideAccess: true,
      })
    }

    const existing = await req.payload.find({
      collection: 'redirects',
      where: { fromPath: { equals: fromPath } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      await req.payload.update({
        collection: 'redirects',
        id: existing.docs[0].id,
        data: {
          toPath,
          statusPreset: 'permanent',
          statusCode: 301,
          isActive: true,
          createdFromSeoEntry: doc.id,
        },
        req,
        overrideAccess: true,
      })
      await logActivity(req.payload, {
        category: 'system',
        severity: 'info',
        summary: `Updated redirect: ${fromPath} → ${toPath}`,
        source: 'syncPageSlugFromSeoEntry',
        details: { fromPath, toPath, seoEntryId: doc.id, action: 'rewire' },
        req,
      })
    } else {
      await req.payload.create({
        collection: 'redirects',
        data: {
          fromPath,
          toPath,
          statusPreset: 'permanent',
          statusCode: 301,
          isActive: true,
          source: 'auto-seo-change',
          createdFromSeoEntry: doc.id,
        },
        req,
        overrideAccess: true,
      })
      await logActivity(req.payload, {
        category: 'system',
        severity: 'success',
        summary: `Created 301 redirect: ${fromPath} → ${toPath}`,
        source: 'syncPageSlugFromSeoEntry',
        details: { fromPath, toPath, seoEntryId: doc.id, action: 'create' },
        req,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    req.payload.logger.warn(`Could not create/rewire redirect ${fromPath} → ${toPath}: ${message}`)
  }

  return doc
}

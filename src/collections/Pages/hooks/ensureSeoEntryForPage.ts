import type { PayloadRequest } from 'payload'

import type { Page, SeoEntry } from '@/payload-types'
import { slugify } from '@/utilities/slugify'

const MAX_COLLISION_TRIES = 200

const findFreePath = async (req: PayloadRequest, base: string): Promise<string> => {
  const candidates = [
    base,
    ...Array.from({ length: MAX_COLLISION_TRIES }, (_, i) => `${base}-${i + 2}`),
  ]
  for (const candidate of candidates) {
    const existing = await req.payload.find({
      collection: 'seo-entries',
      where: { path: { equals: candidate } },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.docs.length === 0) return candidate
  }
  return `${base}-${Date.now()}`
}

const pathFromDoc = (doc: Page): string | null => {
  const slug = (doc as { slug?: string }).slug
  if (slug === 'home') return '/'
  if (slug && slug.length > 0) return `/${slug}`
  const title = doc.title?.trim() ?? ''
  if (title.length === 0) return null
  const fallback = slugify(title)
  if (fallback.length === 0) return null
  return `/${fallback}`
}

export type EnsureSeoEntryResult =
  | { created: true; entry: SeoEntry }
  | { created: false; entry: SeoEntry; reason: 'already-exists' }
  | { created: false; entry: null; reason: 'missing-title' }

/**
 * Shared helper used by both the afterChange hook (auto-create on first
 * publish) and the admin "Create SEO entry" button (manual create at any time,
 * including draft). Idempotent: returns the existing entry if one is already
 * linked to the page. The caller owns gating (publish status, etc.); this only
 * enforces: a path can be derived, and never a second entry for the same page.
 */
export const ensureSeoEntryForPage = async (
  req: PayloadRequest,
  doc: Page,
): Promise<EnsureSeoEntryResult> => {
  const existing = await req.payload.find({
    collection: 'seo-entries',
    where: { page: { equals: doc.id } },
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.totalDocs > 0) {
    return { created: false, entry: existing.docs[0] as SeoEntry, reason: 'already-exists' }
  }

  const basePath = pathFromDoc(doc)
  if (basePath === null) {
    return { created: false, entry: null, reason: 'missing-title' }
  }

  // Home is special — never collision-suffix. A second "/" is a real conflict.
  const path = basePath === '/' ? basePath : await findFreePath(req, basePath)

  const entry = (await req.payload.create({
    collection: 'seo-entries',
    data: {
      path,
      source: 'page',
      page: doc.id,
      metaTitle: doc.title,
      noindex: false,
      nofollow: false,
      includeInSitemap: true,
    },
    req,
  })) as SeoEntry

  return { created: true, entry }
}

import type { Endpoint } from 'payload'

import { checkRole } from '@/access/utilities'
import type { Page, User } from '@/payload-types'

import { ensureSeoEntryForPage } from '../hooks/ensureSeoEntryForPage'

/**
 * POST /api/pages/:id/ensure-seo-entry
 *
 * Admin-only fallback to materialize a SEO entry on demand — for pages that
 * predate the feature, recovered from a hook error, or to reserve a URL while
 * still in draft. Idempotent.
 */
export const ensureSeoEntryEndpoint: Omit<Endpoint, 'root'> = {
  path: '/:id/ensure-seo-entry',
  method: 'post',
  handler: async (req) => {
    if (!req.user || !checkRole(['admin'], req.user as User)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = req.routeParams?.id
    const pageId = typeof id === 'string' ? Number(id) : id
    if (typeof pageId !== 'number' || !Number.isFinite(pageId)) {
      return Response.json({ error: 'Invalid page id' }, { status: 400 })
    }

    let page: Page
    try {
      page = (await req.payload.findByID({
        collection: 'pages',
        id: pageId,
        depth: 0,
        draft: true,
        overrideAccess: true,
        req,
      })) as Page
    } catch {
      return Response.json({ error: 'Page not found' }, { status: 404 })
    }

    const result = await ensureSeoEntryForPage(req, page)

    if (result.entry === null) {
      return Response.json(
        { error: 'Page has no title yet. Add a title and wait for autosave, then try again.' },
        { status: 400 },
      )
    }

    return Response.json({
      created: result.created,
      entry: { id: result.entry.id, path: result.entry.path },
    })
  },
}

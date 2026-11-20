import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { env } from '@/env'

// Rendered at request time — it reads the database, so it must not be
// statically prerendered during `next build`.
export const dynamic = 'force-dynamic'

const SERVER_URL = env.serverUrl

const buildSitemap = unstable_cache(
  async (): Promise<string> => {
    let docs: Array<{ path?: string | null; updatedAt?: string | null }> = []
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'seo-entries',
        where: {
          and: [{ includeInSitemap: { equals: true } }, { noindex: { equals: false } }],
        },
        limit: 5000,
        depth: 0,
        overrideAccess: true,
        pagination: false,
      })
      docs = result.docs
    } catch {
      // DB not migrated yet (e.g. fresh checkout) — emit an empty sitemap.
      docs = []
    }

    const urls = docs
      // Exclude route templates like /orders/[id].
      .filter((doc) => typeof doc.path === 'string' && !doc.path.includes('['))
      .map((doc) => {
        const loc = `${SERVER_URL}${doc.path === '/' ? '' : doc.path}`
        const lastmod = doc.updatedAt
          ? `<lastmod>${new Date(doc.updatedAt).toISOString()}</lastmod>`
          : ''
        return `<url><loc>${loc}</loc>${lastmod}</url>`
      })
      .join('')

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  },
  ['sitemap'],
  { tags: ['sitemap', 'seo-entries'] },
)

export const GET = async (): Promise<Response> => {
  const xml = await buildSitemap()
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}

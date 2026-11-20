import type { Payload } from 'payload'

import { demoUser } from '@/env'
import { logActivity } from '@/lib/logActivity'

import { heading, paragraph, richText } from './richText'

// Seeding runs at startup, outside a Next request, where cache revalidation
// isn't available. The collection hooks skip it when this flag is set.
const context = { disableRevalidate: true }

async function isEmpty(payload: Payload, collection: 'users' | 'pages'): Promise<boolean> {
  const { totalDocs } = await payload.count({ collection, overrideAccess: true })
  return totalDocs === 0
}

async function seedUser(payload: Payload) {
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: { ...demoUser, roles: ['admin'] },
  })
  payload.logger.info(`Seed: created admin user ${demoUser.email}`)
}

async function seedPages(payload: Payload) {
  const about = await payload.create({
    collection: 'pages',
    overrideAccess: true,
    context,
    data: {
      title: 'Om os',
      slug: 'om-os',
      _status: 'published',
      layout: [
        { blockType: 'hero', heading: 'Om os', subheading: 'En side redigeret i Payload.' },
        {
          blockType: 'content',
          richText: richText(
            heading('Rediger mig i admin-panelet'),
            paragraph(
              'Gå til Content → Pages → "Om os" og ret teksten. Klik Publish changes, og siden opdateres med det samme.',
            ),
          ),
        },
      ],
    },
  })

  await payload.create({
    collection: 'pages',
    overrideAccess: true,
    context,
    data: {
      title: 'Forside',
      slug: 'home',
      _status: 'published',
      layout: [
        {
          blockType: 'hero',
          heading: 'Velkommen til demoen',
          subheading:
            'Al tekst på siden kommer fra Payload CMS. Log ind på /admin og prøv at ændre den.',
          enableLink: true,
          link: { type: 'reference', reference: about.id, label: 'Læs mere' },
        },
        {
          blockType: 'content',
          richText: richText(
            heading('Hvad kan du prøve?'),
            paragraph(
              'Tekster og billeder: Content → Pages. Tilføj en Media-blok for at vise et billede.',
            ),
            paragraph(
              'SEO: Marketing → SEO. Her styres meta-title, description, OG-billede, noindex og structured data (JSON-LD).',
            ),
          ),
        },
      ],
    },
  })

  // Publishing a page auto-creates its SEO entry. Enrich the home page's entry
  // with a description and structured data so the SEO features have content.
  const { docs } = await payload.find({
    collection: 'seo-entries',
    where: { path: { equals: '/' } },
    limit: 1,
    overrideAccess: true,
  })
  if (docs[0]) {
    await payload.update({
      collection: 'seo-entries',
      id: docs[0].id,
      overrideAccess: true,
      context,
      data: {
        metaTitle: 'Forside | Rift Payload Demo',
        metaDescription: 'En demo af Payload CMS: rediger indhold, styr SEO og byg API’er.',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Rift Payload Demo',
          url: 'http://localhost:3000',
        },
      },
    })
  }

  payload.logger.info('Seed: created demo pages')
}

/**
 * Runs on every start (Payload `onInit`) and only fills collections that are
 * empty, so it never overwrites changes. `pnpm reset` wipes the database to
 * start over.
 */
export async function seed(payload: Payload): Promise<void> {
  let seeded = false

  if (await isEmpty(payload, 'users')) {
    await seedUser(payload)
    seeded = true
  }

  if (await isEmpty(payload, 'pages')) {
    await seedPages(payload)
    seeded = true
  }

  if (seeded) {
    await logActivity(payload, {
      category: 'system',
      severity: 'info',
      summary: 'Demo data seeded',
      source: 'seed',
    })
  }
}

import type { CollectionSlug, PayloadRequest } from 'payload'

import { env } from '@/env'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

/**
 * Builds the `/next/preview` URL the admin live-preview iframe loads. The
 * preview route validates `previewSecret`, enables Next draft mode, and
 * redirects to the real page path so drafts render with the live front-end.
 */
export const generatePreviewPath = ({ collection, slug }: Props): string | null => {
  if (slug === undefined || slug === null) return null

  const path = `${collectionPrefixMap[collection]}/${slug === 'home' ? '' : slug}`

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: path === '' ? '/' : path,
    previewSecret: env.previewSecret,
  })

  return `/next/preview?${encodedParams.toString()}`
}

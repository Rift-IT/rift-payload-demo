import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

// The middleware reads the active redirect set through a tagged cache
// (see src/utilities/getRedirects.ts). Bust it whenever a row changes.
export const revalidateRedirectsCache: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateTag('redirects', 'default')
  return doc
}

export const revalidateRedirectsCacheDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) revalidateTag('redirects', 'default')
  return doc
}

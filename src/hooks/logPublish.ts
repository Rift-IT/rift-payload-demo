import type { CollectionAfterChangeHook } from 'payload'

import { logActivity } from '@/lib/logActivity'

/**
 * Records an activity-log entry the first time a document transitions into the
 * `published` state. Used by Pages; reusable for any draft-enabled collection.
 */
export const logPublish =
  (label: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    const becamePublished = doc?._status === 'published' && previousDoc?._status !== 'published'
    if (!becamePublished) return doc

    await logActivity(req.payload, {
      category: 'user',
      severity: 'success',
      summary: `${label} published: ${doc?.title ?? doc?.id}`,
      source: 'logPublish',
      details: { id: doc?.id },
      req,
    })
    return doc
  }

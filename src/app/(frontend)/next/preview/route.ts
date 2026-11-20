import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { env } from '@/env'

/**
 * Live-preview entrypoint loaded by the admin iframe (see generatePreviewPath).
 * Validates the shared secret, enables Next draft mode, and forwards to the
 * real page path so drafts render through the live front-end.
 */
export const GET = async (req: NextRequest): Promise<Response> => {
  const { searchParams } = req.nextUrl
  const previewSecret = searchParams.get('previewSecret')
  const path = searchParams.get('path') || '/'

  if (previewSecret !== env.previewSecret) {
    return new Response('Invalid preview secret', { status: 401 })
  }

  // Only allow internal paths — never redirect to an external origin.
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const dm = await draftMode()
  dm.enable()

  redirect(path)
}

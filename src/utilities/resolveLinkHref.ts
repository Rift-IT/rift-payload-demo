import type { Page } from '@/payload-types'

type LinkValue =
  | {
      type?: 'reference' | 'custom' | null
      url?: string | null
      reference?: number | Page | null
    }
  | null
  | undefined

/**
 * Resolves a `linkField` group to an href. Internal references resolve to the
 * page's slug-derived path; the home page resolves to "/".
 */
export const resolveLinkHref = (link: LinkValue): string | null => {
  if (!link) return null
  if (link.type === 'custom') return link.url ?? null
  const ref = link.reference
  if (ref && typeof ref === 'object') {
    const slug = (ref as { slug?: string }).slug
    if (!slug || slug === 'home') return '/'
    return `/${slug}`
  }
  return null
}

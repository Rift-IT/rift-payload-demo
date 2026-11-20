import { slugify } from '@/utilities/slugify'

const BRACKET_SEGMENT = /^\[.+\]$/
const TOKEN_SEGMENT = /^:[a-zA-Z][a-zA-Z0-9_]*$/

export type PathOptions = {
  // When true, segments shaped like `:id` / `:slug` are preserved verbatim.
  // SeoEntries uses `[id]` brackets (Next route-folder convention); Redirects
  // uses `:id` colons (Next config redirects convention). Same helpers, two
  // dialects.
  allowTokens?: boolean
}

export const slugFromPath = (path: string): string =>
  path === '/' ? 'home' : path.replace(/^\//, '')

export const normalizePath = (
  { value }: { value?: unknown },
  options: PathOptions = {},
): string | undefined => {
  if (typeof value !== 'string') return undefined
  let v = value.trim()
  if (v.length === 0) return v
  if (!v.startsWith('/')) v = `/${v}`
  if (v.length > 1 && v.endsWith('/')) v = v.slice(0, -1)
  if (v === '/') return v
  return v
    .split('/')
    .map((segment) => {
      if (segment.length === 0) return segment
      if (BRACKET_SEGMENT.test(segment)) return segment
      if (options.allowTokens) {
        if (TOKEN_SEGMENT.test(segment)) return segment
        // Preserve a malformed ":token" verbatim so validatePath can reject it
        // with a clear message instead of slugify silently hiding the typo.
        if (segment.startsWith(':')) return segment
      }
      return slugify(segment)
    })
    .join('/')
}

export const validatePath = (value: unknown, options: PathOptions = {}): true | string => {
  if (typeof value !== 'string' || value.length === 0) {
    return 'Path is required.'
  }
  if (!value.startsWith('/')) {
    return 'Path must start with "/".'
  }
  // Block protocol-relative ("//host") and backslash-smuggled paths — browsers
  // resolve "//evil.com/x" as an absolute URL, turning an internal redirect
  // into an open redirect to an external host.
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return 'Path must not start with "//" or "/\\".'
  }
  if (value.length > 1 && value.endsWith('/')) {
    return 'Path must not end with "/" (except the home page "/").'
  }
  if (/\s/.test(value)) {
    return 'Path must not contain whitespace.'
  }
  if (/^\/(admin|api)(\/|$)/i.test(value)) {
    return 'Path must not point to /admin or /api.'
  }
  if (options.allowTokens) {
    for (const segment of value.split('/')) {
      if (segment.length === 0) continue
      if (BRACKET_SEGMENT.test(segment)) continue
      if (TOKEN_SEGMENT.test(segment)) continue
      if (segment.startsWith(':')) {
        return `Invalid token syntax in "${segment}". Tokens must start with a letter, e.g. ":id" or ":slug".`
      }
    }
  }
  return true
}

export const extractTokens = (path: string): string[] => {
  const tokens: string[] = []
  const re = /:([a-zA-Z][a-zA-Z0-9_]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(path)) !== null) tokens.push(m[1])
  return tokens
}

// Lightweight normalize for redirect destinations (toPath). Unlike normalizePath
// this does NOT slugify segments — toPath is a destination, not an identifier,
// so admin-authored query strings, hash fragments, and mixed-case paths must
// survive verbatim. Only structural normalization is applied.
export const normalizeUrlTarget = ({ value }: { value?: unknown }): string | undefined => {
  if (typeof value !== 'string') return undefined
  let v = value.trim()
  if (v.length === 0) return v
  if (/^https?:\/\//i.test(v)) return v
  if (!v.startsWith('/')) v = `/${v}`
  if (v.length > 1 && v.endsWith('/')) v = v.slice(0, -1)
  return v
}

// Validates a redirect destination. Accepts query strings, hash fragments, and
// full external URLs; keeps the same structural safety as validatePath.
export const validateUrlTarget = (value: unknown, options: PathOptions = {}): true | string => {
  if (typeof value !== 'string' || value.length === 0) {
    return 'Path is required.'
  }
  if (/^https?:\/\//i.test(value)) return true
  if (!value.startsWith('/')) {
    return 'Path must start with "/" or be a full URL (https://…).'
  }
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return 'Path must not start with "//" or "/\\".'
  }
  if (/\s/.test(value)) {
    return 'Path must not contain whitespace.'
  }
  if (/^\/(admin|api)(\/|$|\?|#)/i.test(value)) {
    return 'Path must not point to /admin or /api.'
  }
  if (options.allowTokens) {
    const queryIdx = value.search(/[?#]/)
    const pathOnly = queryIdx === -1 ? value : value.slice(0, queryIdx)
    if (pathOnly.length > 1 && pathOnly.endsWith('/')) {
      return 'Path must not end with "/" (except the home page "/").'
    }
    for (const segment of pathOnly.split('/')) {
      if (segment.length === 0) continue
      if (BRACKET_SEGMENT.test(segment)) continue
      if (TOKEN_SEGMENT.test(segment)) continue
      if (segment.startsWith(':')) {
        return `Invalid token syntax in "${segment}". Tokens must start with a letter, e.g. ":id" or ":slug".`
      }
    }
  } else if (value.length > 1 && value.endsWith('/') && !/[?#]/.test(value)) {
    return 'Path must not end with "/" (except the home page "/").'
  }
  return true
}

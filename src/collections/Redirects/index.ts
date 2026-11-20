import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import {
  extractTokens,
  normalizePath,
  normalizeUrlTarget,
  validatePath,
  validateUrlTarget,
} from '@/utilities/pathNormalization'

import { derivePathDefaults } from './hooks/derivePathDefaults'
import {
  revalidateRedirectsCache,
  revalidateRedirectsCacheDelete,
} from './hooks/revalidateRedirectsCache'

const HTTP_STATUS_CODES = [301, 302, 307, 308, 410]

const normalizeFromPathHook = ({ value }: { value?: unknown }) => {
  // Skip slugify when value contains `?`/`#` so validateFromPath can reject it
  // with a clear message instead of silently mangling it.
  if (typeof value === 'string' && /[?#]/.test(value)) return value.trim()
  return normalizePath({ value }, { allowTokens: true })
}

const validateFromPath: TextFieldSingleValidation = async (
  value,
  { req, operation, previousValue, siblingData },
) => {
  if (typeof value === 'string') {
    if (value.includes('?')) {
      return 'The "from" field matches the path only, not query parameters. Use e.g. "/old-page".'
    }
    if (value.includes('#')) {
      return 'The "from" field cannot match hash fragments (#). Use the path only, e.g. "/old-page".'
    }
  }
  const formatResult = validatePath(value, { allowTokens: true })
  if (formatResult !== true) return formatResult
  if (typeof value !== 'string') return true

  const source = (siblingData as { source?: string } | undefined)?.source
  if (source === 'auto-seo-change') return true
  if (operation === 'update' && previousValue === value) return true

  // A redirect must not shadow a live page URL.
  const collision = await req.payload.find({
    collection: 'seo-entries',
    where: { and: [{ path: { equals: value } }, { source: { equals: 'page' } }] },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  })
  if (collision.docs.length > 0) {
    return `The path "${value}" is used by an existing page. Move or delete the page first.`
  }
  return true
}

/**
 * 301/302/307/308/410 redirects. Manually authored, or auto-created when a SEO
 * entry's path changes. The Next middleware applies active rows on each request.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  access: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // Middleware reads via the Local API with overrideAccess, so no public read.
    read: isAdmin,
  },
  admin: {
    group: 'Marketing',
    description: 'Manage 301/302/410 redirects for the site.',
    useAsTitle: 'fromPath',
    defaultColumns: ['fromPath', 'toPath', 'statusCode', 'isActive', 'source', 'updatedAt'],
    listSearchableFields: ['fromPath', 'toPath', 'note'],
  },
  hooks: {
    beforeValidate: [derivePathDefaults],
    afterChange: [revalidateRedirectsCache],
    afterDelete: [revalidateRedirectsCacheDelete],
  },
  fields: [
    {
      name: 'fromPath',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'From (URL)',
      admin: { description: 'The old URL, e.g. "/old-page" or "/orders/:id".' },
      hooks: { beforeValidate: [normalizeFromPathHook] },
      validate: validateFromPath,
    },
    {
      name: 'statusPreset',
      type: 'select',
      required: true,
      defaultValue: 'permanent',
      label: 'Type',
      options: [
        { label: 'Permanent (301)', value: 'permanent' },
        { label: 'Temporary (302)', value: 'temporary' },
        { label: 'Gone (410)', value: 'gone' },
        { label: 'Advanced…', value: 'advanced' },
      ],
      admin: { description: 'Choose "Advanced" to set the HTTP status code manually.' },
    },
    {
      name: 'statusCode',
      type: 'number',
      required: true,
      defaultValue: 301,
      label: 'HTTP status code',
      admin: {
        condition: (data) => data?.statusPreset === 'advanced',
        description: '301/302/307/308 redirect. 410 marks the URL as permanently gone.',
      },
      validate: (value: unknown) =>
        HTTP_STATUS_CODES.includes(Number(value))
          ? true
          : 'Status code must be 301, 302, 307, 308, or 410.',
    },
    {
      name: 'toPath',
      type: 'text',
      label: 'To (URL or external address)',
      admin: {
        condition: (data) => data?.statusPreset !== 'gone',
        description:
          'Internal path ("/new-page"), path with query, or full external URL ("https://…"). Tokens like ":id" are supported if they also appear in the From field.',
      },
      hooks: { beforeValidate: [({ value }) => normalizeUrlTarget({ value })] },
      validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        const isGone =
          siblingData?.statusPreset === 'gone' || Number(siblingData?.statusCode) === 410
        if (isGone) return true
        if (typeof value !== 'string' || value.length === 0) return 'The "to" field is required.'
        if (typeof siblingData?.fromPath === 'string' && value === siblingData.fromPath) {
          return 'From and To must not be identical.'
        }
        const pathValid = validateUrlTarget(value, { allowTokens: true })
        if (pathValid !== true) return pathValid
        if (/^https?:\/\//i.test(value)) return true

        // Every :token in toPath must also appear in fromPath.
        const fromTokens = new Set(
          extractTokens(typeof siblingData?.fromPath === 'string' ? siblingData.fromPath : ''),
        )
        for (const t of extractTokens(value)) {
          if (!fromTokens.has(t)) return `Token ":${t}" in the To field does not exist in From.`
        }
        return true
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        components: { Cell: '@/components/admin/BooleanIconCell#BooleanIconCell' },
        description: 'Turn off to temporarily disable without deleting.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      label: 'Created by',
      access: { update: () => false },
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic (SEO path change)', value: 'auto-seo-change' },
        { label: 'Imported', value: 'imported' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'createdFromSeoEntry',
      type: 'relationship',
      relationTo: 'seo-entries',
      label: 'Associated SEO entry',
      admin: {
        condition: (data) => data?.source === 'auto-seo-change',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Note',
      admin: { description: 'Internal note, e.g. why this redirect exists.' },
    },
  ],
}

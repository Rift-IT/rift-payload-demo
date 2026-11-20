'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type SeoEntry = { id: number | string; path: string }

/**
 * Sidebar UI field on Pages: links to the page's linked SEO entry (where the
 * canonical URL + meta live), or offers to create one on demand via the
 * /ensure-seo-entry endpoint.
 */
export const PageSeoLinkField: React.FC = () => {
  const { id } = useDocumentInfo()
  const [entry, setEntry] = useState<SeoEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!id) return
    try {
      const params = new URLSearchParams({
        'where[page][equals]': String(id),
        limit: '1',
        depth: '0',
      })
      const res = await fetch(`/api/seo-entries?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) return
      const data = (await res.json()) as { docs: SeoEntry[] }
      setEntry(data.docs?.[0] ?? null)
    } catch {
      /* ignore */
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pages/${id}/ensure-seo-entry`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) setError(data.error ?? 'Could not create SEO entry')
      else await refresh()
    } catch {
      setError('Could not create SEO entry')
    } finally {
      setLoading(false)
    }
  }, [id, refresh])

  if (!id) {
    return <p style={{ color: 'var(--theme-elevation-400)', fontSize: 13 }}>Save the page first.</p>
  }

  return (
    <div style={{ fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>SEO &amp; URL</div>
      {entry ? (
        <a href={`/admin/collections/seo-entries/${entry.id}`}>Edit SEO entry ({entry.path})</a>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void create()}
            disabled={loading}
            className="btn btn--style-secondary btn--size-small"
          >
            {loading ? 'Creating…' : 'Create SEO entry'}
          </button>
          {error && <p style={{ color: 'var(--theme-error-500)', marginTop: 4 }}>{error}</p>}
        </>
      )}
    </div>
  )
}

export default PageSeoLinkField

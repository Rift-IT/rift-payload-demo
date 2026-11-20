import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const severityColor: Record<string, string> = {
  info: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}

/**
 * Dashboard widget (admin.components.beforeDashboard) showing the most recent
 * activity-log entries. Server component — reads directly via the Local API.
 */
export const ActivityPulse: React.FC = async () => {
  let docs: Array<{
    id: number | string
    summary: string
    severity: string
    source?: string | null
    createdAt: string
  }> = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'activity-log',
      sort: '-createdAt',
      limit: 8,
      depth: 0,
      overrideAccess: true,
    })
    docs = result.docs as typeof docs
  } catch {
    // activity-log may not exist yet (first boot before migrations) — render nothing.
    return null
  }

  if (docs.length === 0) return null

  return (
    <section
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: 'var(--base)',
      }}
    >
      <h3
        style={{
          margin: '0 0 0.75rem',
          fontSize: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--theme-elevation-500)',
        }}
      >
        Recent activity
      </h3>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {docs.map((d) => (
          <li key={d.id} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: severityColor[d.severity] ?? '#9ca3af',
                flexShrink: 0,
                transform: 'translateY(1px)',
              }}
            />
            <span style={{ flex: 1, fontSize: 13 }}>{d.summary}</span>
            <time
              dateTime={d.createdAt}
              style={{ fontSize: 11, color: 'var(--theme-elevation-400)', whiteSpace: 'nowrap' }}
            >
              {new Date(d.createdAt).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ActivityPulse

import type { Payload, PayloadRequest } from 'payload'

export type ActivityCategory = 'system' | 'user' | 'error'
export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error'

export type LogActivityOptions = {
  category: ActivityCategory
  severity: ActivitySeverity
  summary: string
  details?: Record<string, unknown>
  source?: string
  /** Pass req when calling from inside a hook to join the existing transaction. */
  req?: PayloadRequest
}

const RETENTION_DAYS = 90
const CLEANUP_PROBABILITY = 0.01 // 1% chance per call

/**
 * Log an activity event to the `activity-log` collection. Fire-and-forget safe
 * — never throws. Drives the admin "recent activity" dashboard widget.
 */
export async function logActivity(payload: Payload, options: LogActivityOptions): Promise<void> {
  try {
    await payload.create({
      collection: 'activity-log',
      overrideAccess: true,
      ...(options.req ? { req: options.req } : {}),
      data: {
        category: options.category,
        severity: options.severity,
        summary: options.summary,
        details: options.details ?? null,
        source: options.source ?? null,
      },
    })

    // Probabilistic retention sweep. Skipped when called inside a hook (req
    // provided) — a nested delete would need its own transaction and could
    // deadlock against the outer write lock on SQLite.
    if (!options.req && Math.random() < CLEANUP_PROBABILITY) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)
      try {
        await payload.delete({
          collection: 'activity-log',
          overrideAccess: true,
          where: { createdAt: { less_than: cutoff.toISOString() } },
        })
      } catch {
        // Cleanup failure is non-critical.
      }
    }
  } catch (err) {
    payload.logger.warn(
      `[logActivity] failed to write activity entry: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}

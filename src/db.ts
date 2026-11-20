import { sqliteAdapter } from '@payloadcms/db-sqlite'

import { env } from '@/env'

/**
 * SQLite adapter with a fix for development schema push.
 *
 * Bug in drizzle-kit (0.31.x): when it rebuilds a SQLite table, which happens
 * on the second start after you add a collection, it emits every
 * `CREATE INDEX` twice. The duplicate fails with "index ... already exists",
 * so one request errors before the schema is in sync. We drop exact duplicate
 * `CREATE INDEX` statements before they run. `apply()` runs the same array,
 * so editing it in place is enough. Nothing else changes.
 */
export function createDatabaseAdapter() {
  const sqlite = sqliteAdapter({
    client: { url: env.databaseUrl },
    // Syncs the schema automatically in development. Use migrations in production.
    push: process.env.NODE_ENV !== 'production',
  })

  return {
    ...sqlite,
    init: (...initArgs: Parameters<typeof sqlite.init>) => {
      const adapter = sqlite.init(...initArgs)
      const requireDrizzleKit = adapter.requireDrizzleKit

      adapter.requireDrizzleKit = () => {
        const kit = requireDrizzleKit()
        return {
          ...kit,
          pushSchema: async (...pushArgs: Parameters<typeof kit.pushSchema>) => {
            const result = await kit.pushSchema(...pushArgs)
            // drizzle-kit returns this array, but Payload's type leaves it out.
            const { statementsToExecute } = result as { statementsToExecute?: string[] }
            if (statementsToExecute) removeDuplicateIndexStatements(statementsToExecute)
            return result
          },
        }
      }

      return adapter
    },
  }
}

function removeDuplicateIndexStatements(statements: string[]): void {
  const seen = new Set<string>()
  const kept = statements.filter((statement) => {
    if (!/^CREATE (UNIQUE )?INDEX/i.test(statement.trim())) return true
    if (seen.has(statement)) return false
    seen.add(statement)
    return true
  })
  statements.splice(0, statements.length, ...kept)
}

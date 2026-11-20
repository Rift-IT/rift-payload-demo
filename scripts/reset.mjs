// Deletes the local SQLite database and uploaded media so the next
// `pnpm dev` starts from a fresh seed. Cross-platform (no rm -rf).
import { rmSync } from 'node:fs'

const targets = ['demo.db', 'demo.db-shm', 'demo.db-wal', 'public/media', '.next']

for (const target of targets) {
  rmSync(target, { recursive: true, force: true })
}

console.log('Reset done. Run `pnpm dev` to start with fresh demo data.')

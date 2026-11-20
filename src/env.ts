/**
 * Runtime configuration with demo defaults, so the project starts with no
 * `.env` file. Every value can be overridden with an environment variable
 * (see `.env.example`). Never ship the demo secrets to a public server.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL || 'file:./demo.db',
  payloadSecret: process.env.PAYLOAD_SECRET || 'demo-secret-change-me-in-production',
  previewSecret: process.env.PREVIEW_SECRET || 'demo-preview-secret',
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
}

/** The admin user created on first start (see `src/seed`). */
export const demoUser = {
  email: 'demo@therift.dev',
  password: 'demo1234',
  name: 'Demo Admin',
}

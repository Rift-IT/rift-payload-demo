import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Rift Payload Demo — Payload CMS + Next.js.',
  title: 'Rift Payload Demo',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="da">
      <body>
        <header className="rift-header">
          <a className="rift-header__brand" href="/">
            Rift Payload Demo
          </a>
          <nav className="rift-header__nav">
            <a href="/api/pages">API</a>
            <a className="rift-button rift-button--small" href="/admin">
              Admin-panel
            </a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="rift-footer">
          Bygget med Payload CMS og Next.js · <a href="/sitemap.xml">sitemap.xml</a>
        </footer>
      </body>
    </html>
  )
}

import React from 'react'

/** Rendered at the bottom of the admin nav (admin.components.afterNavLinks). */
export const AfterNavLinks: React.FC = () => (
  <div
    style={{
      marginTop: 'auto',
      padding: 'var(--base) 0',
      fontSize: 11,
      color: 'var(--theme-elevation-400)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}
  >
    Rift Payload Demo
  </div>
)

export default AfterNavLinks

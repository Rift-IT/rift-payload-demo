import React from 'react'

/** Full wordmark shown at the top of the admin nav. */
export const RiftLogo: React.FC = () => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0' }}
    aria-label="The Rift"
  >
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="28" rx="1.5" fill="#52525b" />
      <rect x="18" y="2" width="12" height="28" rx="1.5" fill="#a1a1aa" />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: 'var(--theme-text)',
        }}
      >
        RIFT
      </span>
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--theme-elevation-500)',
          marginTop: '4px',
        }}
      >
        Demo
      </span>
    </div>
  </div>
)

export default RiftLogo

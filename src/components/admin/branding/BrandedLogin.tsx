import React from 'react'

/** Shown above the login form (admin.components.beforeLogin). */
export const BrandedLogin: React.FC = () => (
  <div
    style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: 'var(--theme-elevation-700)',
      lineHeight: 1.55,
      marginBottom: '12px',
    }}
  >
    <h2
      style={{
        fontSize: '20px',
        fontWeight: 600,
        color: 'var(--theme-text)',
        margin: '0 0 8px 0',
        letterSpacing: '-0.01em',
      }}
    >
      Welcome to The Rift
    </h2>
    <p style={{ margin: 0, fontSize: '14px' }}>
      {process.env.NODE_ENV === 'development' ? (
        <>
          The demo login is filled in. Just click <strong>Login</strong>.
        </>
      ) : (
        'Sign in to manage your content.'
      )}
    </p>
  </div>
)

export default BrandedLogin

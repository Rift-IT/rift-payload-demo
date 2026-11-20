'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'

const initials = (name?: string | null, email?: string | null): string => {
  const base = (name && name.trim()) || (email && email.split('@')[0]) || '?'
  const parts = base.split(/[\s._-]+/).filter(Boolean)
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2)
  return letters.toUpperCase()
}

/** Initials avatar shown in the admin header (admin.avatar.Component). */
export const UserAvatar: React.FC = () => {
  const { user } = useAuth()
  const label = initials((user as { name?: string } | null)?.name, user?.email)
  return (
    <div
      aria-label="Account"
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #52525b, #a1a1aa)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </div>
  )
}

export default UserAvatar

'use client'

import React from 'react'

/** List-view cell that renders a boolean as a check / dash icon. */
export const BooleanIconCell: React.FC<{ cellData?: unknown }> = ({ cellData }) => {
  const on = Boolean(cellData)
  return (
    <span
      aria-label={on ? 'Yes' : 'No'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: on ? '#22c55e' : '#9ca3af',
        fontWeight: 700,
      }}
    >
      {on ? '✓' : '—'}
    </span>
  )
}

export default BooleanIconCell

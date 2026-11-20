import React from 'react'

/** The Rift mark: two offset bars forming a rift. Used as the admin favicon/icon. */
export const RiftIcon: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="The Rift"
    style={{ display: 'block' }}
  >
    <rect x="2" y="2" width="12" height="28" rx="1.5" fill="#52525b" />
    <rect x="18" y="2" width="12" height="28" rx="1.5" fill="#a1a1aa" />
  </svg>
)

export default RiftIcon

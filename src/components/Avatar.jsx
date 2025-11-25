import React from 'react'

export default function Avatar({ size = 40, src, alt = 'User' }) {
  // Simple avatar — shows image if provided, otherwise initials placeholder
  return (
    <div
      className="flex items-center justify-center bg-sky-100 text-sky-700 font-semibold"
      style={{ width: size, height: size, borderRadius: '50%' }}
      title={alt}
    >
      {src ? <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" /> : 'JD'}
    </div>
  )
}

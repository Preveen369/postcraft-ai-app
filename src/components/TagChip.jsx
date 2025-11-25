import React from 'react'

export default function TagChip({ text }) {
  return (
    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-sm text-gray-700 rounded-full mr-2">
      {text}
    </span>
  )
}

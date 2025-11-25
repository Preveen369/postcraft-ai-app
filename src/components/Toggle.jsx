import React from 'react'

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/generator', label: 'Post Generator' },
  { to: '/tutorial', label: 'How To Use' },
  { to: '/assistant', label: 'AI Assistant' },
]

export default function Sidebar({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => onNavigate && onNavigate()}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm flex items-center justify-between ${
              isActive ? 'bg-gray-100 font-semibold' : 'text-gray-700'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

/*
  MainLayout
  - Wraps pages with a navbar and sidebar.
  - Handles mobile sidebar toggle.
*/
export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setMobileOpen((s) => !s)} />
      <div className="flex flex-1">
        {/* Sidebar: hidden on small screens; slide-in drawer when mobileOpen */}
        <aside className={`bg-white border-r border-gray-100 w-64 p-4 hidden md:block`}>
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black opacity-30" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

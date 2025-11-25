/*
  Navbar
  - Left: menu button (for mobile) + app name
  - Center: optional search placeholder
  - Right: avatar and settings icon
*/
export default function Navbar({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-md" onClick={onMenuClick} aria-label="Open menu">
          {/* simple hamburger */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <a href="/" className="text-2xl font-bold text-sky-700 tracking-tight">PostCraft AI</a>
      </div>

      {/* Search bar and settings icon removed */}

      <div className="flex items-center gap-3">
        <a
          href="https://www.linkedin.com/in/selvanathan-n"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit Selvanathan's LinkedIn profile"
        >
          <img
            src="/linkedin-icon.png"
            alt="LinkedIn"
            className="w-9 h-9 rounded-full object-contain bg-white border"
          />
        </a>
      </div>
    </header>
  )
}

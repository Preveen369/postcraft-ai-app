export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 mt-8 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
        <span>
          © {new Date().getFullYear()} PostCraft AI. All rights reserved.
        </span>
        <span>
          Made with <span className="text-red-500">💖</span> by <a href="https://www.linkedin.com/in/selvanathan-n" target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">Selvanathan N</a>
        </span>
      </div>
    </footer>
  )
}

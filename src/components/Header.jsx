import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthed = !!localStorage.getItem('cf_token')

  function handleSignOut() {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-silver opacity-60 text-xs font-mono tracking-widest uppercase group-hover:opacity-100 transition-opacity">
            ✦
          </span>
          <span className="font-serif italic text-xl tracking-tight">
            <span className="text-accent">Class</span>
            <span className="text-on-surface">Folio</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-on-surface-muted">
          <Link
            to="/"
            className={`hover:text-on-surface transition-colors ${location.pathname === '/' ? 'text-on-surface' : ''}`}
          >
            Gallery
          </Link>
          {isAuthed && (
            <Link
              to="/dashboard"
              className={`hover:text-on-surface transition-colors ${location.pathname === '/dashboard' ? 'text-on-surface' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth */}
        {isAuthed ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-mono text-xs text-on-surface-muted">
              {localStorage.getItem('cf_user') || 'Student'}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-1.5 font-mono text-xs uppercase tracking-widest border border-outline text-on-surface-muted hover:border-silver hover:text-on-surface transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 font-mono text-xs uppercase tracking-widest border border-accent text-accent hover:bg-accent hover:text-surface transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}

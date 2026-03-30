import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Paper plane SVG path
function PaperPlane({ style, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const PLANES = [
  { top: '15%', left: '8%',  size: 28, delay: '0s',   dur: '22s', rotate: '15deg' },
  { top: '60%', left: '5%',  size: 20, delay: '-6s',  dur: '18s', rotate: '25deg' },
  { top: '30%', right: '6%', size: 32, delay: '-10s', dur: '26s', rotate: '-10deg' },
  { top: '75%', right: '10%',size: 22, delay: '-4s',  dur: '20s', rotate: '5deg'  },
  { top: '45%', left: '50%', size: 18, delay: '-14s', dur: '24s', rotate: '20deg' },
]

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [tab, setTab] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Redirect if already authed
  useEffect(() => {
    if (auth.user) navigate('/dashboard')
  }, [auth.user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { mustResetPassword } = await auth.login({ studentId: email, password, role: tab })
      if (mustResetPassword) {
        navigate('/dashboard?forceReset=true')
      } else {
        navigate('/dashboard')
      }
    } catch {
      // error is stored in auth.error
    }
  }

  return (
    <div
      className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: `repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(148,163,184,0.055) 27px, rgba(148,163,184,0.055) 28px)`,
      }}
    >
      {/* Drifting paper planes background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {PLANES.map((plane, i) => (
          <div
            key={i}
            className="absolute text-silver/20"
            style={{
              top: plane.top,
              left: plane.left,
              right: plane.right,
              width: plane.size,
              height: plane.size,
              transform: `rotate(${plane.rotate})`,
              animation: `planeDrift ${plane.dur} linear ${plane.delay} infinite`,
            }}
          >
            <PaperPlane style={{ width: '100%', height: '100%', color: '#94a3b8' }} />
          </div>
        ))}
      </div>

      {/* CSS for plane drift */}
      <style>{`
        @keyframes planeDrift {
          0%   { transform: translateX(0px) translateY(0px) rotate(15deg); opacity: 0; }
          5%   { opacity: 1; }
          50%  { transform: translateX(40px) translateY(-30px) rotate(20deg); opacity: 0.6; }
          95%  { opacity: 0.3; }
          100% { transform: translateX(80px) translateY(-60px) rotate(25deg); opacity: 0; }
        }
      `}</style>

      {/* Back to gallery */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-on-surface-muted hover:text-accent transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
        Gallery
      </Link>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-serif italic text-4xl">
              <span className="text-accent">Class</span>
              <span className="text-on-surface">Folio</span>
            </span>
          </Link>
          <p className="font-mono text-xs text-on-surface-muted mt-2 uppercase tracking-widest">
            Your portfolio, your story
          </p>
        </div>

        <div className="bg-surface-raised border border-outline p-8 space-y-6">
          {/* Tab toggle */}
          <div className="grid grid-cols-2 border border-outline">
            {['student', 'instructor'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  tab === t
                    ? 'bg-accent text-surface'
                    : 'text-on-surface-muted hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={tab === 'student' ? 'student@demo.com' : 'instructor@demo.com'}
                className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface border border-outline px-3 py-2.5 pr-10 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#e8b84b]" />
                <span className="font-mono text-[11px] text-on-surface-muted">Remember me</span>
              </label>
              <button type="button" className="font-mono text-[11px] text-silver hover:text-on-surface transition-colors">
                Forgot password?
              </button>
            </div>

            {auth.error && (
              <p className="font-mono text-xs text-red-400 border border-red-900/40 px-3 py-2 bg-red-900/10">
                {auth.error.message ?? 'Incorrect email or password.'}
              </p>
            )}

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full py-3 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {auth.loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 border border-surface border-t-transparent rounded-full"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-on-surface-muted text-center">
            New student?{' '}
            <span className="text-silver">Ask your instructor to create your account.</span>
          </p>
        </div>

        <p className="text-center font-mono text-[10px] text-on-surface-muted/40 mt-4">
          Ask your instructor for your login credentials.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

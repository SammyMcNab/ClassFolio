import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'

function formatRegisterError(err) {
  if (!err) return 'Registration failed. Try again.'
  if (typeof err.message === 'string' && err.message) return err.message
  if (typeof err.error === 'string' && err.error) return err.error
  return 'Registration failed. Check your registration code and try again.'
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '', secretCode: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError({ message: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Must match what you use to sign in (same identifier the auth API expects, usually full email).
      const studentId = form.email.trim()
      await register({
        studentId,
        displayName: form.displayName,
        email: form.email.trim(),
        password: form.password,
        secretCode: form.secretCode.trim(),
      })
      await login({ studentId, password: form.password, role: 'instructor' })
      navigate('/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: `repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(148,163,184,0.055) 27px, rgba(148,163,184,0.055) 28px)`,
      }}
    >
      {/* Back to login */}
      <Link
        to="/login"
        className="absolute top-6 left-6 flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-on-surface-muted hover:text-accent transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
        Sign In
      </Link>

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
            Instructor Registration
          </p>
        </div>

        <div className="bg-surface-raised border border-outline p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={set('displayName')}
                required
                placeholder="Ms. Johnson"
                className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                placeholder="instructor@school.edu"
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
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
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

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
                placeholder="••••••••"
                className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                Registration Code
              </label>
              <input
                type="text"
                value={form.secretCode}
                onChange={set('secretCode')}
                required
                autoComplete="off"
                placeholder="Provided by your institution"
                className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-red-400 border border-red-900/40 px-3 py-2 bg-red-900/10">
                {formatRegisterError(error)}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 border border-surface border-t-transparent rounded-full"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-on-surface-muted text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

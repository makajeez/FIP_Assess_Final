import { FormEvent, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui'

const DEMO_ACCOUNTS = [
  { label: 'Super Admin',     email: 'superadmin@abu.edu.ng',       password: 'superadmin123', role: 'superadmin' },
  { label: 'Registry Admin',  email: 'admin@abu.edu.ng',            password: 'admin123',      role: 'admin' },
  { label: 'Student (Buhari)',email: 'buhari@student.abu.edu.ng',   password: 'student123',    role: 'student' },
  { label: 'Student (Aisha)', email: 'aisha@student.abu.edu.ng',    password: 'student123',    role: 'student' },
]

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)
    try {
      await signIn({ email, password })
      // Redirect: prioritise the page they were trying to reach, else role home
      // useAuth triggers re-render; PublicOnly wrapper will redirect. But we
      // also navigate here for cases where the user came directly to /login.
      // We read role from the session just created via a tiny hack:
      const session = JSON.parse(localStorage.getItem('transcript_os_session') ?? '{}')
      const role = session?.user?.role
      const home = role === 'student' ? '/student/dashboard' : '/admin/dashboard'
      navigate(from ?? home, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-100 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full border-2 border-ink-800 flex items-center justify-center mx-auto mb-3">
            <span className="text-[9px] font-black tracking-tight text-center leading-tight text-ink-800">ABU<br/>1962</span>
          </div>
          <h1 className="text-xl font-serif font-semibold text-ink-900">TranscriptOS</h1>
          <p className="text-xs text-ink-400 mt-1">Ahmadu Bello University Registry</p>
        </div>

        {/* Form card */}
        <div className="card">
          <h2 className="text-sm font-semibold text-ink-700 mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-3.5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@abu.edu.ng"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
                {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Demo quick-login */}
        <div className="mt-5">
          <p className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-400 text-center mb-2.5">
            Demo accounts (click to fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => quickFill(acc)}
                className="text-left px-3 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 hover:border-ink-300 transition-all group"
              >
                <p className="text-[11px] font-semibold text-ink-700 group-hover:text-ink-900 truncate">{acc.label}</p>
                <p className="text-[10px] text-ink-400 truncate">{acc.email}</p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  acc.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                  acc.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {acc.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

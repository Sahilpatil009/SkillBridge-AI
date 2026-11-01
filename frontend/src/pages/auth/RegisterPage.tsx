import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../lib/api'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { AuthResponse } from '../../types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const validatePassword = (value: string) => {
    if (value.length > 0 && value.length < 8) {
      setPasswordError('Password must be at least 8 characters')
    } else {
      setPasswordError(null)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    validatePassword(e.target.value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/api/v1/auth/register', { name, email, password })
      login(res.data.access_token, res.data.user)
      navigate('/app/onboarding', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e?.response?.data?.detail ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              <span className="font-mono font-black text-sm">[S]</span>
            </div>
            <div className="flex items-baseline font-black tracking-tight text-neutral-900 text-xl uppercase font-sans">
              <span>SKILLBRIDGE</span>
              <span className="text-pink-500 font-mono text-lg font-bold ml-1">.AI</span>
            </div>
          </Link>
          <div className="neo-section-tag justify-center mt-2">
            <span className="w-2 h-2 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>CREATE PROFILE</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
            Initialize your engineering profile
          </h1>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block font-mono text-xs font-bold text-neutral-700 uppercase mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Sanskar Sharma"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-mono text-xs font-bold text-neutral-700 uppercase mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="developer@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-mono text-xs font-bold text-neutral-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 font-mono text-xs text-rose-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !!passwordError}
              className="btn-primary w-full py-3"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'INITIALIZING...' : 'CREATE FREE PROFILE'}</span>
            </button>
          </form>

          <div className="my-5 border-t border-black/10"></div>

          <p className="text-center font-mono text-xs text-neutral-600">
            Already have an active profile?{' '}
            <Link to="/login" className="font-bold text-black underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

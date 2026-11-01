import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api, { getApiErrorMessage } from '../../lib/api'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { AuthResponse } from '../../types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/api/v1/auth/login', { email, password })
      login(res.data.access_token, res.data.user)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please verify your credentials.'))
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
            <span>ENGINEERING WORKSPACE ACCESS</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
            Authenticate to your profile
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'AUTHENTICATING...' : 'ACCESS WORKSPACE'}</span>
            </button>
          </form>

          <div className="my-5 border-t border-black/10"></div>

          <p className="text-center font-mono text-xs text-neutral-600">
            Don't have an engineering profile?{' '}
            <Link to="/register" className="font-bold text-black underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

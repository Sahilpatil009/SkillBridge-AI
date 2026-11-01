import axios, { AxiosError } from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL
const apiBase =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl
    : import.meta.env.PROD
      ? ''
      : 'http://localhost:8000'

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_FORM_PATHS = ['/auth/login', '/auth/register']
const PUBLIC_PAGES = ['/login', '/register']

function requestPath(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url, apiBase || window.location.origin).pathname
  } catch {
    return url
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return ''
      })
      .filter(Boolean)
    if (messages.length) return messages.join(' ')
  }
  return fallback
}

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Send expired sessions to login, but never wipe the login/register forms.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const path = requestPath(error.config?.url)
    const onAuthForm = AUTH_FORM_PATHS.some((prefix) => path.includes(prefix))
    const alreadyPublic = PUBLIC_PAGES.includes(window.location.pathname)

    if (status === 401 && !onAuthForm) {
      localStorage.removeItem('access_token')
      if (!alreadyPublic) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

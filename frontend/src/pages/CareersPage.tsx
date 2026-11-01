import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Search, Star, CheckCircle, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

interface Career {
  id: number
  title: string
  slug: string
  description: string
  is_active: boolean
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [targetCareerId, setTargetCareerId] = useState<number | null>(null)
  const [settingTarget, setSettingTarget] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/v1/careers/target')
      .then((res) => setTargetCareerId(res.data.target?.career_id ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get('/api/v1/careers', { params: { search } })
      .then((res) => setCareers(res.data))
      .catch(() => setError('Failed to load careers.'))
      .finally(() => setLoading(false))
  }, [search])

  const handleSetTarget = async (careerId: number) => {
    setSettingTarget(careerId)
    try {
      await api.put('/api/v1/careers/target', { career_id: careerId })
      await api.post('/api/v1/skill-gap/recalculate')
      setTargetCareerId(careerId)
    } catch {
      // silent
    } finally {
      setSettingTarget(null)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="neo-section-tag mb-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>ENGINEERING DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
            Explore Target <span className="neo-highlight">Engineering Careers</span>
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Select a target role to initialize your automated skill benchmark and personalized curriculum.
          </p>
        </div>

        {targetCareerId && (
          <div className="bg-[#D1FAE5] border-2 border-black rounded-xl px-4 py-2 shadow-[2px_2px_0px_#18181B] flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-800" />
            <span className="font-mono text-xs font-bold text-neutral-900 uppercase">
              Target Career Active
            </span>
            <Link
              to={`/app/careers/${targetCareerId}`}
              className="font-mono text-xs font-bold text-neutral-900 underline ml-1"
            >
              Inspect →
            </Link>
          </div>
        )}
      </div>

      {/* Search Bar matching Screenshot input style */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          className="input-field pl-11"
          placeholder="Filter careers (e.g. AI Engineer, Full-Stack, Cloud)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {loading ? (
        <LoadingSpinner text="Querying career index..." />
      ) : careers.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No careers matched"
          description="Try adjusting your search terms to explore available engineering roles."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map((career) => {
            const isTarget = targetCareerId === career.id
            return (
              <div
                key={career.id}
                className="card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      ROLE TRACK / VERIFIED
                    </span>
                    <Link
                      to={`/app/careers/${career.id}`}
                      className="w-8 h-8 rounded-full bg-white border border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#18181B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                      aria-label="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </Link>
                  </div>

                  <h3 className="text-xl font-black text-neutral-900 tracking-tight font-sans mb-2">
                    {career.title}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {career.description}
                  </p>
                </div>

                {/* Divider Line */}
                <div className="my-4 border-t-2 border-black"></div>

                <div className="flex items-center justify-between gap-2">
                  <span className={isTarget ? 'badge-green' : 'badge-gray'}>
                    {isTarget ? 'TARGET SELECTED' : 'AVAILABLE'}
                  </span>

                  {isTarget ? (
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetTarget(career.id)}
                      disabled={settingTarget === career.id}
                      className="btn-primary text-[10px] py-1.5 px-3.5"
                    >
                      {settingTarget === career.id ? 'CONNECTING...' : 'SET AS TARGET'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
